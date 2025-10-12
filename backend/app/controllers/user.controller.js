const bcrypt = require('bcryptjs');
const { User, Role, Subscription, Post, Plan } = require('../models');
const { Op } = require('sequelize');
const { asyncHandler } = require('../middleware/error.middleware');
const logger = require('../config/logger');

const createUser = asyncHandler(async (req, res) => {
    const { user_name, email, password, user_fname, user_lname, user_phone, user_type } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        return res.status(409).json({
            status: false,
            message: 'User already exists with this email'
        });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Determine role_id based on user_type
    const roleId = user_type === 'admin' ? 1 : 2;

    // Create user
    const user = await User.create({
        user_name,
        email,
        password: hashedPassword,
        user_fname,
        user_lname,
        user_phone,
        user_type: user_type || 'client',
        role_id: roleId
    });

    logger.info('User created by admin', { userId: user.id, email: user.email, createdBy: req.user.id });

    res.status(201).json({
        status: true,
        message: 'User created successfully',
        data: {
            user: {
                id: user.id,
                user_name: user.user_name,
                email: user.email,
                user_fname: user.user_fname,
                user_lname: user.user_lname,
                user_type: user.user_type,
                created_at: user.created_at
            }
        }
    });
});

const getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, user_type } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
        whereClause[Op.or] = [
            { user_name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { user_fname: { [Op.like]: `%${search}%` } },
            { user_lname: { [Op.like]: `%${search}%` } }
        ];
    }
    if (user_type) {
        whereClause.user_type = user_type;
    }

    const { count, rows: users } = await User.findAndCountAll({
        where: whereClause,
        include: [
            { model: Role, as: 'Role' },
            { 
                model: Subscription, 
                as: 'Subscriptions',
                where: { status: 'active' },
                required: false,
                include: [{ model: Plan, as: 'Plan' }]
            }
        ],
        attributes: { exclude: ['password'] },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
    });

    const formattedUsers = users.map(user => ({
        id: user.id,
        user_name: user.user_name,
        email: user.email,
        user_fname: user.user_fname,
        user_lname: user.user_lname,
        user_type: user.user_type,
        role: user.Role?.name,
        subscription: user.Subscriptions?.[0] ? {
            plan: user.Subscriptions[0].Plan?.name,
            status: user.Subscriptions[0].status
        } : null,
        created_at: user.created_at
    }));

    res.json({
        status: true,
        data: {
            users: formattedUsers,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        }
    });
});

const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findByPk(id, {
        include: [
            { model: Role, as: 'Role' },
            { 
                model: Subscription, 
                as: 'Subscriptions',
                include: [{ model: Plan, as: 'Plan' }]
            },
            { 
                model: Post, 
                as: 'Posts',
                limit: 10,
                order: [['created_at', 'DESC']]
            }
        ],
        attributes: { exclude: ['password'] }
    });

    if (!user) {
        return res.status(404).json({
            status: false,
            message: 'User not found'
        });
    }

    res.json({
        status: true,
        data: { user }
    });
});

const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { user_name, user_fname, user_lname, user_phone, user_type, email } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
        return res.status(404).json({
            status: false,
            message: 'User not found'
        });
    }

    const updateData = {};
    if (user_name) updateData.user_name = user_name;
    if (user_fname) updateData.user_fname = user_fname;
    if (user_lname) updateData.user_lname = user_lname;
    if (user_phone) updateData.user_phone = user_phone;
    if (user_type) {
        updateData.user_type = user_type;
        updateData.role_id = user_type === 'admin' ? 1 : 2;
    }
    if (email) updateData.email = email;

    await User.update(updateData, { where: { id } });

    const updatedUser = await User.findByPk(id, {
        include: [{ model: Role, as: 'Role' }],
        attributes: { exclude: ['password'] }
    });

    logger.info('User updated by admin', { userId: id, updatedBy: req.user.id });

    res.json({
        status: true,
        message: 'User updated successfully',
        data: { user: updatedUser }
    });
});

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
        return res.status(404).json({
            status: false,
            message: 'User not found'
        });
    }

    // Check if user is trying to delete themselves
    if (id === req.user.id) {
        return res.status(400).json({
            status: false,
            message: 'Cannot delete your own account'
        });
    }

    await User.destroy({ where: { id } });

    logger.info('User deleted by admin', { userId: id, deletedBy: req.user.id });

    res.json({
        status: true,
        message: 'User deleted successfully'
    });
});

const getUserStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const [totalPosts, aiPosts, scheduledPosts, publishedPosts] = await Promise.all([
        Post.count({ where: { user_id: userId } }),
        Post.count({ where: { user_id: userId, is_ai_generated: true } }),
        Post.count({ where: { user_id: userId, status: 'scheduled' } }),
        Post.count({ where: { user_id: userId, status: 'published' } })
    ]);

    res.json({
        status: true,
        data: {
            stats: {
                totalPosts,
                aiPosts,
                scheduledPosts,
                publishedPosts
            }
        }
    });
});

const getAdminStats = asyncHandler(async (req, res) => {
    const [totalUsers, totalPosts, activeSubscriptions] = await Promise.all([
        User.count(),
        Post.count(),
        Subscription.count({ where: { status: 'active' } })
    ]);

    // Calculate total revenue (simplified)
    const subscriptions = await Subscription.findAll({
        where: { status: 'active' },
        include: [{ model: Plan, as: 'Plan' }]
    });

    const totalRevenue = subscriptions.reduce((sum, sub) => {
        return sum + (sub.Plan?.price || 0);
    }, 0);

    res.json({
        status: true,
        data: {
            stats: {
                totalUsers,
                totalPosts,
                activeSubscriptions,
                totalRevenue
            }
        }
    });
});

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUserStats,
    getAdminStats
};
