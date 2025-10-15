
   const axios = require("axios");
   async function facebookPost(userAccessToken , content) {
    try {
    const responsePageToken = await axios.get(
      `https://graph.facebook.com/me/accounts?access_token=${userAccessToken}`
    );

     const pageAccessToken = responsePageToken.data.data[0].access_token;
    //const message = "🚀 Hello from my Node.js App HAAAAAAA!";
        
        const responsePost = await axios.post(
          `https://graph.facebook.com/v20.0/me/feed`,
          {
            message: content,
          },
          {
            headers: {
              Authorization: `Bearer ${pageAccessToken}`,
            },
          }
        );
    
    console.log("✅ Posted Successfully:", responsePost.data);

    return responsePost.data;

   
  } catch (error) {
    console.error("❌ Error fetching page token:", error.response?.data || error.message);
   return res.status(500).send("Error fetching page token");
  }



}
module.exports = { facebookPost };