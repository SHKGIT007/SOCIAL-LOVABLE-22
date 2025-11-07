const { Schedule } = require('../models');

// Toggle only the status of a schedule
exports.toggleScheduleStatus = async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
    if (typeof req.body.status === 'undefined') return res.status(400).json({ success: false, message: 'Status is required' });
    await schedule.update({ status: req.body.status });
    res.json({ success: true, data: schedule });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Create a new schedule
exports.createSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.create({
      ...req.body,
      userId: req.user.id, // assuming user is set in auth middleware
    });
    res.status(201).json({ success: true, data: schedule });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get all schedules for the logged-in user
exports.getSchedules = async (req, res) => {

  try {
    const schedules = await Schedule.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, schedules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update a schedule
exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
    // If only status is being updated (toggle), just update status
    if (Object.keys(req.body).length === 1 && req.body.status !== undefined) {
      await schedule.update({ status: req.body.status });
      return res.json({ success: true, data: schedule });
    }

    let {
      platforms,
      days,
      times,
      recurrence,
      customDateFrom,
      customDateTo,
      singleDate
    } = req.body;

    recurrence = recurrence == '' ? null : recurrence;
    customDateFrom = customDateFrom == '' ? null : customDateFrom;
    customDateTo = customDateTo == '' ? null : customDateTo;
    singleDate = singleDate == '' ? null : singleDate;

    await schedule.update(
      { 
        platforms, 
        days, 
        times, 
        recurrence, 
        customDateFrom, 
        customDateTo, 
        singleDate 
      }
    );
    res.json({ success: true, data: schedule });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete a schedule
exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
    await schedule.destroy();
    res.json({ success: true, message: 'Schedule deleted' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};





