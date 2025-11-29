const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { 
    validateUserRegistration, 
    validateUserLogin, 
    validateUserUpdate,
    validateChangePassword
} = require('../middleware/validation.middleware');

// Public routes
router.post('/register', validateUserRegistration, authController.register);
router.post('/login', validateUserLogin, authController.login);
router.post('/social-complete', authController.completeSocialSignup);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, validateUserUpdate, authController.updateProfile);
router.put('/change-password', authenticateToken, validateChangePassword, authController.changePassword);
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);

module.exports = router;
