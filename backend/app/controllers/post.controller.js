const { Post, User, Plan, Subscription } = require('../models');
const { Op } = require('sequelize');
const { asyncHandler } = require('../middleware/error.middleware');
const logger = require('../config/logger');
const { SocialAccount } = require('../models');
const axios = require('axios');
const {facebookPost} = require('../../redirectAuth/facebook/facebookPost');
const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
const fs = require('fs');



const createPost = asyncHandler(async (req, res) => {
    const { title, content, platforms, status, scheduled_at, media_urls, is_ai_generated, ai_prompt ,image_prompt,image_url } = req.body;
    const userId = req.user.id;


    

    // Check user's subscription limits
    const subscription = await Subscription.findOne({
        where: { user_id: userId, status: 'active' },
        include: [{ model: Plan, as: 'Plan' }]
    });

    if (subscription) {
        const plan = subscription.Plan;
        if (subscription.posts_used >= plan.monthly_posts) {
            return res.status(400).json({
                status: false,
                message: 'Monthly post limit reached'
            });
        }

        if (is_ai_generated && subscription.ai_posts_used >= plan.ai_posts) {
            return res.status(400).json({
                status: false,
                message: 'Monthly AI post limit reached'
            });
        }
    }

    // Save post in DB
    const post = await Post.create({
        title,
        content,
        platforms,
        status: status || 'draft',
        scheduled_at: scheduled_at || null,
        media_urls,
        is_ai_generated: is_ai_generated || false,
        ai_prompt,
        user_id: userId,
        image_prompt: image_prompt || null,
        image_url: image_url || null
    });

    // Update subscription usage
    if (subscription) {
        await Subscription.update(
            { 
                posts_used: subscription.posts_used + 1,
                ai_posts_used: is_ai_generated ? subscription.ai_posts_used + 1 : subscription.ai_posts_used
            },
            { where: { id: subscription.id } }
        );
    }

    // Facebook publish logic
    if (status === 'published') {
        const socialAccount = await SocialAccount.findOne({
            where: { user_id: userId, platform: 'Facebook', is_active: 1 }
        });
        if (socialAccount && socialAccount.access_token) {
            try {
                const postData = await facebookPost(socialAccount.access_token, content,image_url);
                logger.info('Facebook post published', { userId, postId: post.id });
                return res.json({ success: true, message: 'Post published to Facebook', fb: postData });
            } catch (err) {
                logger.error('Facebook publish error', { error: err.message });
                return res.status(500).json({ success: false, message: 'Facebook publish failed', error: err.message });
            }
        }
    }
    // For scheduled and draft, just save post, do not publish
    logger.info('Post created', { postId: post.id, userId });
    res.status(201).json({
        status: true,
        message: 'Post created successfully',
        data: { post }
    });
});

const getAllPosts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, status, user_id } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;
    const userType = req.user.user_type;

    const whereClause = {};
    
    // If not admin, only show user's own posts
    if (userType !== 'admin') {
        whereClause.user_id = userId;
    } else if (user_id) {
        whereClause.user_id = user_id;
    }

    if (search) {
        whereClause[Op.or] = [
            { title: { [Op.like]: `%${search}%` } },
            { content: { [Op.like]: `%${search}%` } }
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
                as: 'User',
                attributes: ['id', 'user_name', 'email', 'user_fname', 'user_lname']
            }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
    });

    console.log("post",posts)

    res.json({
        status: true,
        data: {
            posts,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        }
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
                as: 'User',
                attributes: ['id', 'user_name', 'email', 'user_fname', 'user_lname']
            }
        ]
    });

    if (!post) {
        return res.status(404).json({
            status: false,
            message: 'Post not found'
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
        data: { post }
    });
});

