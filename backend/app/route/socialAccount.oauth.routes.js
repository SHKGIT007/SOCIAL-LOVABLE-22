const express = require('express');
const router = express.Router();
const passport = require('passport');
const { authenticateToken } = require('../middleware/auth.middleware');
const socialAccountController = require('../controllers/socialAccount.controller');

// Facebook OAuth2
router.get('/facebook', authenticateToken, socialAccountController.facebookOAuthInit);
router.get('/facebook/callback', authenticateToken, socialAccountController.facebookOAuthCallback);

// Instagram OAuth2
router.get('/instagram', authenticateToken, socialAccountController.instagramOAuthInit);
router.get('/instagram/callback', authenticateToken, socialAccountController.instagramOAuthCallback);

module.exports = router;
