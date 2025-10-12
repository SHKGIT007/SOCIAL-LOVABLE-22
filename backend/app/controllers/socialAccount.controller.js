const { SocialAccount, User } = require('../models');
const { Op } = require('sequelize');
const { asyncHandler } = require('../middleware/error.middleware');
const logger = require('../config/logger');

const createSocialAccount = asyncHandler(async (req, res) => {
    const { platform, account_id, account_name, access_token, refresh_token, token_expires_at, metadata } = req.body;
    const userId = req.user.id;

    // Check if user already has this platform connected
    const existingAccount = await SocialAccount.findOne({
        where: { user_id: userId, platform }
    });

    if (existingAccount) {
        return res.status(409).json({
            status: false,
            message: `${platform} account already connected`
        });
    }

    const socialAccount = await SocialAccount.create({
        user_id: userId,
        platform,
        account_id,
        account_name,
        access_token,
        refresh_token,
        token_expires_at,
        metadata,
        is_active: true
    });

    logger.info('Social account connected', { accountId: socialAccount.id, userId, platform });

    res.status(201).json({
        status: true,
        message: `${platform} account connected successfully`,
        data: { socialAccount }
    });
});

const getAllSocialAccounts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, platform, is_active, user_id } = req.query;
    const offset = (page - 1) * limit;
    const userType = req.user.user_type;
    const userId = req.user.id;

    const whereClause = {};
    
    // If not admin, only show user's own accounts
    if (userType !== 'admin') {
        whereClause.user_id = userId;
    } else if (user_id) {
        whereClause.user_id = user_id;
    }

    if (platform) {
        whereClause.platform = platform;
    }

    if (is_active !== undefined) {
        whereClause.is_active = is_active === 'true';
    }

    const { count, rows: socialAccounts } = await SocialAccount.findAndCountAll({
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
            socialAccounts,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        }
    });
});

const getUserSocialAccounts = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const socialAccounts = await SocialAccount.findAll({
        where: { user_id: userId },
        order: [['platform', 'ASC']]
    });

    res.json({
        status: true,
        data: { socialAccounts }
    });
});

const getSocialAccountById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userType = req.user.user_type;
    const userId = req.user.id;

    const socialAccount = await SocialAccount.findByPk(id, {
        include: [
            { 
                model: User, 
                as: 'User',
                attributes: ['id', 'user_name', 'email', 'user_fname', 'user_lname']
            }
        ]
    });

    if (!socialAccount) {
        return res.status(404).json({
            status: false,
            message: 'Social account not found'
        });
    }

    // Check if user can access this social account
    if (userType !== 'admin' && socialAccount.user_id !== userId) {
        return res.status(403).json({
            status: false,
            message: 'Access denied'
        });
    }

    res.json({
        status: true,
        data: { socialAccount }
    });
});

const updateSocialAccount = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { account_name, access_token, refresh_token, token_expires_at, metadata, is_active } = req.body;
    const userType = req.user.user_type;
    const userId = req.user.id;

    const socialAccount = await SocialAccount.findByPk(id);
    if (!socialAccount) {
        return res.status(404).json({
            status: false,
            message: 'Social account not found'
        });
    }

    // Check if user can update this social account
    if (userType !== 'admin' && socialAccount.user_id !== userId) {
        return res.status(403).json({
            status: false,
            message: 'Access denied'
        });
    }

    const updateData = {};
    if (account_name) updateData.account_name = account_name;
    if (access_token) updateData.access_token = access_token;
    if (refresh_token) updateData.refresh_token = refresh_token;
    if (token_expires_at) updateData.token_expires_at = token_expires_at;
    if (metadata) updateData.metadata = metadata;
    if (is_active !== undefined) updateData.is_active = is_active;

    await SocialAccount.update(updateData, { where: { id } });

    const updatedSocialAccount = await SocialAccount.findByPk(id, {
        include: [
            { 
                model: User, 
                as: 'User',
                attributes: ['id', 'user_name', 'email', 'user_fname', 'user_lname']
            }
        ]
    });

    logger.info('Social account updated', { accountId: id, updatedBy: req.user.id });

    res.json({
        status: true,
        message: 'Social account updated successfully',
        data: { socialAccount: updatedSocialAccount }
    });
});

const deleteSocialAccount = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userType = req.user.user_type;
    const userId = req.user.id;

    const socialAccount = await SocialAccount.findByPk(id);
    if (!socialAccount) {
        return res.status(404).json({
            status: false,
            message: 'Social account not found'
        });
    }

    // Check if user can delete this social account
    if (userType !== 'admin' && socialAccount.user_id !== userId) {
        return res.status(403).json({
            status: false,
            message: 'Access denied'
        });
    }

    await SocialAccount.destroy({ where: { id } });

    logger.info('Social account deleted', { accountId: id, deletedBy: req.user.id });

    res.json({
        status: true,
        message: 'Social account deleted successfully'
    });
});

const toggleSocialAccountStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const socialAccount = await SocialAccount.findByPk(id);
    if (!socialAccount) {
        return res.status(404).json({
            status: false,
            message: 'Social account not found'
        });
    }

    // Check if user can toggle this social account
    if (socialAccount.user_id !== userId) {
        return res.status(403).json({
            status: false,
            message: 'Access denied'
        });
    }

    const newStatus = !socialAccount.is_active;
    await SocialAccount.update({ is_active: newStatus }, { where: { id } });

    logger.info('Social account status toggled', { accountId: id, newStatus, userId });

    res.json({
        status: true,
        message: `Social account ${newStatus ? 'activated' : 'deactivated'} successfully`,
        data: { is_active: newStatus }
    });
});

const refreshSocialAccountToken = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { access_token, refresh_token, token_expires_at } = req.body;
    const userId = req.user.id;

    const socialAccount = await SocialAccount.findByPk(id);
    if (!socialAccount) {
        return res.status(404).json({
            status: false,
            message: 'Social account not found'
        });
    }

    // Check if user can refresh this social account token
    if (socialAccount.user_id !== userId) {
        return res.status(403).json({
            status: false,
            message: 'Access denied'
        });
    }

    const updateData = {};
    if (access_token) updateData.access_token = access_token;
    if (refresh_token) updateData.refresh_token = refresh_token;
    if (token_expires_at) updateData.token_expires_at = token_expires_at;

    await SocialAccount.update(updateData, { where: { id } });

    logger.info('Social account token refreshed', { accountId: id, userId });

    res.json({
        status: true,
        message: 'Social account token refreshed successfully'
    });
});

module.exports = {
    createSocialAccount,
    getAllSocialAccounts,
    getUserSocialAccounts,
    getSocialAccountById,
    updateSocialAccount,
    deleteSocialAccount,
    toggleSocialAccountStatus,
    refreshSocialAccountToken
};