const updatePost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, content, platforms, status, scheduled_at, category, tags, media_urls ,image_url} = req.body;
    const userId = req.user.id;
    const userType = req.user.user_type;


   
    const post = await Post.findByPk(id);
    if (!post) {
        return res.status(404).json({
            status: false,
            message: 'Post not found'
        });
    }

    // Check if user can update this post
    if (userType !== 'admin' && post.user_id !== userId) {
        return res.status(403).json({
            status: false,
            message: 'Access denied'
        });
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
                as: 'User',
                attributes: ['id', 'user_name', 'email', 'user_fname', 'user_lname']
            }
        ]
    });

    // Facebook publish logic if status changed to published
    if (status === 'published') {
        const socialAccount = await SocialAccount.findOne({
            where: { user_id: userId, platform: 'Facebook', is_active: 1 }
        });
        if (socialAccount && socialAccount.access_token) {
            try {
                const postData = await facebookPost(socialAccount.access_token, content ,image_url);
                logger.info('Facebook post published (update)', { userId, postId: id });
                return res.json({ status: true, message: 'Post updated and published to Facebook', fb: postData, data: { post: updatedPost } });
            } catch (err) {
                logger.error('Facebook publish error (update)', { error: err.message });
                return res.status(500).json({ status: false, message: 'Facebook publish failed', error: err.message });
            }
        }
    }

    logger.info('Post updated', { postId: id, userId });
    res.json({
        status: true,
        message: 'Post updated successfully',
        data: { post: updatedPost }
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
            message: 'Post not found'
        });
    }

    // Check if user can delete this post
    if (userType !== 'admin' && post.user_id !== userId) {
        return res.status(403).json({
            status: false,
            message: 'Access denied'
        });
    }

    await Post.destroy({ where: { id } });

    logger.info('Post deleted', { postId: id, userId });

    res.json({
        status: true,
        message: 'Post deleted successfully'
    });
});

const generateAIPost = asyncHandler(async (req, res) => {

    let {title, ai_prompt ,image_prompt } = req.body;
    const userId = req.user.id;
    ai_prompt = title?`Title: ${title}\nDetails: ${ai_prompt}`:ai_prompt;
    
    //let ss = await example1()
    const subscription = await Subscription.findOne({
        where: { user_id: userId, status: 'active' },
        include: [{ model: Plan, as: 'Plan' }]
    });

    if (subscription && subscription.ai_posts_used >= subscription.Plan.ai_posts) {
        return res.status(400).json({
            status: false,
            message: 'Monthly AI post limit reached'
        });
    }
    let generatedContent = '';
    let imageUrl = '';

    if (image_prompt !== '') {
        const imageObj = await generateImagePollinations(image_prompt);
        imageUrl = imageObj.url || '';
    }
    generatedContent = await generateAIContent(ai_prompt);

    logger.info('AI post generated', { userId, ai_prompt });
   return res.json({
        status: true,
        message: 'AI post generated successfully',
        data: {
            content: generatedContent,
            ai_prompt: ai_prompt,
            imageUrl: imageUrl
        }
    });
});






////////////////-------genrrate Ai code  Start------///////////

// Groq API Configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Main function - AI se content generate karne ke liye
async function generateAIContent(prompt, options = {}) {
  try {
    const {
      model = 'llama-3.3-70b-versatile', // Updated default model (currently supported)
      temperature = 0.7,
      maxTokens = 1024
    } = options;

    console.log('🚀 Groq AI se request bhej rahe hain...\n');

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: temperature,
        max_tokens: maxTokens,
        top_p: 1,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    const usage = response.data.usage;

    console.log('✅ Response mil gaya!\n');
    console.log('📊 Token Usage:', {
      prompt: usage.prompt_tokens,
      completion: usage.completion_tokens,
      total: usage.total_tokens
    });

    return content;

  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
    throw error;
  }
}
// Available Models (update to latest Groq supported models)
const GROQ_MODELS = {
    MIXTRAL: 'mixtral-8x7b-32768',             // Large context, supported
    GEMMA_7B: 'gemma-7b-it',                   // Google's model (update name)
    LLAMA_8B: 'llama-3-8b-8192',               // Fastest (if available)
    LLAMA_70B: 'llama-3-70b-8192'              // If available for your account
};
// Chat history ke saath conversation
async function chatWithAI(messages) {
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODELS.LLAMA_70B,
        messages: messages, // Array of {role, content}
        temperature: 0.7,
        max_tokens: 1024
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Chat response mil gaya!\n');
    console.log('Response:', response.data);

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Chat Error:', error.response?.data || error.message);
    throw error;
  }
}

// Example 1: Simple prompt
async function example1() {
  console.log('=== Example 1: Simple Prompt ===\n');
  
  const prompt = "JavaScript ke baare mein 5 interesting facts batao";
  const response = await generateAIContent(prompt);
  
  console.log('Response:\n', response);
  console.log('\n' + '='.repeat(50) + '\n');
}

// async function generateImagePollinations(prompt) {
//   try {
//     const encodedPrompt = encodeURIComponent(prompt);
//     const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;
    
//     console.log('🎨 Image generating...');
//     console.log('Image URL:', imageUrl);
    
