const cron = require('node-cron');
const { publishScheduledPosts } = require('./scheduledPostPublisher');
const { remindPendingReviews } = require('./postReviewReminder');
const { remindDraftPosts } = require('./draftReminder');

// Schedule the post publisher to run every minute
cron.schedule('* * * * *', async () => {
  await publishScheduledPosts();
});

// Schedule the review reminder to run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  await remindPendingReviews();
});

// Schedule the draft reminder to run every 12 hours
cron.schedule('0 */12 * * *', async () => {
  await remindDraftPosts();
});
