// runScheduler.js
const cron = require('node-cron');
const { claimAndDispatchDueSchedules } = require('./scheduleDispatcher');

// run every minute
cron.schedule('* * * * *', async () => {
  try {
    await claimAndDispatchDueSchedules();
  } catch (err) {
  }
});


// setInterval(async () => {
//   try {
//     await claimAndDispatchDueSchedules();

//   } catch (err) {

//   }
// }, 15 * 1000); // 15 seconds

