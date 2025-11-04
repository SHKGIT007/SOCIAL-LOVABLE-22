const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// User routes
router.post('/', authenticateToken, scheduleController.createSchedule);
router.get('/', authenticateToken, scheduleController.getUserSchedules);
router.put('/:id', authenticateToken, scheduleController.updateSchedule);
router.delete('/:id', authenticateToken, scheduleController.deleteSchedule);

// Admin route
router.get('/all', authenticateToken, scheduleController.getAllSchedules);

module.exports = router;
