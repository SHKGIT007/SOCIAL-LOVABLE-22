app.get('/facebook/callback',async (req, res) => {
 
  const axios = require('axios');

  console.log("req.query",req.query);


  const code = req.query.code;
 
  let  app_id= '2934798226703542'
   let app_secret='acb8d713392b5fb7e59e0022b63d4056'
  const redirect_uri = 'https://hometalent4u.in/backend/facebook/callback';
  
  try {
    const response = await axios.get(`https://graph.facebook.com/v20.0/oauth/access_token`, {
      params: {
        client_id: app_id,
        redirect_uri,
        client_secret: app_secret,
        code
      }
    });

    console.log("response",response.data);

    // {"success":true,"data":{"access_token":"EAAptLvXKRLYBPmUlznDzojZB9Duqjm73wbbHZA8ZCY4gmZBRZBapSp2cjknZCxeqMZAVCXPUc1A7tEszL0jNZAp7q4bRum8VkO2Qs7l0hLpQcbO4OFqZBkvIKIaSzZCz0c2u2zrS7UEiblSfeTjP19f9n6jKWUZC2EZAgY8sXLZC8MgxieewPomUasHLNGoB1gHiCZB5ZCyu5TWC7k3lgAGxAwaM7isdjCSMf9ZCpngaeMqu62pJfWGTvzZAIIopw7zUsIQxK","userInfo":{"id":"690347610768915","name":"Shankar Charan Sahu","email":"shankarcharansahu07@gmail.com","picture":{"data":{"height":50,"is_silhouette":false,"url":"https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=690347610768915&height=50&width=50&ext=1763014940&hash=AT9t4ofWs-RgHAMmauXUPyAQ","width":50}}},"pages":{"data":[{"access_token":"EAAptLvXKRLYBPmIXnj3pDS0iwEN9xgpm8thTacuO35fC1XF77aE2rmWulxOZBQJJpe9VRBY4cbPZAzAZBNle4ivkKkHLHWBUbFVSZBXkqZCbuSaMKMlWazB12LEeJZCqOWgDMTTQEGIPhgiz83j7PSrcN5CaT6XZCPkpavbYMBZCM7qw3xpOjF3jmrNC8LM2gZCrTMKrkVUEX","category":"Product/service","category_list":[{"id":"2201","name":"Product/service"}],"name":"ShankarPage","id":"832087889989519","tasks":["MODERATE","MESSAGING","ANALYZE","ADVERTISE","CREATE_CONTENT","MANAGE"]}],"paging":{"cursors":{"before":"QVFIU01VTF9zUlduZATlnb001aHJPTmJjX2VFUE91R2poS2NVYXBWXzMwOXFWd1o2Xzg5SmlJWl83VGVoaTNZAUlkyZAEdJSVY2U0xvRUhRSm50RXlJTFFkZAFNn","after":"QVFIU01VTF9zUlduZATlnb001aHJPTmJjX2VFUE91R2poS2NVYXBWXzMwOXFWd1o2Xzg5SmlJWl83VGVoaTNZAUlkyZAEdJSVY2U0xvRUhRSm50RXlJTFFkZAFNn"}}}}}






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

       const groupsResponse = await axios.get(`https://graph.facebook.com/v20.0/me/groups`, {
        params: {
          access_token: access_token
        }
      });

      return res.json({
        success: true,
        data: {
          access_token,
          userInfo: userResponse.data,
          pages: pagesResponse.data || [],
          groups: groupsResponse.data || []
        }
      });








    console.log("✅ Access Token:", access_token);

    res.send("Access Token generated successfully!");
  } catch (error) {
    console.error("❌ Error generating access token:", error.response?.data || error.message);
    res.status(500).send("Error getting access token");
  }


    


//  const VERIFY_TOKEN = "nilesh"; // same as console wali
//  console.log("dgg",req.query);
// const mode = req.query['hub.mode'];
// const token = req.query['hub.verify_token'];
// const challenge = req.query['hub.challenge'];
// if (mode && token) {

// if (mode === 'subscribe' && token === VERIFY_TOKEN) {
// console.log("✅ Webhook verified successfully");
// res.status(200).send(challenge);
// } else {
// res.sendStatus(403); // token mismatch
// }
// } else {
// res.sendStatus(400);
// }

});


