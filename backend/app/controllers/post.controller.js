const {
  Post,
  User,
  Plan,
  Subscription,
  SystemSetting,
  AiGenratePost,
} = require("../models");

const { Op } = require("sequelize");
const { asyncHandler } = require("../middleware/error.middleware");
const logger = require("../config/logger");
const { SocialAccount } = require("../models");
const axios = require("axios");
const { facebookPost } = require("../../redirectAuth/facebook/facebookPost");
const { instagramPost } = require("../../redirectAuth/instagram/instagramPost");
const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const fs = require("fs");
const { type } = require("os");
const cloudinary = require("cloudinary").v2;
const moment = require("moment-timezone");
const { log } = require("console");

const createPost = asyncHandler(async (req, res) => {
  // Debug: Log incoming form data and files
  // console.log("req.body:", req.body);
  // console.log("req.files:", req.files);
  // console.log("platforms:", req.body.platforms);
  // console.log("platforms:", typeof req.body.platforms);

  // Support for file uploads (image/video)

  try {
    const userId = req.user.id;
    let image_url = req.body.image_url || null;

    let video_url = null;

    let { title, content, platforms, status, is_ai_generated, review_status } =
      req.body;
    // Convert platforms to array if string
    if (typeof platforms === "string") {
      try {
        platforms = JSON.parse(platforms);
      } catch {
        platforms = [platforms];
      }
    }

    // Use environment variables for upload directory and public URL
    const UPLOAD_DIR = process.env.UPLOAD_DIR || "/var/www/socialvibe/uploads";
    const PUBLIC_UPLOAD_URL =
      process.env.PUBLIC_UPLOAD_URL ||
      "https://socialvibe.tradestreet.in/uploads";

    // Ensure uploads directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    //  cloudinary.config({
    //   cloud_name: 'diapmjeoc',
    //   api_key: '623293742125568',
    //   api_secret: '6mzyLVSYqqjhbUbECHqvGPayE_E'
    // });

    // Fetch Cloudinary config from system_settings table
    const cloudinarySetting = await SystemSetting.findOne({ where: { id: 1 } });
    cloudinary.config({
      cloud_name: cloudinarySetting?.cloudinary_cloud_name || "",
      api_key: cloudinarySetting?.cloudinary_api_key || "",
      api_secret: cloudinarySetting?.cloudinary_api_secret || "",
    });

    if (req.files) {
      // Get user info for folder naming
      const user = await User.findByPk(userId);
      const userFolder = user
        ? `user_${userId}_${user.user_name}`
        : `user_${userId}`;

      if (req.files.image_file) {
        const img = req.files.image_file;
        let imgPath = img.tempFilePath || undefined;
        if (!imgPath) {
          imgPath = `${UPLOAD_DIR}/temp_${Date.now()}_${img.name}`;
          await img.mv(imgPath);
        }
        const uploadRes = await cloudinary.uploader.upload(imgPath, {
          resource_type: "image",
          folder: `${userFolder}`,
          transformation: [{ quality: "auto" }],
        });
        image_url = uploadRes.secure_url;
      }
      if (req.files.video_file) {
        const vid = req.files.video_file;
        let vidPath = vid.tempFilePath || undefined;
        if (!vidPath) {
          vidPath = `${UPLOAD_DIR}/temp_${Date.now()}_${vid.name}`;
          await vid.mv(vidPath);
        }
        const uploadRes = await cloudinary.uploader.upload(vidPath, {
          resource_type: "video",
          folder: `${userFolder}`,
          transformation: [{ quality: "auto" }],
        });
        video_url = uploadRes.secure_url;
      }
    }

    // If image_url is provided and is not null, upload it to Cloudinary
    if (image_url) {
      // Get user info for folder naming
      const user = await User.findByPk(userId);
      const userFolder = user
        ? `user_${userId}_${user.user_name}`
        : `user_${userId}`;
      try {
        const uploadRes = await cloudinary.uploader.upload(image_url, {
          resource_type: "image",
          folder: `${userFolder}`,
          transformation: [{ quality: "auto" }],
        });
        image_url = uploadRes.secure_url;
      } catch (err) {
        logger.error("Cloudinary upload error (image_url from body)", {
          error: err.message,
        });
      }
    }

    // Check user's subscription limits
    const subscription = await Subscription.findOne({
      where: { user_id: userId, status: "active" },
      include: [{ model: Plan, as: "Plan" }],
    });

    // if (subscription) {
    //     const plan = subscription.Plan;
    //     if (subscription.posts_used >= plan.monthly_posts) {
    //         return res.status(400).json({
    //             status: false,
    //             message: 'Monthly post limit reached'
    //         });
    //     }

    //     if (req.body.is_ai_generated && subscription.ai_posts_used >= plan.ai_posts) {
    //         return res.status(400).json({
    //             status: false,
    //             message: 'Monthly AI post limit reached'
    //         });
    //     }
    // }

    // Save post in DB
    const post = await Post.create({
      title: req.body.title,
      content: req.body.content,
      platforms: platforms,
      status: req.body.status || "draft",
      scheduled_at: req.body.scheduled_at || null,
      media_urls: req.body.media_urls,
      is_ai_generated: req.body.is_ai_generated || false,
      ai_prompt: req.body.ai_prompt,
      user_id: userId,
      image_prompt: req.body.image_prompt || null,
      image_url,
      video_url,
      review_status: review_status,
    });

    // Update subscription usage
    if (subscription) {
      await Subscription.update(
        {
          posts_used: subscription.posts_used + 1,
          // ai_posts_used: is_ai_generated ? subscription.ai_posts_used + 1 : subscription.ai_posts_used
        },
        { where: { id: subscription.id } }
      );
    }

    // Publish logic for Facebook and Instagram
    if (req.body.status === "published" && Array.isArray(platforms)) {
      console.log("Publishing to platformsLLLLLLLLLLLLLLLLLLL:", platforms);
      let publishResults = {};
      // Facebook
      if (platforms.includes("Facebook")) {
        const fbAccount = await SocialAccount.findOne({
          where: { user_id: userId, platform: "Facebook", is_active: 1 },
        });
        if (fbAccount && fbAccount.access_token) {
          try {
            const fbPostData = await facebookPost(
              fbAccount.access_token,
              content,
              image_url,
              video_url && video_url !== null ? video_url : undefined
            );
            publishResults.facebook = { success: true, data: fbPostData };
          } catch (err) {
            logger.error("Facebook publish error", { error: err.message });
            publishResults.facebook = { success: false, error: err.message };
          }
        }
      }
      // Instagram
      if (platforms.includes("Instagram")) {
        console.log("Publishing to Instagram INSIDEEEEE");
        const igAccount = await SocialAccount.findOne({
          where: { user_id: userId, platform: "Instagram", is_active: 1 },
        });
        if (igAccount && igAccount.access_token) {
          try {
            const igPostData = await instagramPost(
              igAccount.access_token,
              content,
              image_url,
              video_url && video_url !== null ? video_url : undefined
            );
            publishResults.instagram = { success: true, data: igPostData };
          } catch (err) {
            logger.error("Instagram publish error", { error: err.message });
            publishResults.instagram = { success: false, error: err.message };
          }
        }
      }
      // If any platform was published, return result
      if (Object.keys(publishResults).length > 0) {
        return res.json({
          status: true,
          message: "Post published successfully",
          results: publishResults,
        });
      }
    }
    // For scheduled and draft, just save post, do not publish
    //  logger.info('Post created', { postId: post.id, userId });
    return res.status(201).json({
      status: true,
      message: "Post created successfully",
      data: { post },
    });
  } catch (error) {
    console.error("Error in createPost:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
});

const getAllPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, status, user_id } = req.query;
  const offset = (page - 1) * limit;
  const userId = req.user.id;
  const userType = req.user.user_type;

  const whereClause = {};

  // If not admin, only show user's own posts
  if (userType !== "admin") {
    whereClause.user_id = userId;
  } else if (user_id) {
    whereClause.user_id = user_id;
  }

  if (search) {
    whereClause[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { content: { [Op.like]: `%${search}%` } },
    ];
  }

  if (status) {
    whereClause.status = status;
  }

  const { count, rows: posts } = await Post.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: "User",
        attributes: ["id", "user_name", "email", "user_fname", "user_lname"],
      },
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["created_at", "DESC"]],
  });

  console.log("post", posts);

  res.json({
    status: true,
    data: {
      posts,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    },
  });
});

