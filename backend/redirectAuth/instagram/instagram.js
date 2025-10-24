module.exports = function (app) {
  // Instagram OAuth callback route
  const { SocialAccount } = require("../../app/models");
    const axios = require('axios');
    app.get('/instagram/callback', async (req, res) => {
        // Webhook verification (if Instagram supports it, similar to Facebook)
        const mode = req.query['hub.mode'];
        if (mode !== undefined && mode === 'subscribe') {
            const VERIFY_TOKEN = "abc"; // same as console wali
            const token = req.query['hub.verify_token'];
            const challenge = req.query['hub.challenge'];
            if (mode && token) {
                if (mode === 'subscribe' && token === VERIFY_TOKEN) {
                    console.log("✅ Instagram Webhook verified successfully");
                    return res.status(200).send(challenge);
                } else {
                    return res.sendStatus(403); // token mismatch
                }
            } else {
                return res.sendStatus(400);
            }
        }

        // OAuth callback logic
        const code = req.query.code;
        if (!code) return res.status(400).send("Missing code");

        let state = {};
        if (req.query.state) {
            try {
                state = JSON.parse(decodeURIComponent(req.query.state));
            } catch (e) {
                state = {};
            }
        }
        const user_id = state.user_id;
        const app_id = state.app_id || process.env.INSTAGRAM_APP_ID;
        const app_secret = state.app_secret || process.env.INSTAGRAM_APP_SECRET;
        const redirect_uri = state.redirect_uri || 'https://socialvibe.tradestreet.in/backend/instagram/callback';
        const redirect_dashboard = state.redirect_dashboard || 'http://localhost:8080/dashboard';

        try {
            // Exchange code for access token
            const params = new URLSearchParams({
                client_id: app_id,
                client_secret: app_secret,
                grant_type: 'authorization_code',
                redirect_uri,
                code,
            });
            const response = await axios.post('https://api.instagram.com/oauth/access_token', params);
            const access_token = response.data.access_token;
            const ig_user_id = response.data.user_id;

            // Save or update the access token in your database
            let existingAccount = await SocialAccount.findOne({
                where: { user_id: user_id, platform: 'Instagram' }
            });
            if (existingAccount) {
                existingAccount.access_token = access_token;
                existingAccount.account_id = ig_user_id;
                existingAccount.is_active = 1;
                await existingAccount.save();
            }

            // Get user info (Instagram Basic Display API)
            const userResponse = await axios.get(`https://graph.instagram.com/me`, {
                params: {
                    access_token: access_token,
                    fields: 'id,username,account_type,media_count'
                }
            });

            // You can fetch more info or media if needed
            // const mediaResponse = await axios.get(`https://graph.instagram.com/me/media`, {
            //     params: { access_token: access_token }
            // });

            console.log("response.data", response.data);
            console.log("userResponse", userResponse.data);
            // console.log("mediaResponse", mediaResponse.data);
            return res.redirect(redirect_dashboard + "?success=true");
        } catch (error) {
            console.error("❌ Error generating access token:", error.response?.data || error.message);
            res.status(500).send("Error getting access token");
        }
    });
};
