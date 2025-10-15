// Scheduled Post Publisher Job
// Run this job periodically (e.g. with node-cron or setInterval)

const { Post, SocialAccount } = require('../models');
const { facebookPost } = require('../../redirectAuth/facebook/facebookPost');
const logger = require('../config/logger');
const { Op } = require('sequelize');

async function publishScheduledPosts() {
  // Find all scheduled posts whose scheduled_at time has passed and are not published
  const now = new Date();
  const posts = await Post.findAll({
    where: {
      status: 'scheduled',
      scheduled_at: { [Op.lte]: now }
    }
  });

  console.log(`Found ${posts.length} scheduled posts to publish.`);

  for (const post of posts) {
    console.log(`Publishing scheduled post ID: ${post.id} for user ID: ${post.user_id}`);
    // Get user's active Facebook account
    const socialAccount = await SocialAccount.findOne({
      where: { user_id: post.user_id, platform: 'Facebook', is_active: 1 }
    });
    if (socialAccount && socialAccount.access_token) {
      try {
        await facebookPost(socialAccount.access_token, post.content);
        // Mark post as published
        await Post.update(
          { status: 'published', published_at: new Date() },
          { where: { id: post.id } }
        );
        logger.info('Scheduled post published to Facebook', { postId: post.id, userId: post.user_id });
      } catch (err) {
        logger.error('Scheduled Facebook publish error', { postId: post.id, error: err.message });
      }
    }
  }
}

module.exports = { publishScheduledPosts };
