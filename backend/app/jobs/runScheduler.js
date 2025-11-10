// runScheduler.js
// This script runs the scheduled post publisher job every minute using node-cron
console.log('Scheduler started...');
const cron = require('node-cron');
const { publishScheduledPosts } = require('./scheduledPostPublisher');

// Schedule the job to run every minute
cron.schedule('* * * * *', async () => {
  await publishScheduledPosts();
  //console.log('Scheduled posts checked and published if due.');
});

// Keep process alive
console.log('Scheduled post publisher started.');
