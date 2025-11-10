// scheduleDispatcher.js
const { Sequelize, sequelize, Schedule } = require('../models'); // adjust path
const { Worker } = require('worker_threads');
const { Op } = require('sequelize');

const CLAIM_WINDOW_SECONDS = 50; // safe window to avoid dupes

async function findCandidateSchedules() {
  // get active schedules (you can further filter by timezone/user if needed)
  return Schedule.findAll({
    where: {
      status: '1',
      isPaused: 0
    },
    // optionally limit to lastRunAt older than X minutes to reduce scanning
    limit: 50
  });
}

async function tryClaim(scheduleId, now) {
  const claimCutoff = new Date(now.getTime() - CLAIM_WINDOW_SECONDS * 1000);
  // Use Sequelize model update for atomic claim
  const [affectedRows] = await Schedule.update(
    { lastRunAt: now },
    {
      where: {
        id: scheduleId,
        status: '1',
        isPaused: 0,
        [Op.or]: [
          { lastRunAt: null },
          { lastRunAt: { [Op.lt]: claimCutoff } }
        ]
      }
    }
  );
  // If affectedRows > 0, claim succeeded
  if (affectedRows > 0) {
    const claimed = await Schedule.findOne({ where: { id: scheduleId, lastRunAt: now } });
    return !!claimed;
  }
  return false;
}

function spawnWorker(schedule) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(require('path').resolve(__dirname, './scheduleWorker.js'), {
      workerData: { scheduleId: schedule.id }
    });
    worker.on('message', (msg) => {
      // msg could be { status: 'done' }
      //console.log('Worker message', msg);
    });
    worker.on('error', (err) => {
      console.error('Worker error', err);
      reject(err);
    });
    worker.on('exit', (code) => {
      if (code !== 0) {
        return reject(new Error(`Worker stopped with exit code ${code}`));
      }
      resolve();
    });
  });
}

async function claimAndDispatchDueSchedules() {
  const now = new Date();
  const candidates = await findCandidateSchedules();

  for (const sch of candidates) {
    try {
      const claimed = await tryClaim(sch.id, now);
      if (!claimed) continue; // someone else claimed
      // Robustly parse JSON fields before passing to worker
      let parsedSch = { ...sch.dataValues };
      if (typeof parsedSch.platforms === 'string') {
        try { parsedSch.platforms = JSON.parse(parsedSch.platforms); } catch(e){ parsedSch.platforms = []; }
      }
      if (typeof parsedSch.days === 'string') {
        try { parsedSch.days = JSON.parse(parsedSch.days); } catch(e){ parsedSch.days = []; }
      }
      if (typeof parsedSch.times === 'string') {
        try { parsedSch.times = JSON.parse(parsedSch.times); } catch(e){ parsedSch.times = {}; }
      }
      // spawn worker to evaluate & publish (non-blocking)
      spawnWorker(parsedSch).catch(err => console.error('Worker failed', err));
    } catch (err) {
      console.error('Error claiming schedule', sch.id, err);
    }
  }
}

module.exports = { claimAndDispatchDueSchedules };
