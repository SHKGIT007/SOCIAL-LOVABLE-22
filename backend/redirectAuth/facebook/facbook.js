
const { User, SocialAccount } = require('../../app/models');


module.exports = function (app) {

    const axios = require('axios');


    app.get('/facebook/callback', async (req, res) => {



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

            const state = JSON.parse(decodeURIComponent(req.query.state));

            // console.log("Decoded State:", state);
            const existingAccount = await SocialAccount.findOne({
                where: { user_id: state.user_id, platform: 'Facebook' }
            });


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

                const pageId = pagesResponse?.data?.data[0]?.id;
                let instagram_business_id = null;
               
                const igRes = await axios.get(
                    `https://graph.facebook.com/v20.0/${pageId}?fields=instagram_business_account&access_token=${access_token}`
                );

                  
                 if(!['',null,undefined].includes(igRes?.data?.instagram_business_account)){
                 instagram_business_id = igRes.data.instagram_business_account?.id;
                  }


                 // Save or update the access token in your database
               

                const groupsResponse = await axios.get(`https://graph.facebook.com/v20.0/me/groups`, {
                    params: {
                        access_token: access_token
                    }
                });

                let AllResponse = JSON.stringify({
                    response: response.data,
                    userInfoResponse: userResponse.data,
                    pagesResponse: pagesResponse.data || [],
                    groupsResponse: groupsResponse.data || []
                });



                 if (existingAccount) {
                    existingAccount.access_token = access_token;
                    existingAccount.is_active = 1;
                    existingAccount.instagram_business_id = instagram_business_id;
                    existingAccount.response_type = AllResponse;
                    await existingAccount.save();
                }

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














// router.get("/facebook/callback", async (req, res) => {
//   const code = req.query.code;
//   try {
//     // 1️⃣ Exchange code for access_token
//     const tokenRes = await axios.get(
//       `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${app_id}&redirect_uri=${encodeURIComponent(
//         redirect_uri
//       )}&client_secret=${app_secret}&code=${code}`
//     );

//     const accessToken = tokenRes.data.access_token;

//     // 2️⃣ Get the user's Facebook Pages
//     const pagesRes = await axios.get(
//       `https://graph.facebook.com/me/accounts?access_token=${accessToken}`
//     );

//     // 3️⃣ Get Instagram Business Account ID from first page
//     const pageId = pagesRes.data.data[0].id;
//     const igRes = await axios.get(
//       `https://graph.facebook.com/v20.0/${pageId}?fields=instagram_business_account&access_token=${accessToken}`
//     );

//     const instagramBusinessId = igRes.data.instagram_business_account?.id;

//     console.log("✅ Facebook Access Token:", accessToken);
//     console.log("✅ Instagram Business ID:", instagramBusinessId);

//     res.json({
//       access_token: accessToken,
//       instagram_business_id: instagramBusinessId,
//     });
//   } catch (error) {
//     console.error("Facebook Auth Error:", error.response?.data || error.message);
//     res.status(500).json({ error: error.response?.data || error.message });
//   }
// });