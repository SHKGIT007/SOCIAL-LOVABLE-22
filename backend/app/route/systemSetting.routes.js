const express = require('express');
const router = express.Router();
const { getSystemSettings, updateSystemSettings } = require('../controllers/systemSetting.controller');

router.get('/', getSystemSettings);
router.post('/update', updateSystemSettings);

module.exports = router;
