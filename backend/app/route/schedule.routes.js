// Toggle status only
const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

router.post('/', scheduleController.createSchedule);
router.get('/', scheduleController.getSchedules);
router.put('/:id', scheduleController.updateSchedule);
router.delete('/:id', scheduleController.deleteSchedule);
router.patch('/:id/status', scheduleController.toggleScheduleStatus);

module.exports = router;


