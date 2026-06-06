const express = require('express');
const router = express.Router();
const profileController = require('../Controllers/profile.controller');
const { authenticateToken } = require('../Middleware/auth.middleware');

router.get('/', authenticateToken, profileController.getProfile);
router.post('/', authenticateToken, profileController.saveProfile);

module.exports = router;

