const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/', authenticateToken, profileController.getProfile);
router.post('/', authenticateToken, profileController.saveProfile);

module.exports = router;
