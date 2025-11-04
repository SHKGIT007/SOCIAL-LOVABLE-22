const { PostSchedule, User, Post } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');
const { createPost } = require('../controllers/post.controller');

// This function checks for due schedules and triggers post creation
async function processDueSchedules() {
  const now = new Date();
  // Find all pending schedules due now or earlier
  const dueSchedules = await PostSchedule.findAll({
    where: {
      status: 'pending',
      scheduled_at: {
        [Op.lte]: now,
      },
    },
  });

  for (const schedule of dueSchedules) {
    try {
      // Trigger post creation (reuse post controller logic)
      await createPost({
        body: {
          content: schedule.content,
          platforms: schedule.platforms,
          user_id: schedule.user_id,
        },
        user: { id: schedule.user_id },
      }, {
        status: () => ({ json: () => {} }) // Dummy response object
      });
      // Mark schedule as completed
      await schedule.update({ status: 'completed' });
      logger.info(`Auto-posted for schedule ${schedule.id}`);
    } catch (err) {
      logger.error(`Failed to auto-post for schedule ${schedule.id}: ${err.message}`);
      await schedule.update({ status: 'failed' });
    }
  }
}

// Run every minute (for demo, use setInterval; in production, use cron or a job queue)
function startScheduler() {
  setInterval(processDueSchedules, 60 * 1000);
  logger.info('Scheduler started (checks every minute)');
}

module.exports = { startScheduler, processDueSchedules };