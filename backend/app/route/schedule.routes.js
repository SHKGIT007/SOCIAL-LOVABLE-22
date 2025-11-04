const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');
const { authenticate } = require('../middleware/auth.middleware');

// User routes
router.post('/', authenticate, scheduleController.createSchedule);
router.get('/', authenticate, scheduleController.getUserSchedules);
router.put('/:id', authenticate, scheduleController.updateSchedule);
router.delete('/:id', authenticate, scheduleController.deleteSchedule);

// Admin route
router.get('/all', authenticate, scheduleController.getAllSchedules);

module.exports = router;
