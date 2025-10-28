// Social Login: Google OAuth
const googleOAuth = asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ status: false, message: 'Google token required' });
    // Verify token with Google
    const googleApiUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`;
    const response = await require('axios').get(googleApiUrl);
    const profile = response.data;
    if (!profile.email) return res.status(400).json({ status: false, message: 'Invalid Google token' });
    // Find or create user
    let user = await User.findOne({ where: { email: profile.email } });
    if (!user) {
        user = await User.create({
            user_name: profile.name,
            email: profile.email,
            provider: 'google',
            provider_id: profile.sub,
            email_verified: profile.email_verified === 'true',
            avatar_url: profile.picture,
            password: '',
            user_type: 'client',
            role_id: 2
        });
    } else {
        await user.update({ provider: 'google', provider_id: profile.sub, email_verified: true, avatar_url: profile.picture });
    }
    // Generate token
    const tokenJwt = generateToken(user.id);
    res.json({ status: true, message: 'Google login successful', data: { user, token: tokenJwt } });
});

// Social Login: Facebook OAuth
const facebookOAuth = asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ status: false, message: 'Facebook token required' });
    // Verify token with Facebook
    const fbApiUrl = `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`;
    const response = await require('axios').get(fbApiUrl);
    const profile = response.data;
    if (!profile.email) return res.status(400).json({ status: false, message: 'Invalid Facebook token' });
    // Find or create user
    let user = await User.findOne({ where: { email: profile.email } });
    if (!user) {
        user = await User.create({
            user_name: profile.name,
            email: profile.email,
            provider: 'facebook',
            provider_id: profile.id,
            email_verified: true,
            avatar_url: profile.picture?.data?.url || '',
            password: '',
            user_type: 'client',
            role_id: 2
        });
    } else {
        await user.update({ provider: 'facebook', provider_id: profile.id, email_verified: true, avatar_url: profile.picture?.data?.url || '' });
    }
    // Generate token
    const tokenJwt = generateToken(user.id);
    res.json({ status: true, message: 'Facebook login successful', data: { user, token: tokenJwt } });
});
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
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

    // Generate OTP
    const otp = ('' + Math.floor(100000 + Math.random() * 900000));
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.update({ otp_code: otp, otp_expires: otpExpires });

    // Send OTP email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Verify your email',
      text: `Your OTP code is: ${otp}`
    });

    // Generate token
    const token = generateToken(user.id);

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    res.status(201).json({
        status: true,
        message: 'User registered successfully. OTP sent to email.',
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
// Verify OTP endpoint
const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ status: false, message: 'User not found' });
    if (user.email_verified) return res.json({ status: true, message: 'Email already verified' });
    if (!user.otp_code || !user.otp_expires) return res.status(400).json({ status: false, message: 'OTP not sent' });
    if (user.otp_expires < new Date()) return res.status(400).json({ status: false, message: 'OTP expired' });
    if (user.otp_code !== otp) return res.status(400).json({ status: false, message: 'Invalid OTP' });
    await user.update({ email_verified: true, otp_code: null, otp_expires: null });
    res.json({ status: true, message: 'Email verified successfully' });
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
    changePassword,
    verifyOtp,
    googleOAuth,
    facebookOAuth
};
