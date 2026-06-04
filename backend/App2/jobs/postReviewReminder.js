const { Post, Notification } = require("../models");
const { Op } = require("sequelize");
const notificationService = require("../services/notification.service");
const logger = require("../config/logger");
const moment = require("moment-timezone");

/**
 * Job to remind admin about posts pending review before their scheduled time.
 * Logic: (1 hrs before and 30 min before)
 */
async function remindPendingReviews() {
    try {
        const now = moment().tz("Asia/Kolkata");

        // Windows for 1 hour and 30 minutes reminders
        const hourWindowStart = now.clone().add(55, 'minutes');
        const hourWindowEnd = now.clone().add(65, 'minutes');

        const minutesWindowStart = now.clone().add(25, 'minutes');
        const minutesWindowEnd = now.clone().add(35, 'minutes');

        // Find posts pending review scheduled soon
        const pendingPosts = await Post.findAll({
            where: {
                status: 'scheduled',
                review_status: 'pending',
                scheduled_at: {
                    [Op.or]: [
                        { [Op.between]: [hourWindowStart.toDate(), hourWindowEnd.toDate()] },
                        { [Op.between]: [minutesWindowStart.toDate(), minutesWindowEnd.toDate()] }
                    ]
                }
            }
        });

        for (const post of pendingPosts) {
            const scheduledMoment = moment(post.scheduled_at).tz("Asia/Kolkata");
            const diffMinutes = Math.abs(scheduledMoment.diff(now, 'minutes'));

            // Check if we already sent a notification for this post in the last 15 minutes
            // to avoid double triggering if the job runs multiple times per window
            const recentNotification = await Notification.findOne({
                where: {
                    notification_type: 'post_pending_review',
                    title: 'Post Pending for Review',
                    created_at: { [Op.gte]: now.clone().subtract(15, 'minutes').toDate() }
                }
            });

            // Filter by metadata.post_id if possible (Notification metadata is JSON)
            // Since it's JSON, we can check it
            let alreadySent = false;
            if (recentNotification && recentNotification.metadata && recentNotification.metadata.post_id === post.id) {
                alreadySent = true;
            }

            if (!alreadySent) {
                // Notify Admin
                await notificationService.postPendingReview(post.user_id, post.is_ai_generated ? "ai" : "manual");

                // Notify User (Point #3)
                await notificationService.reviewModeReminder(post.user_id, post.title, post.scheduled_at);

                logger.info(`Sent review reminders for post ${post.id}`, { diffMinutes });
            }
        }
    } catch (error) {
        logger.error("Error in remindPendingReviews job", { error: error.message });
    }
}

module.exports = { remindPendingReviews };