const getPostById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // const userId = req.user.id;
  // const userType = req.user.user_type;

  const post = await Post.findByPk(id, {
    include: [
      {
        model: User,
        as: "User",
        attributes: ["id", "user_name", "email", "user_fname", "user_lname"],
      },
    ],
  });

  if (!post) {
    return res.status(404).json({
      status: false,
      message: "Post not found",
    });
  }

  // Check if user can access this post
  // Admin can view any post; client can view only their own post
  // If you want to restrict, uncomment below:
  // if (userType !== 'admin' && post.user_id !== userId) {
  //     return res.status(403).json({
  //         status: false,
  //         message: 'Access denied'
  //     });
  // }

  res.json({
    status: true,
    data: { post },
  });
});

const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let {
    title,
    content,
    platforms,
    status,
    scheduled_at,
    category,
    tags,
    media_urls,
    image_url,
  } = req.body;
  const userId = req.user.id;
  const userType = req.user.user_type;

  const post = await Post.findByPk(id);
  if (!post) {
    return res.status(404).json({
      status: false,
      message: "Post not found",
    });
  }

  // Check if user can update this post
  if (userType !== "admin" && post.user_id !== userId) {
    return res.status(403).json({
      status: false,
      message: "Access denied",
    });
  }

  if (typeof platforms === "string") {
    try {
      platforms = JSON.parse(platforms);
    } catch {
      platforms = [platforms];
    }
  }

  const updateData = {};
  if (title) updateData.title = title;
  if (content) updateData.content = content;
  if (platforms) updateData.platforms = platforms;
  if (status) updateData.status = status;
  if (scheduled_at !== undefined) updateData.scheduled_at = scheduled_at;
  if (category) updateData.category = category;
  if (tags) updateData.tags = tags;
  if (media_urls) updateData.media_urls = media_urls;

  await Post.update(updateData, { where: { id } });

  const updatedPost = await Post.findByPk(id, {
    include: [
      {
        model: User,
        as: "User",
        attributes: ["id", "user_name", "email", "user_fname", "user_lname"],
      },
    ],
  });

  // Facebook publish logic if status changed to published
  if (status === "published") {
    const socialAccount = await SocialAccount.findOne({
      where: { user_id: userId, platform: "Facebook", is_active: 1 },
    });
    if (socialAccount && socialAccount.access_token) {
      try {
        const postData = await facebookPost(
          socialAccount.access_token,
          content,
          image_url
        );
        logger.info("Facebook post published (update)", { userId, postId: id });
        return res.json({
          status: true,
          message: "Post updated and published to Facebook",
          fb: postData,
          data: { post: updatedPost },
        });
      } catch (err) {
        logger.error("Facebook publish error (update)", { error: err.message });
        return res.status(500).json({
          status: false,
          message: "Facebook publish failed",
          error: err.message,
        });
      }
    }
  }

  logger.info("Post updated", { postId: id, userId });
  res.json({
    status: true,
    message: "Post updated successfully",
    data: { post: updatedPost },
  });
});

