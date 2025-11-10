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
// exports.getSchedules = async (req, res) => {

//   try {
//     const schedules = await Schedule.findAll({
//       where: { userId: req.user.id },
//       order: [['createdAt', 'DESC']],
//     });
//     res.json({ success: true, schedules });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

exports.getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    // Parse nested JSON fields properly
    const parsedSchedules = schedules.map(schedule => {
      const s = schedule.dataValues;

      const parseSafely = (value) => {
        try {
          // Double JSON.parse() for double-encoded strings
          let parsed = typeof value === "string" ? JSON.parse(value) : value;
          if (typeof parsed === "string") parsed = JSON.parse(parsed);
          return parsed;
        } catch {
          return value;
        }
      };

      return {
        ...s,
        platforms: parseSafely(s.platforms),
        days: parseSafely(s.days),
        times: parseSafely(s.times),
        content_ai_prompt: s.content_ai_prompt,
        image_prompt: s.image_prompt,
      };
    });

    console.log("Parsed Schedules:", parsedSchedules);
    res.json({ success: true, schedules: parsedSchedules });
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
      singleDate,
      content_ai_prompt,
      image_prompt
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
        singleDate,
        content_ai_prompt: content_ai_prompt || null,
        image_prompt: image_prompt || null
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





