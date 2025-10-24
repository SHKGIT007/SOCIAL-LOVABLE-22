
const { User, SocialAccount } = require('../../app/models');

module.exports = function (app) {
const axios = require('axios');
 app.get('/facebook/callback', async (req, res) => {

     const state = JSON.parse(decodeURIComponent(req.query.state)); // 👈 decode & parse

    console.log("Decoded State:", state);
     const existingAccount = await SocialAccount.findOne({
        where: { user_id: state.user_id, platform: 'Facebook' }
    });

    console.log("req.query", req.query);
    //const mode = req.query['hub.mode'];
    const mode = req.query['hub.mode'];
    if (mode !== undefined && mode === 'subscribe') {

        const VERIFY_TOKEN = "abc"; // same as console wali
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];
        if (mode && token) {

            if (mode === 'subscribe' && token === VERIFY_TOKEN) {
                console.log("✅ Webhook verified successfully");
                res.status(200).send(challenge);
            } else {
                res.sendStatus(403); // token mismatch
            }
        } else {
            res.sendStatus(400);
        }


    } else {

        //  Decoded State: {
        // user_id: 2,
        // app_id: '2934798226703542',
        // app_secret: 'acb8d713392b5fb7e59e0022b63d4056',
        // redirect_uri: 'https://socialvibe.tradestreet.in/backend/facebook/callback',
        // redirect_dashboard: 'http://localhost:8080/dashboard'
        // }


        const code = req.query.code;
        // let app_id = '2934798226703542'
        // let app_secret = 'acb8d713392b5fb7e59e0022b63d4056'
       // const redirect_uri = 'https://socialvibe.tradestreet.in/backend/facebook/callback';
       let app_id = state.app_id;
       let app_secret = state.app_secret;
       let redirect_uri = state.redirect_uri;
       // let redirect_dashboard = 'http://localhost:8080/dashboard'
       let redirect_dashboard = state.redirect_dashboard;
        try {
            const response = await axios.get(`https://graph.facebook.com/v20.0/oauth/access_token`, {
                params: {
                    client_id: app_id,
                    redirect_uri,
                    client_secret: app_secret,
                    code
                }
            });


            const access_token = response.data.access_token;

            // Save or update the access token in your database
            if (existingAccount) {
                existingAccount.access_token = access_token;
                existingAccount.is_active = 1;
                await existingAccount.save();
            } 
           

            // Get user info
            const userResponse = await axios.get(`https://graph.facebook.com/v20.0/me`, {
                params: {
                    access_token: access_token,
                    fields: 'id,name,email,picture'
                }
            });

            // Get user's pages
            const pagesResponse = await axios.get(`https://graph.facebook.com/v20.0/me/accounts`, {
                params: {
                    access_token: access_token
                }
            });

            const groupsResponse = await axios.get(`https://graph.facebook.com/v20.0/me/groups`, {
                params: {
                    access_token: access_token
                }
            });

            console.log("response.data", response.data);
            console.log("userResponse", userResponse.data);
            console.log("pagesResponse", pagesResponse.data);
            console.log("groupsResponse", groupsResponse.data);
            return res.redirect(redirect_dashboard + "?success=true");

            // return res.json({
            //     success: true,
            //     data: {
            //         access_token,
            //         userInfo: userResponse.data,
            //         pages: pagesResponse.data || [],
            //         groups: groupsResponse.data || []
            //     }
            // });

        } catch (error) {
            console.error("❌ Error generating access token:", error.response?.data || error.message);
            res.status(500).send("Error getting access token");
        }

    }

 });
  


}