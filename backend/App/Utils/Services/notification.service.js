const { User, Notification } = require("../../Models");
const logger = require("../../Connection/logger");
const socket = require("../../../socket");

const notificationService = {
  /**
   * Core Create Notification - Internal and External use
   */
  async create(data) {
    try {
      const notification = await Notification.create({
        for_user_id: data.for_user_id || null,
        for_admin: data.for_admin || false,
        notification_type: data.notification_type,
        title: data.title,
        message: data.message,
        metadata: data.metadata || null,
      });

      // Send real-time notification via socket
      if (data.for_user_id) {
        socket.sendNotification(data.for_user_id, {
          title: data.title,
          message: data.message,
          type: data.notification_type,
          metadata: data.metadata,
        });
      }

      if (data.for_admin) {
        // Send to all connected admins
        socket.sendAdminNotification({
          title: data.title,
          message: data.message,
          type: data.notification_type,
          metadata: data.metadata,
        });
      }

      if (data.for_all) {
        // Send to all connected users
        socket.sendBroadcastNotification({
          title: data.title,
          message: data.message,
          type: data.notification_type,
          metadata: data.metadata,
        });
      }

      return notification;
    } catch (error) {
      logger.error("Error creating notification", { error: error.message });
      throw error;
    }
  },

  // ========== USER NOTIFICATIONS ==========

  /**
   * 1. Plan Purchase Success
   * Congratulations! You have successfully purchased the plan "plan name".
   */
  async planPurchase(userId, planName) {
    try {
      const user = await User.findByPk(userId);
      const userName = `${user.user_fname} ${user.user_lname}`;

      // Admin notification (Admin list requirement)
      await this.create({
        for_admin: true,
        notification_type: "plan_purchase",
        title: "New Plan Purchase",
        message: `Congratulations! "${userName}" successfully purchased a "${planName}" plan.`,
        metadata: { user_id: userId, user_name: userName, plan_name: planName },
      });

      // User notification (User list requirement #1)
      await this.create({
        for_user_id: userId,
        notification_type: "plan_purchase_success",
        title: "Plan Purchase Success",
        message: `Congratulations! You have successfully purchased the plan "${planName}".`,
        metadata: { plan_name: planName },
      });
    } catch (error) {
      logger.error("Error in planPurchase notification", { error: error.message, userId });
    }
  },

  /**
   * 2. Schedule Reminder
   * Reminder: Your scheduled AI-Post will be published on {DateTime}.
   * Reminder: Your scheduled Manual-Post will be published on {DateTime}.
   */
  async scheduleReminder(userId, postType = "Manual", scheduledAt) {
    try {
      const typeLabel = postType === "ai" ? "AI-Post" : "Manual-Post";
      const dateTime = new Date(scheduledAt).toLocaleString();

      await this.create({
        for_user_id: userId,
        notification_type: "schedule_reminder",
        title: "Schedule Reminder",
        message: `Reminder: Your scheduled ${typeLabel} will be published on ${dateTime}.`,
        metadata: { scheduled_at: scheduledAt, post_type: postType },
      });
    } catch (error) {
      logger.error("Error in scheduleReminder notification", { error: error.message, userId });
    }
  },

  /**
   * 3. Review Mode Enabled
   * Your "Post name" will now require review before publishing on {DateTime}.
   */
  async reviewModeReminder(userId, postTitle, scheduledAt) {
    try {
      const dateTime = new Date(scheduledAt).toLocaleString();

      await this.create({
        for_user_id: userId,
        notification_type: "review_mode_enabled",
        title: "Review Mode Enabled",
        message: `Your "${postTitle}" will now require review before publishing on ${dateTime}.`,
        metadata: { post_title: postTitle, scheduled_at: scheduledAt },
      });
    } catch (error) {
      logger.error("Error in reviewModeReminder notification", { error: error.message, userId });
    }
  },

  /**
   * 4. Draft Post Reminder
   * Reminder: You still have 20 draft posts pending.
   */
  async pendingDraftReminder(userId, draftCount) {
    try {
      await this.create({
        for_user_id: userId,
        notification_type: "draft_reminder",
        title: "Draft Post",
        message: `Reminder: You still have ${draftCount} draft posts pending.`,
        metadata: { draft_count: draftCount },
      });
    } catch (error) {
      logger.error("Error in pendingDraftReminder notification", { error: error.message, userId });
    }
  },

  /**
   * 5. Post Published
   * Your AI-Post Published successfully.
   * Your Manual-Post published successfully.
   */
  async userPostPublished(userId, postType = "Manual") {
    try {
      const user = await User.findByPk(userId);
      const userName = `${user.user_fname} ${user.user_lname}`;
      const typeLabel = postType === "ai" ? "AI-Post" : "Manual-Post";

      // Admin notification (from Admin list)
      await this.create({
        for_admin: true,
        notification_type: "user_post_published",
        title: "User Post Published",
        message: `Post Published: A new ${typeLabel} was published by ${userName}.`,
        metadata: { user_id: userId, user_name: userName, post_type: postType },
      });

      // User notification (User list requirement #5)
      await this.create({
        for_user_id: userId,
        notification_type: "post_published",
        title: "Post Published",
        message: `Your ${typeLabel} Published successfully.`,
        metadata: { post_type: postType },
      });
    } catch (error) {
      logger.error("Error in userPostPublished notification", { error: error.message, userId });
    }
  },

  /**
   * 6. AI Limit Low
   * Notice: Your AI post limit has been reached 50%. Please upgrade your plan.
   */
  async userAILimitAlert(userId, percentage) {
    try {
      const user = await User.findByPk(userId);
      const userName = `${user.user_fname} ${user.user_lname}`;

      // Admin notification (Admin requirement)
      await this.create({
        for_admin: true,
        notification_type: "user_reached_ai_limit",
        title: "AI Limit Alert",
        message: `Alert: ${userName} has reached ${percentage}% of their AI post limit.`,
        metadata: { user_id: userId, user_name: userName, percentage },
      });

      // User notification (User list requirement #6)
      await this.create({
        for_user_id: userId,
        notification_type: "ai_limit_low",
        title: "AI Limit Low",
        message: `Notice: Your AI post limit has been reached ${percentage}%. Please upgrade your plan.`,
        metadata: { percentage },
      });
    } catch (error) {
      logger.error("Error in userAILimitAlert notification", { error: error.message, userId });
    }
  },

  // ========== ADDITIONAL ADMIN NOTIFICATIONS (FROM PREVIOUS LIST) ==========

  async userRegistered(userId) {
    try {
      const user = await User.findByPk(userId);
      const userName = `${user.user_fname} ${user.user_lname}`;
      await this.create({
        for_admin: true,
        notification_type: "user_registered",
        title: "User Registered",
        message: `New User: "${userName}" has been registered successfully.`,
        metadata: { user_id: userId, user_name: userName },
      });
      await this.create({
        for_user_id: userId,
        notification_type: "welcome",
        title: "Welcome",
        message: `Hello ${userName}, your account has been registered successfully.`,
        metadata: { user_id: userId },
      });
    } catch (error) { }
  },

  async userPostCreated(userId, postType = "Manual") {
    try {
      const user = await User.findByPk(userId);
      const userName = `${user.user_fname} ${user.user_lname}`;
      await this.create({
        for_admin: true,
        notification_type: "user_post_created",
        title: "User Post Created",
        message: `Post Created: A new post was created by ${userName}.`,
        metadata: { user_id: userId, user_name: userName, post_type: postType },
      });
    } catch (error) { }
  },

  async userScheduledPost(userId, postTitle, scheduledAt, postType = "Manual") {
    try {
      const user = await User.findByPk(userId);
      const userName = `${user.user_fname} ${user.user_lname}`;
      const dateTime = new Date(scheduledAt).toLocaleString();
      await this.create({
        for_admin: true,
        notification_type: "user_scheduled_post",
        title: "User Scheduled Post",
        message: `Scheduled Post: ${userName} scheduled a ${postType === 'ai' ? `"${postTitle}"` : 'Manual-Post'} for ${dateTime}.`,
        metadata: { user_id: userId, user_name: userName, post_title: postTitle, scheduled_at: scheduledAt },
      });
      // Also send User Schedule Reminder (Point #2)
      await this.scheduleReminder(userId, postType, scheduledAt);
    } catch (error) { }
  },

  async postPendingReview(userId, postType = "Manual") {
    try {
      const user = await User.findByPk(userId);
      const userName = `${user.user_fname} ${user.user_lname}`;
      await this.create({
        for_admin: true,
        notification_type: "post_pending_review",
        title: "Post Pending for Review",
        message: `Attention: ${postType === 'ai' ? 'AI-Post' : 'Manual-Post'} from "${userName}" was pending for review.`,
        metadata: { user_id: userId, user_name: userName, post_type: postType },
      });
    } catch (error) { }
  },

  async userDraftPost(userId, postType = "Manual") {
    try {
      const user = await User.findByPk(userId);
      const userName = `${user.user_fname} ${user.user_lname}`;
      await this.create({
        for_admin: true,
        notification_type: "user_draft_post",
        title: "User Draft Post",
        message: `Draft Post- ${userName} draft a ${postType === 'ai' ? 'AI-Post' : 'Manual-Post'}.`,
        metadata: { user_id: userId, user_name: userName, post_type: postType },
      });
    } catch (error) { }
  },

  async planCreated(planName, price) {
    try {
      await this.create({
        for_all: true,
        notification_type: "plan_created",
        title: "New Plan Available",
        message: `Great news! A new plan "${planName}" at â‚¹${price} is now available.`,
        metadata: { plan_name: planName, price },
      });
    } catch (error) { }
  },
};

module.exports = notificationService;