const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userType = req.user.user_type;

  const post = await Post.findByPk(id);
  if (!post) {
    return res.status(404).json({
      status: false,
      message: "Post not found",
    });
  }

  // Check if user can delete this post
  if (userType !== "admin" && post.user_id !== userId) {
    return res.status(403).json({
      status: false,
      message: "Access denied",
    });
  }

  await Post.destroy({ where: { id } });

  logger.info("Post deleted", { postId: id, userId });

  res.json({
    status: true,
    message: "Post deleted successfully",
  });
});

////////////////-------genrrate Ai code  Start------///////////

// Groq API Configuration
// const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
// const GROQ_API_KEY = process.env.GROQ_API_KEY;

const generateAIPost = asyncHandler(async (req, res) => {
  let { title, ai_prompt, image_prompt } = req.body;
  const userId = req.user.id;

  ai_prompt = title ? `Title: ${title}\nDetails: ${ai_prompt}` : ai_prompt;

  // ✅ Find active subscription
  const subscription = await Subscription.findOne({
    where: {
      user_id: userId,
      status: "active",
    },
    include: [{ model: Plan, as: "Plan" }],
    order: [["created_at", "DESC"]],
  });

  // ✅ Check if user has an active subscription
  if (!subscription || !subscription.Plan) {
    return res.status(400).json({
      status: false,
      message:
        "No active subscription found. Please purchase or renew your plan.",
    });
  }

  // 🔥 Check AI post limit (AI posts used >= Plan limit)
  if (subscription.ai_posts_used >= subscription.Plan.ai_posts) {
    // 🔥 Automatically mark subscription as inactive
    await Subscription.update(
      { status: "inactive" },
      { where: { id: subscription.id } }
    );

    return res.status(400).json({
      status: false,
      message:
        "AI post limit reached. Please subscribe to a new plan to continue.",
    });
  }

  // ✅ Generate AI post content & image
  let generatedContent = "";
  let imageUrl = "";

  if (image_prompt && image_prompt.trim() !== "") {
    const imageObj = await generateImagePollinations(image_prompt);
    imageUrl = imageObj.url || "";
  }

  generatedContent = await generateAIContent(ai_prompt);
  if (generatedContent.status === false) {
    return res.status(500).json({
      status: false,
      message: JSON.stringify(generatedContent.msg),
      error: generatedContent.msg,
    });
  }

  // ✅ Log and respond
  logger.info("AI post generated", { userId, ai_prompt });

  // 🔥 Increment AI posts used count
  await Subscription.update(
    {
      ai_posts_used: subscription.ai_posts_used + 1,
    },
    { where: { id: subscription.id } }
  );

  // 🔥 Check if limit reached after increment and mark as inactive
  if (subscription.ai_posts_used + 1 >= subscription.Plan.ai_posts) {
    await Subscription.update(
      { status: "inactive" },
      { where: { id: subscription.id } }
    );

    logger.info("Subscription marked as inactive - AI post limit reached", {
      subscriptionId: subscription.id,
      userId,
    });
  }

  return res.json({
    status: true,
    message: "AI post generated successfully",
    data: {
      content: generatedContent.content,
      ai_prompt: ai_prompt,
      imageUrl: imageUrl,
    },
  });
});

