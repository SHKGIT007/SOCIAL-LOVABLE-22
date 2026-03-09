// runScheduler.js
// This script runs the scheduled post publisher job every minute using node-cron
const cron = require('node-cron');
const { publishScheduledPosts } = require('./scheduledPostPublisher');

// Schedule the job to run every minute
cron.schedule('* * * * *', async () => {
  await publishScheduledPosts();
  
});

// Keep process alive
