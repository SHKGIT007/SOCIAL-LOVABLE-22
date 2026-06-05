const { Schedule } = require('../Models');

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
    let {
      platforms,
      days,
      times,
      recurrence,
      customDateFrom,
      customDateTo,
      singleDate,
      content_ai_prompt,
      image_prompt,
      generated_content,
      image_url
    } = req.body;

    recurrence = recurrence == '' ? null : recurrence;
    customDateFrom = customDateFrom == '' ? null : customDateFrom;
    customDateTo = customDateTo == '' ? null : customDateTo;
    singleDate = singleDate == "" ? null : singleDate;
    content_ai_prompt = content_ai_prompt || null;
    image_prompt = image_prompt || null;

    const moment = require('moment-timezone');
    const now = moment().tz('Asia/Kolkata');
    const todayStr = now.format('YYYY-MM-DD');
    const currentTimeStr = now.format('HH:mm');

    // Validation for Single Date
    if (singleDate === todayStr) {
      if (typeof times === 'string') times = JSON.parse(times);
      const dayTimes = times['single_date'] || [];
      for (const t of dayTimes) {
        if (t && t < currentTimeStr) {
          return res.status(400).json({ success: false, message: `Time ${t} is in the past for today.` });
        }
      }
    } else if (singleDate && singleDate < todayStr) {
       return res.status(400).json({ success: false, message: "Single date cannot be in the past." });
    }

    // Validation for Custom Date Range
    if (customDateFrom === todayStr) {
      if (typeof times === 'string') times = JSON.parse(times);
      const dayTimes = times['custom_date'] || [];
      for (const t of dayTimes) {
        if (t && t < currentTimeStr) {
          return res.status(400).json({ success: false, message: `Time ${t} is in the past for today's range start.` });
        }
      }
    } else if (customDateFrom && customDateFrom < todayStr) {
      return res.status(400).json({ success: false, message: "Custom date range cannot start in the past." });
    }

    const schedule = await Schedule.create({
      platforms,
      days,
      times,
      recurrence,
      customDateFrom,
      customDateTo,
      singleDate,
      content_ai_prompt,
      image_prompt,
      generated_content,
      image_url,
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
        generated_content: s.generated_content,
        image_url: s.image_url,
      };
    });

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
      image_prompt,
      generated_content,
      image_url
    } = req.body;



    recurrence = recurrence == '' ? null : recurrence;
    customDateFrom = customDateFrom == '' ? null : customDateFrom;
    customDateTo = customDateTo == '' ? null : customDateTo;
    singleDate = singleDate == "" ? null : singleDate;

    const moment = require('moment-timezone');
    const now = moment().tz('Asia/Kolkata');
    const todayStr = now.format('YYYY-MM-DD');
    const currentTimeStr = now.format('HH:mm');

    // Validation for Single Date
    if (singleDate === todayStr) {
      if (typeof times === 'string') times = JSON.parse(times);
      const dayTimes = times['single_date'] || [];
      for (const t of dayTimes) {
        if (t && t < currentTimeStr) {
          return res.status(400).json({ success: false, message: `Time ${t} is in the past for today.` });
        }
      }
    } else if (singleDate && singleDate < todayStr) {
       return res.status(400).json({ success: false, message: "Single date cannot be in the past." });
    }

    // Validation for Custom Date Range
    if (customDateFrom === todayStr) {
      if (typeof times === 'string') times = JSON.parse(times);
      const dayTimes = times['custom_date'] || [];
      for (const t of dayTimes) {
        if (t && t < currentTimeStr) {
          return res.status(400).json({ success: false, message: `Time ${t} is in the past for today's range start.` });
        }
      }
    } else if (customDateFrom && customDateFrom < todayStr) {
      return res.status(400).json({ success: false, message: "Custom date range cannot start in the past." });
    }





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
        image_prompt: image_prompt || null,
        generated_content: generated_content || null,
        image_url: image_url || null
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





// CREATE OR REPLACE VIEW view_active_schedules AS
// SELECT 
//     s.*
// FROM 
//     schedules s
// WHERE 
//     s.status = '1'
//     AND (
//         s.times LIKE CONCAT('%"', DATE_FORMAT(CONVERT_TZ(NOW(), '+00:00', 'Asia/Kolkata'), '%H:%i'), '"%')
//         OR s.times LIKE CONCAT('%"', DATE_FORMAT(DATE_SUB(CONVERT_TZ(NOW(), '+00:00', 'Asia/Kolkata'), INTERVAL 1 MINUTE), '%H:%i'), '"%')
//         OR s.times LIKE CONCAT('%"', DATE_FORMAT(DATE_ADD(CONVERT_TZ(NOW(), '+00:00', 'Asia/Kolkata'), INTERVAL 1 MINUTE), '%H:%i'), '"%')
//     );

