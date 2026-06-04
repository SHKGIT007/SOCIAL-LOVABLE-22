const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, SystemSetting } = require("../App/Models");
const logger = require("../App/Connection/logger");

module.exports = function (app) {
  // Facebook Login/Signup Initiation Route
  app.get(["/auth/facebook", "/backend/auth/facebook"], async (req, res) => {
    try {
      let settings = await SystemSetting.findByPk(1).catch(() => null);

      const app_id =
        (settings && settings.facebook_app_id) ||
        process.env.FACEBOOK_APP_ID;

      if (!app_id) {
        return res.status(500).json({
          error: "Facebook App ID not configured",
        });
      }

      const prefix = req.path.startsWith("/backend") ? "/backend" : "";
      const forwardedProto = req.get("x-forwarded-proto") || req.protocol;
      const forwardedHost = req.get("x-forwarded-host") || req.get("host");
      const forwardedPrefix =
        req.get("x-forwarded-prefix") ||
        req.headers["x-forwarded-prefix"] ||
        prefix;

      let backendBase = process.env.BACKEND_URL
        ? process.env.BACKEND_URL.replace(/\/$/, "")
        : `${forwardedProto}://${forwardedHost}${forwardedPrefix}`;

      try {
        const reqHost = (req.get("host") || "").toLowerCase();
        if (!process.env.BACKEND_URL && reqHost === "socialvibe.tradestreet.in") {
          backendBase = `https://${reqHost}/backend`;
        }
      } catch (e) { }

      const redirect_uri = `${backendBase}/auth/facebook/callback`;

      let redirect_dashboard =
        req.query.redirect_dashboard ||
        req.get("referer") ||
        process.env.FRONTEND_URL ||
        `${req.protocol}://${req.get("host")}`;

      const action = req.query.action || "signup";

      const state = encodeURIComponent(
        JSON.stringify({ redirect_dashboard, action })
      );

      const scope = "email,public_profile";
      const facebookUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${encodeURIComponent(
        app_id
      )}&redirect_uri=${encodeURIComponent(
        redirect_uri
      )}&scope=${encodeURIComponent(scope)}&state=${state}&response_type=code`;

      return res.redirect(facebookUrl);
    } catch (error) {
      logger.error("Facebook OAuth initiation error", { error: error.message });
      return res.status(500).json({
        error: "Facebook authentication failed",
        message: error.message,
      });
    }
  });

  // Facebook Callback Route
  app.get(
    ["/auth/facebook/callback", "/backend/auth/facebook/callback"],
    async (req, res) => {
      try {

        const code = req.query.code;
        const error = req.query.error;
        const error_description = req.query.error_description;
        const rawState = req.query.state;


        let state = {};
        try {
          const decodedState = decodeURIComponent(rawState || "{}");
          state = JSON.parse(decodedState);
        } catch (e) {
          state = {};
        }

        // Handle Facebook errors
        if (error) {
          const frontendBase = state.redirect_dashboard || process.env.FRONTEND_URL || "http://localhost:3000";
          const frontend = new URL(frontendBase).origin;
          return res.redirect(
            `${frontend}/auth?social_error=facebook_denied&error=${encodeURIComponent(error_description || "User cancelled login")}`
          );
        }

        if (!code) {
          const frontendBase = state.redirect_dashboard || process.env.FRONTEND_URL || "http://localhost:3000";
          const frontend = new URL(frontendBase).origin;
          return res.redirect(
            `${frontend}/auth?social_error=no_code`
          );
        }

        let settings = await SystemSetting.findByPk(1).catch(() => null);

        const app_id =
          (settings && settings.facebook_app_id) ||
          process.env.FACEBOOK_APP_ID;

        const app_secret =
          (settings && settings.facebook_app_secret) ||
          process.env.FACEBOOK_APP_SECRET;

        if (!app_id || !app_secret) {
          logger.error("Facebook OAuth credentials missing");
          const frontend = new URL(state.redirect_dashboard || process.env.FRONTEND_URL).origin;
          return res.redirect(
            `${frontend}/auth?social_error=config_error`
          );
        }

        const prefix = req.path.startsWith("/backend") ? "/backend" : "";
        const forwardedProto = req.get("x-forwarded-proto") || req.protocol;
        const forwardedHost = req.get("x-forwarded-host") || req.get("host");
        const forwardedPrefix =
          req.get("x-forwarded-prefix") ||
          req.headers["x-forwarded-prefix"] ||
          prefix;

        let backendBase = process.env.BACKEND_URL
          ? process.env.BACKEND_URL.replace(/\/$/, "")
          : `${forwardedProto}://${forwardedHost}${forwardedPrefix}`;

        try {
          const reqHost = (req.get("host") || "").toLowerCase();
          if (
            !process.env.BACKEND_URL &&
            reqHost === "socialvibe.tradestreet.in"
          ) {
            backendBase = `https://${reqHost}/backend`;
          }
        } catch (e) { }

        const redirect_uri = `${backendBase}/auth/facebook/callback`;

        // Step 1: Exchange code for access token
        const tokenRes = await axios.get(
          "https://graph.facebook.com/v20.0/oauth/access_token",
          {
            params: {
              client_id: app_id,
              client_secret: app_secret,
              redirect_uri,
              code,
            },
          }
        );

        const access_token = tokenRes.data.access_token;

        // Step 2: Get user info from Facebook
        const userResponse = await axios.get(
          "https://graph.facebook.com/v20.0/me",
          {
            params: {
              access_token,
              fields: "id,name,email,picture.type(large),first_name,last_name",
            },
          }
        );

        const profile = userResponse.data;

        if (!profile.email) {
          const frontend = new URL(state.redirect_dashboard || process.env.FRONTEND_URL).origin;
          return res.redirect(
            `${frontend}/auth?social_error=email_not_granted`
          );
        }

        // Step 3: Look for existing user
        let user = await User.findOne({ where: { email: profile.email } });

        const action = state.action || "signup";

        if (action === "signup") {

          // For signup, reject if there's a VERIFIED user with this email
          if (user && user.is_email_verified) {
            const frontendBase = state.redirect_dashboard || process.env.FRONTEND_URL || "http://localhost:3000";
            const frontend = new URL(frontendBase).origin;
            return res.redirect(
              `${frontend}/auth?social_error=email_exists`
            );
          }

          // If unverified user exists, delete it
          if (user && !user.is_email_verified) {
            await User.destroy({ where: { id: user.id } });
          }

          // Create new user
          const randomPassword = Math.random().toString(36).slice(-12);
          const hashed = await bcrypt.hash(randomPassword, 12);

          const usernameBase = profile.email.split("@")[0];

          user = await User.create({
            user_name: `${usernameBase}_${Date.now()}`,
            email: profile.email,
            password: hashed,
            user_fname: profile.first_name || "",
            user_lname: profile.last_name || "",
            avatar_url: profile.picture?.data?.url || null,
            full_name: profile.name || "",
            is_email_verified: false,
            active_status: false,
            role_id: 2,
          });

          logger.info("New user created via Facebook OAuth", {
            userId: user.id,
            email: user.email,
          });

          // Create social token
          const socialToken = jwt.sign(
            { userId: user.id, social_signup: true },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
          );

          let frontendBase = state.redirect_dashboard || process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`;
          const frontend = new URL(frontendBase).origin;
          const redirectUrl = `${frontend}/complete-social-signup?social_token=${encodeURIComponent(
            socialToken
          )}&email=${encodeURIComponent(user.email)}`;

          return res.redirect(redirectUrl);
        } else if (action === "signin") {
          // Facebook signin flow - user already has account
          if (!user) {
            const frontend = new URL(state.redirect_dashboard || process.env.FRONTEND_URL).origin;
            return res.redirect(
              `${frontend}/auth?social_error=account_not_found`
            );
          }

          // For signin, only allow if email is verified
          if (!user.is_email_verified) {
            const frontend = new URL(state.redirect_dashboard || process.env.FRONTEND_URL).origin;
            return res.redirect(
              `${frontend}/auth?social_error=account_not_verified`
            );
          }

          if (user.is_deleted) {
            const frontend = new URL(state.redirect_dashboard || process.env.FRONTEND_URL).origin;
            return res.redirect(
              `${frontend}/auth?social_error=account_blocked`
            );
          }

          // Update user profile if needed
          user.avatar_url = profile.picture?.data?.url || user.avatar_url;
          user.full_name = profile.name || user.full_name;
          user.user_fname = profile.first_name || user.user_fname;
          user.user_lname = profile.last_name || user.user_lname;
          user.active_status = true;
          await user.save();

          // Generate authentication token
          const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: "12h",
          });

          logger.info("User logged in via Facebook OAuth", {
            userId: user.id,
            email: user.email,
          });

          const dashboard = state.redirect_dashboard || "/dashboard";
          const redirectUrl = `${dashboard}${dashboard.includes("?") ? "&" : "?"
            }token=${encodeURIComponent(token)}&success=true`;

          return res.redirect(redirectUrl);
        } else {
          // If action is not signup or signin, log and redirect with error
          const frontendBase = state.redirect_dashboard || process.env.FRONTEND_URL || "http://localhost:3000";
          const frontend = new URL(frontendBase).origin;
          return res.redirect(`${frontend}/auth?social_error=invalid_action`);
        }

      } catch (err) {
        if (err.response?.data) {
        }

        logger.error("Facebook OAuth callback error", {
          error: err.message,
          details: err.response?.data,
          stack: err.stack,
        });

        const frontend = process.env.FRONTEND_URL || "http://localhost:3000";
        const redirectUrl = `${frontend}/auth?social_error=auth_failed&error=${encodeURIComponent(err.message)}`;
        return res.redirect(redirectUrl);
      }
    }
  );
};

