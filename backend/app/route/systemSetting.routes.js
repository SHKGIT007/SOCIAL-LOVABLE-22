const express = require('express');
const router = express.Router();
const { 
  getSystemSettings, 
  updateSystemSettings,
  getAIProviderCredentials,
  getCloudinaryCredentials,
  getGoogleOAuthCredentials,
  getFacebookCredentials,
  getRazorpayCredentials,
  getSMTPCredentials
} = require('../controllers/systemSetting.controller');

router.get('/', getSystemSettings);
router.get('/ai-provider', getAIProviderCredentials);
router.get('/cloudinary', getCloudinaryCredentials);
router.get('/google-oauth', getGoogleOAuthCredentials);
router.get('/facebook', getFacebookCredentials);
router.get('/razorpay', getRazorpayCredentials);
router.get('/smtp', getSMTPCredentials);
router.post('/update', updateSystemSettings);

module.exports = router;
