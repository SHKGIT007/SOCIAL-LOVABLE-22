const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../Middleware/auth.middleware');
const { 
    validateUserRegistration, 
    validateUserLogin, 
    validateUserUpdate,
    validateChangePassword,
    validateResetPassword
} = require('../Middleware/validation.middleware');

// Public routes
router.post('/register', validateUserRegistration, authController.register);
router.post('/login', validateUserLogin, authController.login);
router.post('/social-complete', authController.completeSocialSignup);
router.post('/complete-social-signup', authController.completeSocialSignupV2);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, validateUserUpdate, authController.updateProfile);
router.put('/change-password', authenticateToken, validateChangePassword, authController.changePassword);
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', validateResetPassword,authController.resetPassword);
router.post('/send-otp-forgot-password', authController.sendOTPforgotPassword);
router.post('/verify-forgot-password-otp', authController.verifyOTPforgotPassword);

module.exports = router;

