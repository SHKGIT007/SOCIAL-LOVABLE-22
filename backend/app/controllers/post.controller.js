const { Post, User, Plan, Subscription } = require('../models');
const { Op } = require('sequelize');
const { asyncHandler } = require('../middleware/error.middleware');
const logger = require('../config/logger');
const { SocialAccount } = require('../models');
const axios = require('axios');
const {facebookPost} = require('../../redirectAuth/facebook/facebookPost');

const createPost = asyncHandler(async (req, res) => {
    const { title, content, platforms, status, scheduled_at, category, tags, media_urls, is_ai_generated, ai_prompt } = req.body;
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
        category,
        tags,
        media_urls,
        is_ai_generated: is_ai_generated || false,
        ai_prompt,
        user_id: userId
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
                const postData = await facebookPost(socialAccount.access_token, content);
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
    const userId = req.user.id;
    const userType = req.user.user_type;

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
    if (userType !== 'admin' && post.user_id !== userId) {
        return res.status(403).json({
            status: false,
            message: 'Access denied'
        });
    }

    res.json({
        status: true,
        data: { post }
    });
});

const updatePost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, content, platforms, status, scheduled_at, category, tags, media_urls } = req.body;
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
                const postData = await facebookPost(socialAccount.access_token, content || updatedPost.content);
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
    const { topic, wordCount, language, style, tone, audience, purpose } = req.body;
    const userId = req.user.id;

    // Check AI post limit
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

    // AI post generation using OpenAI ChatGPT
    const aiPrompt = `Generate a ${style.toLowerCase()} ${tone.toLowerCase()} post about ${topic} for ${audience} audience with ${purpose} purpose in ${language}. Word count: ${wordCount}`;

    let generatedContent = '';
    try {
        const openaiApiKey = process.env.OPENAI_API_KEY;
        if (!openaiApiKey) throw new Error('OpenAI API key not configured');
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful social media post generator.' },
                    { role: 'user', content: aiPrompt }
                ],
                max_tokens: 512,
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${openaiApiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        generatedContent = response.data.choices[0].message.content;
    } catch (err) {
        logger.error('AI post generation error', { error: err.message });
        return res.status(500).json({ status: false, message: 'AI post generation failed', error: err.message });
    }

    logger.info('AI post generated', { userId, topic });

    res.json({
        status: true,
        message: 'AI post generated successfully',
        data: {
            content: generatedContent,
            title: topic,
            ai_prompt: aiPrompt
        }
    });
});

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
