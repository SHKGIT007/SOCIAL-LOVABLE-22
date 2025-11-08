// runScheduler.js
console.log('Scheduler started Auto Post... ');
const cron = require('node-cron');
const { claimAndDispatchDueSchedules } = require('./scheduleDispatcher');

// run every minute
// cron.schedule('* * * * *', async () => {
//   try {
//     await claimAndDispatchDueSchedules();
//     console.log('Checked schedules at --', new Date().toISOString());
//   } catch (err) {
//     console.error('Scheduler error', err);
//   }
// });


setInterval(async () => {
  try {
    await claimAndDispatchDueSchedules();
    console.log('Checked schedules at --', new Date().toISOString());
  } catch (err) {
    console.error('Scheduler error', err);
  }
}, 15 * 1000); // 15 seconds
console.log('Scheduled post publisher started.');
