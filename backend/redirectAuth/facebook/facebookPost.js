
   const axios = require("axios");
//    async function facebookPost(userAccessToken , content) {
//     try {
//     const responsePageToken = await axios.get(
//       `https://graph.facebook.com/me/accounts?access_token=${userAccessToken}`
//     );

//      const pageAccessToken = responsePageToken.data.data[0].access_token;
//     //const message = "🚀 Hello from my Node.js App HAAAAAAA!";
        
//         const responsePost = await axios.post(
//           `https://graph.facebook.com/v20.0/me/feed`,
//           {
//             message: content,
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${pageAccessToken}`,
//             },
//           }
//         );
    
//     console.log("✅ Posted Successfully:", responsePost.data);

//     return responsePost.data;

   
//   } catch (error) {
//     console.error("❌ Error fetching page token:", error.response?.data || error.message);
//    return res.status(500).send("Error fetching page token");
//   }



// }
async function facebookPost(userAccessToken, content, imageUrl = "", videoUrl = "") {
  try {
    // Step 1: Get Page Access Token
    const responsePageToken = await axios.get(
      `https://graph.facebook.com/me/accounts?access_token=${userAccessToken}`
    );

    const pageData = responsePageToken.data.data[0];
    const pageId = pageData.id;
    const pageAccessToken = pageData.access_token;

    let responsePost;

    // Step 2: Decide endpoint based on video/image presence
    if (videoUrl && videoUrl.trim() !== "") {
      // 🎥 If video is present → post video + caption
      responsePost = await axios.post(
        `https://graph.facebook.com/${pageId}/videos`,
        {
          file_url: videoUrl,
          description: content,
        },
        {
          headers: { Authorization: `Bearer ${pageAccessToken}` },
        }
      );
    } else if (imageUrl && imageUrl.trim() !== "") {
      // 🖼️ If image is present → post image + caption
      responsePost = await axios.post(
        `https://graph.facebook.com/${pageId}/photos`,
        {
          url: imageUrl,
          caption: content,
        },
        {
          headers: { Authorization: `Bearer ${pageAccessToken}` },
        }
      );
    } else {
      // 📝 If no image/video → post only text
      responsePost = await axios.post(
        `https://graph.facebook.com/${pageId}/feed`,
        {
          message: content,
        },
        {
          headers: { Authorization: `Bearer ${pageAccessToken}` },
        }
      );
    }

    console.log("✅ Posted Successfully:", responsePost.data);
    return responsePost.data;
  } catch (error) {
    console.error(
      "❌ Error posting to Facebook:",
      error.response?.data || error.message
    );
    throw new Error("Facebook post failed");
  }
}
module.exports = { facebookPost };