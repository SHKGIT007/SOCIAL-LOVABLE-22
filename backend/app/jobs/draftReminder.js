const { Post, User } = require("../models");
const { Op, Sequelize } = require("sequelize");
const notificationService = require("../services/notification.service");
const logger = require("../config/logger");

/**
 * Job to remind users about their pending drafts.
 * Reminder: You still have {count} draft posts pending.
 */
async function remindDraftPosts() {
    try {
        // Group draft posts by user_id
        const draftStats = await Post.findAll({
            where: { status: 'draft' },
            attributes: [
                'user_id',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'draft_count']
            ],
            group: ['user_id']
        });

        for (const stat of draftStats) {
            const userId = stat.user_id;
            const count = stat.getDataValue('draft_count');

            if (count > 0) {
                await notificationService.pendingDraftReminder(userId, count);
                logger.info(`Sent draft reminder to user ${userId}`, { count });
            }
        }
    } catch (error) {
        logger.error("Error in remindDraftPosts job", { error: error.message });
    }
}

module.exports = { remindDraftPosts };
