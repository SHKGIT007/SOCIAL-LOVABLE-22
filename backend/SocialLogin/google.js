const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, SystemSetting } = require("../app/models");

module.exports = function (app) {
  app.get(["/auth/google", "/backend/auth/google"], async (req, res) => {
    let settings = await SystemSetting.findByPk(1).catch(() => null);

    const client_id =
      (settings && settings.google_client_id) || process.env.GOOGLE_CLIENT_ID;

    // Allow an explicit BACKEND_URL to be set in production so redirect
    // URIs generated here always point to the publicly reachable backend
    // path (useful when frontend and backend are reverse-proxied).
    const prefix = req.path.startsWith("/backend") ? "/backend" : "";
    const backendBase = process.env.BACKEND_URL
      ? process.env.BACKEND_URL.replace(/\/$/, "")
      : `${req.protocol}://${req.get("host")}${prefix}`;
    const redirect_uri = `${backendBase}/auth/google/callback`;

    let redirect_dashboard =
      req.query.redirect_dashboard ||
      req.get("referer") ||
      process.env.FRONTEND_URL ||
      `${req.protocol}://${req.get("host")}`;

    const action = req.query.action || "signin";

    const state = encodeURIComponent(
      JSON.stringify({ redirect_dashboard, action })
    );

    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      client_id
    )}&redirect_uri=${encodeURIComponent(
      redirect_uri
    )}&response_type=code&scope=openid%20email%20profile&state=${state}&access_type=offline&prompt=consent`;

    return res.redirect(oauthUrl);
  });

  app.get(
    ["/auth/google/callback", "/backend/auth/google/callback"],
    async (req, res) => {
      try {
        const code = req.query.code;

        let state = {};
        try {
          state = JSON.parse(decodeURIComponent(req.query.state || "{}"));
        } catch (e) {}

        let settings = await SystemSetting.findByPk(1).catch(() => null);

        const client_id =
          (settings && settings.google_client_id) ||
          process.env.GOOGLE_CLIENT_ID;

        const client_secret =
          (settings && settings.google_client_secret) ||
          process.env.GOOGLE_CLIENT_SECRET;

        // Use BACKEND_URL if provided so the redirect URI matches what
        // Google expects and what is actually reachable externally.
        const prefix = req.path.startsWith("/backend") ? "/backend" : "";
        const backendBase = process.env.BACKEND_URL
          ? process.env.BACKEND_URL.replace(/\/$/, "")
          : `${req.protocol}://${req.get("host")}${prefix}`;
        const redirect_uri = `${backendBase}/auth/google/callback`;

        const tokenRes = await axios.post(
          "https://oauth2.googleapis.com/token",
          new URLSearchParams({
            code,
            client_id,
            client_secret,
            redirect_uri,
            grant_type: "authorization_code",
          }).toString(),
          {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          }
        );

        const access_token = tokenRes.data.access_token;

        const profile = await axios
          .get("https://openidconnect.googleapis.com/v1/userinfo", {
            headers: { Authorization: `Bearer ${access_token}` },
          })
          .then((r) => r.data);

        let user = await User.findOne({ where: { email: profile.email } });

        const action = state.action || "signin";

        if (action === "signup") {
          if (user) {
            return res.redirect(
              `${
                new URL(state.redirect_dashboard).origin
              }/auth?social_error=email_exists`
            );
          }

          const randomPassword = Math.random().toString(36).slice(-12);
          const hashed = await bcrypt.hash(randomPassword, 12);

          const usernameBase = profile.email.split("@")[0];

          user = await User.create({
            user_name: `${usernameBase}_${Date.now()}`,
            email: profile.email,
            password: hashed,
            user_fname: profile.given_name,
            user_lname: profile.family_name,
            avatar_url: profile.picture,
            full_name: profile.name,
            is_email_verified: true,
            active_status: false,
            role_id: 2,
          });

          const socialToken = jwt.sign(
            { userId: user.id, social_signup: true },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
          );

          const frontend = new URL(state.redirect_dashboard).origin;
          return res.redirect(
            `${frontend}/complete-social-signup?social_token=${encodeURIComponent(
              socialToken
            )}&email=${encodeURIComponent(user.email)}`
          );
        }

        if (!user) {
          const randomPassword = Math.random().toString(36).slice(-12);
          const hashed = await bcrypt.hash(randomPassword, 12);
          const usernameBase = profile.email.split("@")[0];

          user = await User.create({
            user_name: `${usernameBase}_${Date.now()}`,
            email: profile.email,
            password: hashed,
            user_fname: profile.given_name,
            user_lname: profile.family_name,
            avatar_url: profile.picture,
            full_name: profile.name,
            is_email_verified: true,
            active_status: true,
            role_id: 2,
          });
        } else {
          if (user.is_deleted) {
            return res.redirect(
              `${
                new URL(state.redirect_dashboard).origin
              }/auth?social_error=account_blocked`
            );
          }

          user.avatar_url = profile.picture || user.avatar_url;
          user.full_name = profile.name;
          user.user_fname = profile.given_name;
          user.user_lname = profile.family_name;
          user.is_email_verified = true;
          user.active_status = true;
          await user.save();
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN || "7d",
        });

        const dashboard = state.redirect_dashboard || "/dashboard";

        return res.redirect(
          `${dashboard}${
            dashboard.includes("?") ? "&" : "?"
          }token=${encodeURIComponent(token)}&success=true`
        );
      } catch (err) {
        console.error("Google OAuth Error:", err.response?.data || err.message);

        const frontend =
          process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`;

        return res.redirect(`${frontend}/auth?social_error=auth_failed`);
      }
    }
  );
};