async function getGroqConfig() {
  const setting = await SystemSetting.findOne({ where: { id: 1 } });
  return {
    api_key: setting?.api_key || "",
    api_url:
      setting?.api_url || "https://api.groq.com/openai/v1/chat/completions",
  };
}

// Main function - AI se content generate karne ke liye
async function generateAIContent1(prompt, options = {}) {
  try {
    const {
      model = "llama-3.3-70b-versatile",
      temperature = 0.7,
      maxTokens = 1024,
    } = options;

    console.log("🚀 Groq AI se request bhej rahe hain...\n");

    // Fetch Groq API key and URL from DB
    const groqConfig = await getGroqConfig();
    const groqApiKey = groqConfig.api_key;
    const groqApiUrl = groqConfig.api_url;

    const response = await axios.post(
      groqApiUrl,
      {
        model: model,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: temperature,
        max_tokens: maxTokens,
        top_p: 1,
        stream: false,
      },
      {
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.choices[0].message.content;
    const usage = response.data.usage;

    // console.log('✅ Response mil gaya!\n');
    // console.log('📊 Token Usage:', {
    //     prompt: usage.prompt_tokens,
    //     completion: usage.completion_tokens,
    //     total: usage.total_tokens
    // });

    return { status: true, content: content };
  } catch (error) {
    // console.log("error", error);

    if (error.response) {
      // console.log('❌ API Error:', error.response.data);
      return {
        status: false,
        msg: error.response.data.error.message || "API Error",
      };
    } else {
      // console.log('❌ Error:', error.message);
      return { status: false, msg: error.message };
    }
    throw error;
  }
}

async function generateAIContent(prompt, options = {}) {
  const {
    model = "llama-3.3-70b-versatile",
    temperature = 0.7,
    maxTokens = 1024,
    retries = 3, // max retry attempts
    retryDelay = 90000, // default 90 sec if rate limit reached
  } = options;

  try {
    console.log("🚀 Groq AI se request bhej rahe hain...\n");

    // Get API config
    const groqConfig = await getGroqConfig();
    const groqApiKey = groqConfig.api_key;
    const groqApiUrl = groqConfig.api_url;

    // Make API request
    const response = await axios.post(
      groqApiUrl,
      {
        model,
        messages: [{ role: "user", content: prompt }],
        temperature,
        max_tokens: maxTokens,
        top_p: 1,
        stream: false,
      },
      {
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 60000, // 60 sec timeout
      }
    );

    const content = response.data.choices[0].message.content;
    const usage = response.data.usage;

    // console.log('✅ Response mil gaya!\n');
    // console.log('📊 Token Usage:', {
    //   prompt: usage.prompt_tokens,
    //   completion: usage.completion_tokens,
    //   total: usage.total_tokens
    // });

    return { status: true, content };
  } catch (error) {
    // If rate limit reached, wait and retry
    if (
      error.response?.data?.error?.code === "rate_limit_exceeded" &&
      retries > 0
    ) {
      const waitTime =
        (error.response.data.error.message.match(/in (\d+m?\d*\.?\d*)s/)?.[1] ||
          90) * 1000;
      console.warn(
        `⚠️ Rate limit reached. Waiting ${waitTime / 1000}s before retry...`
      );
      await new Promise((r) => setTimeout(r, waitTime));
      return generateAIContent(prompt, { ...options, retries: retries - 1 });
    }

    // Other API or network errors
    if (error.response) {
      console.error("❌ API Error:", error.response.data);
      return { status: false, msg: error.response.data };
    } else {
      console.error("❌ Error:", error.message);
      return { status: false, msg: error.message };
    }
  }
}
// Available Models (update to latest Groq supported models)
const GROQ_MODELS = {
  MIXTRAL: "mixtral-8x7b-32768", // Large context, supported
  GEMMA_7B: "gemma-7b-it", // Google's model (update name)
  LLAMA_8B: "llama-3-8b-8192", // Fastest (if available)
  LLAMA_70B: "llama-3-70b-8192", // If available for your account
};
// Chat history ke saath conversation
async function chatWithAI(messages) {
  try {
    const groqConfig = await getGroqConfig();
    const groqApiKey = groqConfig.api_key;
    const groqApiUrl = groqConfig.api_url;
    const response = await axios.post(
      groqApiUrl,
      {
        model: GROQ_MODELS.LLAMA_70B,
        messages: messages, // Array of {role, content}
        temperature: 0.7,
        max_tokens: 1024,
      },
      {
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    //.log('✅ Chat response mil gaya!\n');
    // console.log('Response:', response.data);

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Chat Error:", error.response?.data || error.message);
    throw error;
  }
}

// function for Image generate
async function generateImagePollinations(prompt, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🎨 Image generating... (Attempt ${attempt}/${retries})`);
      console.log("Prompt:", prompt);

      // Replace spaces with underscores for better Pollinations API compatibility
      const cleanPrompt = prompt.trim().replace(/\s+/g, "_");
      const encodedPrompt = encodeURIComponent(cleanPrompt);

      const urls = [
        `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`,
        `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&width=1024&height=1024&nologo=true`,
        `https://pollinations.ai/p/${encodedPrompt}`,
      ];

      const imageUrl = urls[attempt - 1] || urls[0];
      console.log("Requesting URL:", imageUrl);

      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        timeout: 45000,
        maxRedirects: 10,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!response.data || response.data.length < 1000) {
        throw new Error("Invalid or empty image received");
      }

      const filename = `generated_${Date.now()}.png`;
      // fs.writeFileSync(filename, response.data);

      const sizeKB = (response.data.length / 1024).toFixed(2);
      console.log(`✅ Image saved: ${filename} (${sizeKB} KB)`);

      return {
        url: imageUrl,
        filename,
        size: response.data.length,
        prompt: cleanPrompt,
      };
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);

      if (attempt === retries) {
        console.error("All attempts failed. Using fallback...");
        return await generateImageFallback(prompt);
      }

      const waitTime = attempt * 2000;
      console.log(`⏳ Waiting ${waitTime / 1000}s before retry...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}

async function generateImageFallback(prompt) {
  try {
    console.log("🔄 Using fallback API...");

    // Option 1: Picsum (random image based on seed)
    const seed = prompt.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    const imageUrl = `https://picsum.photos/seed/${seed}/1024/1024`;

    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
    });

    const filename = `fallback_${Date.now()}.jpg`;
    // fs.writeFileSync(filename, response.data);

    console.log(`✅ Fallback image saved: ${filename}`);
    console.log("⚠️ Note: Stock photo (not AI-generated)");

    return {
      url: imageUrl,
      filename,
      size: response.data.length,
      isFallback: true,
    };
  } catch (error) {
    console.error("❌ Fallback failed:", error.message);
    throw new Error("All image generation methods failed");
  }
}

