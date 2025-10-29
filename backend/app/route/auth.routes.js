const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { 
    validateUserRegistration, 
    validateUserLogin, 
    validateUserUpdate 
} = require('../middleware/validation.middleware');

// Public routes
router.post('/register', validateUserRegistration, authController.register);
router.post('/login', validateUserLogin, authController.login);
// Social login routes

// OTP/email verification route
// router.post('/verify-otp', authController.verifyOtp);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, validateUserUpdate, authController.updateProfile);
router.put('/change-password', authenticateToken, authController.changePassword);

module.exports = router;
