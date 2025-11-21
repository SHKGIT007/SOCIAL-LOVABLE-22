// Scheduled Post Publisher Job
// Run this job periodically (e.g. with node-cron or setInterval)

const { Post, SocialAccount } = require('../models');
const { facebookPost } = require('../../redirectAuth/facebook/facebookPost');
const { instagramPost } = require('../../redirectAuth/instagram/instagramPost');
const logger = require('../config/logger');
const { Op } = require('sequelize');

async function publishScheduledPosts() {
  // Find all scheduled posts whose scheduled_at time has passed and are not published
  const now = new Date();
  const posts = await Post.findAll({
    where: {
      status: 'scheduled',
      scheduled_at: { [Op.lte]: now },
      review_status: 'approved'
    }
  });

  for (const post of posts) {
    
    let publishedToPlatform = false;
    let platforms=post.platforms;
    if (typeof post.platforms === "string") {
      try {
        platforms = JSON.parse(post.platforms);
      } catch (e) {
        console.log("Invalid JSON format:", e);
        platforms = [];
      }
    }
    // Facebook
    if (Array.isArray(platforms) && platforms.includes('Facebook')) {
      const fbAccount = await SocialAccount.findOne({
        where: { user_id: post.user_id, platform: 'Facebook', is_active: 1 }
      });

      //console.log("Facebook Account:", fbAccount);
      if (fbAccount && fbAccount.access_token) {
        try {
          await facebookPost(fbAccount.access_token, post.content, post.image_url);
          publishedToPlatform = true;
          logger.info('Scheduled post published to Facebook', { postId: post.id, userId: post.user_id });
        } catch (err) {
          logger.error('Scheduled Facebook publish error', { postId: post.id, error: err.message });
        }
      }
    }
    // Instagram
    if (Array.isArray(platforms) && platforms.includes('Instagram')) {
      const igAccount = await SocialAccount.findOne({
        where: { user_id: post.user_id, platform: 'Instagram', is_active: 1 }
      });
      if (igAccount && igAccount.access_token) {
        try {

          await instagramPost(igAccount.access_token, post.content, post.image_url);
          publishedToPlatform = true;
          logger.info('Scheduled post published to Instagram', { postId: post.id, userId: post.user_id });
        } catch (err) {
          logger.error('Scheduled Instagram publish error', { postId: post.id, error: err.message });
        }
      }
    }
    if (!publishedToPlatform) {
      logger.warn('Scheduled post reached time but was not pushed to any platform', {
        postId: post.id,
        userId: post.user_id,
      });
    }

    await Post.update(
      { status: 'published', published_at: new Date() },
      { where: { id: post.id } }
    );
  }
}

module.exports = { publishScheduledPosts };
