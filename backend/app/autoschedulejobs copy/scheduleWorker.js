// scheduleWorker.js
const { parentPort, workerData } = require('worker_threads');
const { Schedule, Post, SocialAccount, sequelize } = require('../models'); // adjust path
const logger =  require('../config/logger');
// const { facebookPost } = require('./redirectAuth/facebook/facebookPost');
// const { instagramPost } = require('./redirectAuth/instagram/instagramPost');
const { facebookPost } = require('../../redirectAuth/facebook/facebookPost');
const { instagramPost } = require('../../redirectAuth/instagram/instagramPost');
const { Op } = require('sequelize');

async function matchesSchedule(schedule, now) {
  // schedule.platforms, schedule.days and schedule.times are JSON per your table
  // parse them safely
  let days = schedule.days;
  let times = schedule.times;
  if (typeof days === 'string') {
    try { days = JSON.parse(days); } catch(e){ days = []; }
  }
  if (typeof times === 'string') {
    try { times = JSON.parse(times); } catch(e){ times = {}; }
  }
  // convert `now` to schedule timezone if needed
  // For simplicity assume timezone is Asia/Kolkata / server is same
  const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const todayName = dayNames[now.getDay()];

  // handle custom dates
  if (Array.isArray(days) && days.includes('single_date')) {
    // for single_date, your times likely array under times.single_date
    const singleDate = schedule.singleDate ? new Date(schedule.singleDate) : null;
    if (singleDate) {
      // if date matches today's date -> check times
      if (singleDate.toDateString() === now.toDateString()) {
        const slotTimes = times['single_date'] || [];
        return slotTimes.some(t => isTimeMatch(t, now));
      }
    }
  }

  if (Array.isArray(days) && days.includes('custom_date')) {
    const from = schedule.customDateFrom ? new Date(schedule.customDateFrom) : null;
    const to = schedule.customDateTo ? new Date(schedule.customDateTo) : null;
    if (from && to && now >= from && now <= to) {
      const slotTimes = times['custom_date'] || [];
      return slotTimes.some(t => isTimeMatch(t, now));
    }
  }

  // daily
  if (Array.isArray(days) && days.includes('daily')) {
    const slotTimes = times['daily'] || [];
    if (slotTimes.some(t => isTimeMatch(t, now))) return true;
  }

  // named weekday
  if (Array.isArray(days) && days.includes(todayName)) {
    const slotTimes = times[todayName] || [];
    return slotTimes.some(t => isTimeMatch(t, now));
  }

  return false;
}

function isTimeMatch(timeStr, now) {
  // timeStr like "19:38" — match hour and minute
  const [h, m] = timeStr.split(':').map(Number);
  return now.getHours() === h && now.getMinutes() === m;
}

async function processSchedule(scheduleId) {
  const now = new Date();
  // reload schedule fresh
  const schedule = await Schedule.findByPk(scheduleId);
  if (!schedule || schedule.status !== '1' || schedule.isPaused) return;

  // Robustly parse JSON fields
  let parsedSchedule = { ...schedule.dataValues };
  // Parse platforms
  if (typeof parsedSchedule.platforms === 'string') {
    try { parsedSchedule.platforms = JSON.parse(parsedSchedule.platforms); } catch(e){ parsedSchedule.platforms = []; }
  }
  // Parse days
  if (typeof parsedSchedule.days === 'string') {
    try { parsedSchedule.days = JSON.parse(parsedSchedule.days); } catch(e){ parsedSchedule.days = []; }
  }
  // Parse times
  if (typeof parsedSchedule.times === 'string') {
    try { parsedSchedule.times = JSON.parse(parsedSchedule.times); } catch(e){ parsedSchedule.times = {}; }
  }
  
  
  console.log("Parsed parsedSchedule.times:", parsedSchedule.times);

  const isDue = await matchesSchedule(parsedSchedule, now);
  if (!isDue) return;

  // fetch posts assigned to this schedule that are still scheduled
  const posts = await Post.findAll({
    where: {
      scheduleId: schedule.id,
      status: 'scheduled'
    }
  });

  // optional write schedule_runs entry
  const run = { scheduleId: schedule.id, startedAt: new Date(), status: 'success' };
  let anyPublished = false;
  try {
    for (const post of posts) {
      // atomic claim post to avoid duplicates
      const [affectedRows] = await Post.update(
        { status: 'publishing' },
        {
          where: {
            id: post.id,
            status: 'scheduled'
          }
        }
      );
      // proceed only if we successfully claimed
      const fresh = await Post.findByPk(post.id);
      if (!fresh || fresh.status !== 'publishing') continue;

      let published = false;
      // platforms for this post maybe array
      let platforms = post.platforms;
      if (typeof platforms === 'string') {
        try { platforms = JSON.parse(platforms); } catch(e){ platforms = []; }
      }
      if (Array.isArray(platforms) && platforms.includes('facebook')) {
        const fbAccount = await SocialAccount.findOne({
          where: { user_id: post.user_id, platform: 'Facebook', is_active: 1 }
        });
        if (fbAccount && fbAccount.access_token) {
          try {
            await facebookPost(fbAccount.access_token, post.content, post.image_url);
            published = true;
            logger.info('Published to Facebook', { postId: post.id });
          } catch (err) {
            logger.error('FB publish error', { postId: post.id, err: err.message });
          }
        }
      }

      if (Array.isArray(platforms) && platforms.includes('instagram')) {
        const igAccount = await SocialAccount.findOne({
          where: { user_id: post.user_id, platform: 'Instagram', is_active: 1 }
        });
        if (igAccount && igAccount.access_token) {
          try {
            await instagramPost(igAccount.access_token, post.content, post.image_url);
            published = true;
            logger.info('Published to IG', { postId: post.id });
          } catch (err) {
            logger.error('IG publish error', { postId: post.id, err: err.message });
          }
        }
      }

      if (published) {
        anyPublished = true;
        await Post.update({ status: 'published', published_at: new Date() }, { where: { id: post.id } });
      } else {
        // something failed — set back to scheduled so it can retry next minute or record failure
        await Post.update({ status: 'scheduled' }, { where: { id: post.id } });
      }
    }
  } catch (err) {
    run.status = 'failed';
    run.meta = JSON.stringify({ error: err.message });
    logger.error('Schedule worker error', { scheduleId: schedule.id, err: err.message });
  } finally {
    run.finishedAt = new Date();
    // persist run to DB (if you created schedule_runs)
    // await ScheduleRun.create(run);
  }

  return anyPublished;
}

// worker bootstrap
(async () => {
  try {
    const scheduleId = workerData.scheduleId;

    console.log("scheduleId",scheduleId)
    await processSchedule(scheduleId);
    parentPort.postMessage({ status: 'done', scheduleId });
    process.exit(0);
  } catch (err) {
    parentPort.postMessage({ status: 'error', error: err.message });
    process.exit(1);
  }
})();
