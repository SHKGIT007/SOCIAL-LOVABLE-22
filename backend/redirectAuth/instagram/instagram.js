module.exports = function (app) {
  // Instagram OAuth callback route
  const { SocialAccount } = require("../../app/models");
  app.get("/redirect-auth/instagram/callback", async (req, res) => {
    const code = req.query.code;
    if (!code) return res.status(400).send("Missing code");

    // Exchange code for access token
    const params = new URLSearchParams({
      client_id: process.env.INSTAGRAM_APP_ID,
      client_secret: process.env.INSTAGRAM_APP_SECRET,
      grant_type: "authorization_code",
      redirect_uri: "https://socialvibe.tradestreet.in/backend/instagram/callback",
      code,
    });

    try {
      const response = await fetch("https://api.instagram.com/oauth/access_token", {
        method: "POST",
        body: params,
      });
      const data = await response.json();
      if (data.access_token && data.user_id) {
        // Save to SocialAccount table
        await SocialAccount.update(
          {
            access_token: data.access_token,
            account_id: data.user_id,
            is_active: 1,
          },
          {
            where: { platform: "Instagram", account_id: data.user_id },
            individualHooks: true,
          }
        );
      }
      res.json({ status: true, data });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  });
};