//     // Download image
//     const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
//     const filename = `generated_${Date.now()}.png`;
//     fs.writeFileSync(filename, response.data);
    
//     console.log(`✅ Image saved: ${filename}`);
//     return { url: imageUrl, filename };
//   } catch (error) {
//     console.error('Pollinations Error:', error.message);
//     throw error;
//   }
// }


async function generateImagePollinations(prompt, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🎨 Image generating... (Attempt ${attempt}/${retries})`);
      console.log('Prompt:', prompt);
      
    // Replace spaces with underscores for better Pollinations API compatibility
    const cleanPrompt = prompt.trim().replace(/\s+/g, '_');
    const encodedPrompt = encodeURIComponent(cleanPrompt);
      
      const urls = [
        `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`,
        `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&width=1024&height=1024&nologo=true`,
        `https://pollinations.ai/p/${encodedPrompt}`
      ];
      
      const imageUrl = urls[attempt - 1] || urls[0];
      console.log('Requesting URL:', imageUrl);
      
      const response = await axios.get(imageUrl, { 
        responseType: 'arraybuffer',
        timeout: 45000,
        maxRedirects: 10,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.data || response.data.length < 1000) {
        throw new Error('Invalid or empty image received');
      }
      
      const filename = `generated_${Date.now()}.png`;
     // fs.writeFileSync(filename, response.data);
      
      const sizeKB = (response.data.length / 1024).toFixed(2);
      console.log(`✅ Image saved: ${filename} (${sizeKB} KB)`);
      
      return { 
        url: imageUrl, 
        filename,
        size: response.data.length,
        prompt: cleanPrompt
      };
      
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);
      
      if (attempt === retries) {
        console.error('All attempts failed. Using fallback...');
        return await generateImageFallback(prompt);
      }
      
      const waitTime = attempt * 2000;
      console.log(`⏳ Waiting ${waitTime/1000}s before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

// ⚠️ YE FUNCTION ADD KARNA PADEGA (missing hai)
async function generateImageFallback(prompt) {
  try {
    console.log('🔄 Using fallback API...');
    
    // Option 1: Picsum (random image based on seed)
    const seed = prompt.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const imageUrl = `https://picsum.photos/seed/${seed}/1024/1024`;
    
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000
    });
    
    const filename = `fallback_${Date.now()}.jpg`;
   // fs.writeFileSync(filename, response.data);
    
    console.log(`✅ Fallback image saved: ${filename}`);
    console.log('⚠️ Note: Stock photo (not AI-generated)');
    
    return {
      url: imageUrl,
      filename,
      size: response.data.length,
      isFallback: true
    };
  } catch (error) {
    console.error('❌ Fallback failed:', error.message);
    throw new Error('All image generation methods failed');
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
            message: 'Post not found'
        });
    }

    // Check if user can publish this post
    if (userType !== 'admin' && post.user_id !== userId) {
        return res.status(403).json({
            status: false,
            message: 'Access denied'
        });
    }

    // Get all active social accounts for user
    const socialAccounts = await SocialAccount.findAll({
        where: { user_id: userId, is_active: true }
    });

    // Send post to each connected platform
    for (const account of socialAccounts) {
        if (account.platform === 'Facebook') {
            // Example: Post to Facebook page (replace with actual logic)
            try {
                const pageId = account.account_id;
                const pageAccessToken = account.access_token;
                if (pageId && pageAccessToken) {
                    await axios.post(`https://graph.facebook.com/${pageId}/feed`, {
                        message: post.content,
                        access_token: pageAccessToken
                    });
                }
            } catch (err) {
                logger.error('Facebook publish error', { error: err.message });
            }
        }
        if (account.platform === 'Instagram') {
            // Example: Post to Instagram (replace with actual logic)
            try {
                const igUserId = account.account_id;
                const igAccessToken = account.access_token;
                if (igUserId && igAccessToken) {
                    await axios.post(`https://graph.instagram.com/${igUserId}/media`, {
                        caption: post.content,
                        access_token: igAccessToken
                    });
                }
            } catch (err) {
                logger.error('Instagram publish error', { error: err.message });
            }
        }
    }

    await Post.update(
        { 
            status: 'published',
            published_at: new Date()
        },
        { where: { id } }
    );

    logger.info('Post published', { postId: id, userId });

    res.json({
        status: true,
        message: 'Post published successfully and sent to connected platforms.'
    });
});

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    generateAIPost,
    publishPost
};
