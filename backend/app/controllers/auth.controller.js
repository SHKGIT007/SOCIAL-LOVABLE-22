const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const { asyncHandler } = require('../middleware/error.middleware');
const logger = require('../config/logger');

const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

const register = asyncHandler(async (req, res) => {
    const { user_name, email, password, user_fname, user_lname, user_phone } = req.body;

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

    // Create user
    const user = await User.create({
        user_name,
        email,
        password: hashedPassword,
        user_fname,
        user_lname,
        user_phone,
        user_type: 'client',
        role_id: 2 // Default client role
    });

    // Generate token
    const token = generateToken(user.id);

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    res.status(201).json({
        status: true,
        message: 'User registered successfully',
        data: {
            user: {
                id: user.id,
                user_name: user.user_name,
                email: user.email,
                user_fname: user.user_fname,
                user_lname: user.user_lname,
                user_type: user.user_type
            },
            token
        }
    });
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;


    // Find user
    const user = await User.findOne({
        where: { email },
        include: [{ model: Role, as: 'Role' }]
    });

    if (!user) {
        return res.status(401).json({
            status: false,
            message: 'Invalid email or password'
        });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({
            status: false,
            message: 'Invalid email or password'
        });
    }

    // Generate token
    const token = generateToken(user.id);

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

    res.json({
        status: true,
        message: 'Login successful',
        data: {
            user: {
                id: user.id,
                user_name: user.user_name,
                email: user.email,
                user_fname: user.user_fname,
                user_lname: user.user_lname,
                user_type: user.user_type,
                role: user.Role?.name
            },
            token
        }
    });
});

const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id, {
        include: [{ model: Role, as: 'Role' }],
        attributes: { exclude: ['password'] }
    });

    res.json({
        status: true,
        data: {
            user: {
                id: user.id,
                user_name: user.user_name,
                email: user.email,
                user_fname: user.user_fname,
                user_lname: user.user_lname,
                user_phone: user.user_phone,
                user_type: user.user_type,
                avatar_url: user.avatar_url,
                full_name: user.full_name,
                role: user.Role?.name,
                created_at: user.created_at
            }
        }
    });
});

const updateProfile = asyncHandler(async (req, res) => {
    const { user_name, user_fname, user_lname, user_phone, full_name } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (user_name) updateData.user_name = user_name;
    if (user_fname) updateData.user_fname = user_fname;
    if (user_lname) updateData.user_lname = user_lname;
    if (user_phone) updateData.user_phone = user_phone;
    if (full_name) updateData.full_name = full_name;

    const user = await User.update(updateData, {
        where: { id: userId },
        returning: true
    });

    const updatedUser = await User.findByPk(userId, {
        include: [{ model: Role, as: 'Role' }],
        attributes: { exclude: ['password'] }
    });

    logger.info('User profile updated', { userId });

    res.json({
        status: true,
        message: 'Profile updated successfully',
        data: {
            user: {
                id: updatedUser.id,
                user_name: updatedUser.user_name,
                email: updatedUser.email,
                user_fname: updatedUser.user_fname,
                user_lname: updatedUser.user_lname,
                user_phone: updatedUser.user_phone,
                user_type: updatedUser.user_type,
                avatar_url: updatedUser.avatar_url,
                full_name: updatedUser.full_name,
                role: updatedUser.Role?.name
            }
        }
    });
});

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get user with password
    const user = await User.findByPk(userId);
    if (!user) {
        return res.status(404).json({
            status: false,
            message: 'User not found'
        });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
        return res.status(400).json({
            status: false,
            message: 'Current password is incorrect'
        });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await User.update(
        { password: hashedNewPassword },
        { where: { id: userId } }
    );

    logger.info('User password changed', { userId });

    res.json({
        status: true,
        message: 'Password changed successfully'
    });
});

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
};