app.get("/pageToken", async (req, res) => {
  const axios = require("axios");
  try {
    const userAccessToken ="EAAptLvXKRLYBPpGpkkgZAZCQbNCwBDhvtnd3Dtg7t1vdvGils3EWAgZB4nwCpPSUHzrajTloZArEfZAQvl10KeCZAagZCleNq1j6tF80q87sYkdZAkTZC39erKU5P6TZASCbAdUSD86VYfXpCFtmSBEQzV6PTk6BuAq8hxsI9I3yX2AI19H49GLy1JueHekEcZB860cbe0dZAZCIZA2NZCBUYZAJDSRBFx9xvuQWZBmW1QuuTGsnHW1a01vNtcmsaIpTNMluW";

    const response = await axios.get(
      `https://graph.facebook.com/me/accounts?access_token=${userAccessToken}`
    );

    console.log("📄 Page List:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("❌ Error fetching page token:", error.response?.data || error.message);
    res.status(500).send("Error fetching page token");
  }
});



 const axios = require('axios');
app.get("/postToPage", async (req, res) => {

  try {
    const pageAccessToken = "EAAptLvXKRLYBPmIXnj3pDS0iwEN9xgpm8thTacuO35fC1XF77aE2rmWulxOZBQJJpe9VRBY4cbPZAzAZBNle4ivkKkHLHWBUbFVSZBXkqZCbuSaMKMlWazB12LEeJZCqOWgDMTTQEGIPhgiz83j7PSrcN5CaT6XZCPkpavbYMBZCM7qw3xpOjF3jmrNC8LM2gZCrTMKrkVUEX";
    const message = "🚀 Hello from my Node.js App HAAAAAAA!";
    
    const response = await axios.post(
      `https://graph.facebook.com/v20.0/me/feed`,
      {
        message: message,
      },
      {
        headers: {
          Authorization: `Bearer ${pageAccessToken}`,
        },
      }
    );

    console.log("✅ Posted Successfully:", response.data);
    res.json(response.data);

  } catch (error) {
    console.error("❌ Error Posting:", error.response?.data || error.message);
    res.status(500).send("Failed to post on Facebook");
  }
});

const puppeteer = require("puppeteer");

async function postOnFacebook() {
  const email = "shankarcharansahu07@gmail.com";
  const password = "shankar@321";
  const postText = "IGAAAAAAAA from ! 🚀";

  console.log("🚀 Starting Facebook Auto Poster...");

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--window-size=1280,800"
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // 1️⃣ Go to Facebook login
    await page.goto("https://www.facebook.com/", { waitUntil: "networkidle2" });

    // 2️⃣ Enter credentials
    await page.type("#email", email, { delay: 50 });
    await page.type("#pass", password, { delay: 50 });
    await page.keyboard.press("Enter");

    console.log("🔐 Logging in...");

    // 3️⃣ Wait for feed container (more reliable than "Create a post")
    await page.waitForSelector('[role="feed"]', { visible: true, timeout: 30000 });

    console.log("✅ Logged in successfully!");

    // 4️⃣ Click on post box using evaluate (works even if aria-label changes)
    await page.evaluate(() => {
      const postBoxes = Array.from(document.querySelectorAll('div[role="button"]'));
      const createPost = postBoxes.find(el => el.innerText.includes("What's on your mind"));
      if (createPost) createPost.click();
    });

    // 5️⃣ Wait for modal
    await page.waitForSelector("div[role='textbox']", { visible: true, timeout: 10000 });

    // 6️⃣ Type post
    await page.type("div[role='textbox']", postText, { delay: 50 });

    // 7️⃣ Click Post button
    await page.waitForTimeout(1000);
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('div[role="button"] span'));
      const postBtn = buttons.find(b => b.innerText === "Post");
      if (postBtn) postBtn.click();
    });

    // 8️⃣ Wait to ensure post is published
    await page.waitForTimeout(5000);
    console.log("✅ Post published successfully!");
  } catch (error) {
    console.error("❌ Error posting on Facebook:", error);
  } finally {
    await browser.close();
  }
}