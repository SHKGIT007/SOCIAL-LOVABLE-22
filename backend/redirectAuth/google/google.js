const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, SystemSetting } = require('../../app/models');

module.exports = function (app) {
  // Start Google OAuth flow
  app.get('/auth/google', async (req, res) => {
    // Load system settings from DB if available, fallback to env
    let settings;
    try {
      settings = await SystemSetting.findByPk(1);
    } catch (e) {
      settings = null;
    }

    const client_id = (settings && settings.google_client_id) || process.env.GOOGLE_CLIENT_ID;
    const redirect_uri = (settings && settings.google_redirect_uri) || process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/auth/google/callback`;
    const redirect_dashboard = req.query.redirect_dashboard || process.env.FRONTEND_URL || 'http://localhost:9999/dashboard';
    const action = req.query.action || 'signin';

    const state = encodeURIComponent(JSON.stringify({ redirect_dashboard, action }));
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(client_id)}&redirect_uri=${encodeURIComponent(redirect_uri)}&response_type=code&scope=${encodeURIComponent('openid email profile')}&state=${state}&access_type=offline&prompt=consent`;

    // Debug logs to help diagnose redirect_uri_mismatch errors
    try {
      console.log('--- Google OAuth Start ---');
      console.log('GOOGLE_CLIENT_ID source:', settings && settings.google_client_id ? 'db' : 'env');
      console.log('GOOGLE_CLIENT_ID present:', !!client_id);
      console.log('Using redirect_uri (source):', settings && settings.google_redirect_uri ? 'db' : 'env');
      console.log('Using GOOGLE_REDIRECT_URI:', redirect_uri);
      console.log('Action:', action);
      console.log('OAuth URL (preview):', oauthUrl.substring(0, 200));
      console.log('--- /Google OAuth Start ---');
    } catch (e) {
      // ignore logging errors
    }

    return res.redirect(oauthUrl);
  });

  // OAuth callback
  app.get('/auth/google/callback', async (req, res) => {
    try {
      const code = req.query.code;
      const rawState = req.query.state;
      const state = rawState ? JSON.parse(decodeURIComponent(rawState)) : {};

      // Load system settings from DB (if any) to use google credentials stored in DB
      let settings;
      try {
        settings = await SystemSetting.findByPk(1);
      } catch (e) {
        settings = null;
      }

      const client_id = (settings && settings.google_client_id) || process.env.GOOGLE_CLIENT_ID;
      const client_secret = (settings && settings.google_client_secret) || process.env.GOOGLE_CLIENT_SECRET;
      const redirect_uri = (settings && settings.google_redirect_uri) || process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/auth/google/callback`;

      // Exchange code for tokens
      const tokenRes = await axios.post('https://oauth2.googleapis.com/token', new URLSearchParams({
        code,
        client_id,
        client_secret,
        redirect_uri,
        grant_type: 'authorization_code',
      }).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const access_token = tokenRes.data.access_token;

      // Get user info
      const userInfoRes = await axios.get('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const profile = userInfoRes.data;

      // Find existing user
      let user = await User.findOne({ where: { email: profile.email } });

      // If the flow was started for signup explicitly and user already exists -> error
      const flowAction = state.action || 'signin';

      if (flowAction === 'signup') {
        if (user) {
          // Email already registered -> send user back to auth page with error
          let frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
          if (state.redirect_dashboard) {
            try {
              frontendOrigin = new URL(state.redirect_dashboard).origin;
            } catch (e) {}
          }
          return res.redirect(`${frontendOrigin}/auth?social_error=email_exists`);
        }

        // Create new user for signup
        const randomPassword = Math.random().toString(36).slice(-12);
        const hashed = await bcrypt.hash(randomPassword, 12);

        const usernameBase = (profile.email || 'user').split('@')[0];

        user = await User.create({
          user_name: `${usernameBase}_${Date.now()}`,
          email: profile.email,
          password: hashed,
          user_fname: profile.given_name || null,
          user_lname: profile.family_name || null,
          avatar_url: profile.picture || null,
          full_name: profile.name || null,
          is_email_verified: true,
          active_status: false, // keep inactive until password set
          role_id: 2,
        });

        // Create a short-lived token for completing signup
        const socialToken = jwt.sign({ userId: user.id, social_signup: true }, process.env.JWT_SECRET, {
          expiresIn: '15m',
        });

        // Compute frontend origin (use origin if redirect_dashboard includes path)
        let frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
        if (state.redirect_dashboard) {
          try {
            frontendOrigin = new URL(state.redirect_dashboard).origin;
          } catch (e) {}
        }

        const redirectUrl = `${frontendOrigin}/complete-social-signup?social_token=${encodeURIComponent(socialToken)}&email=${encodeURIComponent(user.email)}`;
        return res.redirect(redirectUrl);
      } else {
        // signin/default flow: create or update user
        if (user) {
          user.avatar_url = profile.picture || user.avatar_url;
          user.full_name = profile.name || user.full_name;
          user.user_fname = profile.given_name || user.user_fname;
          user.user_lname = profile.family_name || user.user_lname;
          user.is_email_verified = true;
          user.active_status = true;
          await user.save();
        } else {
          const randomPassword = Math.random().toString(36).slice(-12);
          const hashed = await bcrypt.hash(randomPassword, 12);

          const usernameBase = (profile.email || 'user').split('@')[0];

          user = await User.create({
            user_name: `${usernameBase}_${Date.now()}`,
            email: profile.email,
            password: hashed,
            user_fname: profile.given_name || null,
            user_lname: profile.family_name || null,
            avatar_url: profile.picture || null,
            full_name: profile.name || null,
            is_email_verified: true,
            active_status: true,
            role_id: 2,
          });
        }
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      });

      const redirect_dashboard = state.redirect_dashboard || process.env.FRONTEND_URL || 'http://localhost:5173/dashboard';

      // Redirect back to frontend with token
      const redirectUrl = `${redirect_dashboard}${redirect_dashboard.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}&success=true`;
      return res.redirect(redirectUrl);
    } catch (err) {
      console.error('Google OAuth error:', err.response?.data || err.message || err);
      let frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
      if (req.query && req.query.redirect_dashboard) {
        try {
          frontendOrigin = new URL(req.query.redirect_dashboard).origin;
        } catch (e) {}
      }
      return res.redirect(`${frontendOrigin}/auth?social_error=auth_failed`);
    }
  });
};