////////////////-------genrrate Ai code End------///////////

const publishPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userType = req.user.user_type;

  const post = await Post.findByPk(id);
  if (!post) {
    return res.status(404).json({
      status: false,
      message: "Post not found",
    });
  }

  if (post.review_status !== "approved") {
    return res.status(400).json({
      status: false,
      message: "Post cannot be published until it is manually approved.",
    });
  }

  // Check if user can publish this post
  if (userType !== "admin" && post.user_id !== userId) {
    return res.status(403).json({
      status: false,
      message: "Access denied",
    });
  }

  // Get all active social accounts for user
  const socialAccounts = await SocialAccount.findAll({
    where: { user_id: userId, is_active: true },
  });

  // Send post to each connected platform
  for (const account of socialAccounts) {
    if (account.platform === "Facebook") {
      // Example: Post to Facebook page (replace with actual logic)
      try {
        const pageId = account.account_id;
        const pageAccessToken = account.access_token;
        if (pageId && pageAccessToken) {
          await axios.post(`https://graph.facebook.com/${pageId}/feed`, {
            message: post.content,
            access_token: pageAccessToken,
          });
        }
      } catch (err) {
        logger.error("Facebook publish error", { error: err.message });
      }
    }
    if (account.platform === "Instagram") {
      // Example: Post to Instagram (replace with actual logic)
      try {
        const igUserId = account.account_id;
        const igAccessToken = account.access_token;
        if (igUserId && igAccessToken) {
          await axios.post(`https://graph.instagram.com/${igUserId}/media`, {
            caption: post.content,
            access_token: igAccessToken,
          });
        }
      } catch (err) {
        logger.error("Instagram publish error", { error: err.message });
      }
    }
  }

  await Post.update(
    {
      status: "published",
      published_at: new Date(),
    },
    { where: { id } }
  );

  logger.info("Post published", { postId: id, userId });

  res.json({
    status: true,
    message: "Post published successfully and sent to connected platforms.",
  });
});

const approvePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { review_status } = req.body;
  const userId = req.user.id;
  const userType = req.user.user_type;

  console.log("=== APPROVE POST CALLED ===");
  console.log("Post ID:", id);
  console.log("Review Status:", review_status);
  console.log("User Type:", userType);

  // ✅ Validate review_status
  if (!review_status || !["approved", "rejected"].includes(review_status)) {
    return res.status(400).json({
      status: false,
      message: "Invalid review_status. Must be 'approved' or 'rejected'.",
    });
  }

  // ✅ Find the post
  const post = await Post.findByPk(id);

  if (!post) {
    return res.status(404).json({
      status: false,
      message: "Post not found",
    });
  }

  // console.log('Current post status:', post.status);
  // console.log('Current review_status:', post.review_status);

  // ✅ Check scheduled time (only if scheduled_at exists)
  if (post.scheduled_at) {
    const now = moment().tz("Asia/Kolkata");
    const scheduledTime = moment(post.scheduled_at).tz("Asia/Kolkata");

    console.log("Now:", now.format());
    console.log("Scheduled:", scheduledTime.format());

    if (now.isAfter(scheduledTime)) {
      return res.status(400).json({
        status: false,
        message: "Cannot approve/reject post after scheduled time has passed.",
      });
    }
  }

  // ✅ Update review_status in database
  const [updatedRows] = await Post.update({ review_status }, { where: { id } });

  console.log("Updated rows:", updatedRows);

  if (updatedRows === 0) {
    return res.status(500).json({
      status: false,
      message: "Failed to update post review status",
    });
  }

  // ✅ Fetch updated post
  const updatedPost = await Post.findByPk(id, {
    include: [
      {
        model: User,
        as: "User",
        attributes: ["id", "user_name", "email", "user_fname", "user_lname"],
      },
    ],
  });

  console.log("Updated post review_status:", updatedPost.review_status);

  logger.info(`Post ${review_status}`, { postId: id, userId });

  return res.json({
    status: true,
    message: `Post ${review_status} successfully`,
    data: { post: updatedPost },
  });
});

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  generateAIPost,
  publishPost,
  approvePost,
};
