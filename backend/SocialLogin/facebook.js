const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, SystemSetting } = require("../app/models");
const logger = require("../app/config/logger");

module.exports = function (app) {
  // Facebook Login/Signup Initiation Route
  app.get(["/auth/facebook", "/backend/auth/facebook"], async (req, res) => {
    try {
      let settings = await SystemSetting.findByPk(1).catch(() => null);

      const app_id =
        (settings && settings.facebook_app_id) ||
        process.env.FACEBOOK_APP_ID;
      
      if (!app_id) {
        console.error("[Facebook OAuth] App ID not configured");
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
          console.log(
            `[Facebook OAuth] forcing backendBase for known host ${reqHost}:`,
            backendBase
          );
        }
      } catch (e) {}

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

      console.log("[Facebook OAuth] Redirecting to Facebook login");
      return res.redirect(facebookUrl);
    } catch (error) {
      console.error("[Facebook OAuth] Error in login initiation:", error.message);
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
        console.log("[Facebook OAuth Callback] Starting...");
        console.log("[Facebook OAuth Callback] Raw query params:", req.query);
        
        const code = req.query.code;
        const error = req.query.error;
        const error_description = req.query.error_description;
        const rawState = req.query.state;

        console.log("[Facebook OAuth Callback] Code:", code ? "✓" : "✗");
        console.log("[Facebook OAuth Callback] Error:", error);
        console.log("[Facebook OAuth Callback] Raw State:", rawState);

        let state = {};
        try {
          const decodedState = decodeURIComponent(rawState || "{}");
          console.log("[Facebook OAuth Callback] Decoded state string:", decodedState);
          state = JSON.parse(decodedState);
          console.log("[Facebook OAuth Callback] Parsed state:", state);
        } catch (e) {
          console.error("[Facebook OAuth Callback] Error parsing state:", e.message);
          console.log("[Facebook OAuth Callback] Setting state to empty object");
          state = {};
        }

        // Handle Facebook errors
        if (error) {
          console.error("[Facebook OAuth] Error from Facebook:", error, error_description);
          const frontendBase = state.redirect_dashboard || process.env.FRONTEND_URL || "http://localhost:3000";
          console.log("[Facebook OAuth] Facebook error - redirecting to:", frontendBase);
          const frontend = new URL(frontendBase).origin;
          return res.redirect(
            `${frontend}/auth?social_error=facebook_denied&error=${encodeURIComponent(error_description || "User cancelled login")}`
          );
        }

        if (!code) {
          console.error("[Facebook OAuth] No code received");
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
          console.error("[Facebook OAuth] Credentials not configured");
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
        } catch (e) {}

        const redirect_uri = `${backendBase}/auth/facebook/callback`;

        // Step 1: Exchange code for access token
        console.log("[Facebook OAuth] Exchanging code for token...");
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
        console.log("[Facebook OAuth] Access token obtained");

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
        console.log("[Facebook OAuth] User profile fetched:", profile.id);

        if (!profile.email) {
          console.error(
            "[Facebook OAuth] User email not available - email permission required"
          );
          const frontend = new URL(state.redirect_dashboard || process.env.FRONTEND_URL).origin;
          return res.redirect(
            `${frontend}/auth?social_error=email_not_granted`
          );
        }

        // Step 3: Look for existing user
        let user = await User.findOne({ where: { email: profile.email } });

        const action = state.action || "signup";
        console.log("[Facebook OAuth] Processing action:", action, "with state:", state);
        console.log("[Facebook OAuth] Existing user found:", !!user, user ? `(verified: ${user.is_email_verified})` : "");

        if (action === "signup") {
          console.log("[Facebook OAuth] Handling SIGNUP flow");
          
          // For signup, reject if there's a VERIFIED user with this email
          if (user && user.is_email_verified) {
            console.log("[Facebook OAuth] Email already verified for another account");
            const frontendBase = state.redirect_dashboard || process.env.FRONTEND_URL || "http://localhost:3000";
            const frontend = new URL(frontendBase).origin;
            return res.redirect(
              `${frontend}/auth?social_error=email_exists`
            );
          }

          // If unverified user exists, delete it
          if (user && !user.is_email_verified) {
            console.log("[Facebook OAuth] Deleting incomplete signup");
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

          console.log("[Facebook OAuth] New user created:", user.id, "with email:", user.email);
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
          console.log("[Facebook OAuth] Social token generated");

          let frontendBase = state.redirect_dashboard || process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`;
          console.log("[Facebook OAuth] Frontend base:", frontendBase);
          const frontend = new URL(frontendBase).origin;
          const redirectUrl = `${frontend}/complete-social-signup?social_token=${encodeURIComponent(
            socialToken
          )}&email=${encodeURIComponent(user.email)}`;

          console.log("[Facebook OAuth] Final redirect URL:", redirectUrl);
          return res.redirect(redirectUrl);
        } else if (action === "signin") {
          // Facebook signin flow - user already has account
          if (!user) {
            console.log("[Facebook OAuth] User not found for signin");
            const frontend = new URL(state.redirect_dashboard || process.env.FRONTEND_URL).origin;
            return res.redirect(
              `${frontend}/auth?social_error=account_not_found`
            );
          }

          // For signin, only allow if email is verified
          if (!user.is_email_verified) {
            console.log("[Facebook OAuth] Account not verified");
            const frontend = new URL(state.redirect_dashboard || process.env.FRONTEND_URL).origin;
            return res.redirect(
              `${frontend}/auth?social_error=account_not_verified`
            );
          }

          if (user.is_deleted) {
            console.log("[Facebook OAuth] Account is blocked");
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
            expiresIn: process.env.JWT_EXPIRES_IN || "7d",
          });

          logger.info("User logged in via Facebook OAuth", {
            userId: user.id,
            email: user.email,
          });

          const dashboard = state.redirect_dashboard || "/dashboard";
          const redirectUrl = `${dashboard}${
            dashboard.includes("?") ? "&" : "?"
          }token=${encodeURIComponent(token)}&success=true`;

          console.log("[Facebook OAuth] Redirecting after signin");
          return res.redirect(redirectUrl);
        } else {
          // If action is not signup or signin, log and redirect with error
          console.error("[Facebook OAuth] Invalid action:", action);
          const frontendBase = state.redirect_dashboard || process.env.FRONTEND_URL || "http://localhost:3000";
          const frontend = new URL(frontendBase).origin;
          return res.redirect(`${frontend}/auth?social_error=invalid_action`);
        }

      } catch (err) {
        console.error(
          "[Facebook OAuth] CALLBACK ERROR:",
          err.message
        );
        console.error("[Facebook OAuth] Error Stack:", err.stack);
        if (err.response?.data) {
          console.error("[Facebook OAuth] API Error Data:", err.response.data);
        }
        
        logger.error("Facebook OAuth callback error", {
          error: err.message,
          details: err.response?.data,
          stack: err.stack,
        });

        const frontend = process.env.FRONTEND_URL || "http://localhost:3000";
        const redirectUrl = `${frontend}/auth?social_error=auth_failed&error=${encodeURIComponent(err.message)}`;
        console.log("[Facebook OAuth] Redirecting on error to:", redirectUrl);
        return res.redirect(redirectUrl);
      }
    }
  );
};
