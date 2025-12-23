const express = require('express');
const router = express.Router();
const { 
  getSystemSettings, 
  updateSystemSettings,
  getAIProviderCredentials,
  getCloudinaryCredentials,
  getGoogleOAuthCredentials
} = require('../controllers/systemSetting.controller');

router.get('/', getSystemSettings);
router.get('/ai-provider', getAIProviderCredentials);
router.get('/cloudinary', getCloudinaryCredentials);
router.get('/google-oauth', getGoogleOAuthCredentials);
router.post('/update', updateSystemSettings);

module.exports = router;
