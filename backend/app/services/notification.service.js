const { User, Notification } = require("../models");
const logger = require("../config/logger");
const socket = require("../../socket");

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

  // ========== ADMIN NOTIFICATIONS ==========

  /**
   * User Registered
   * New User: "User Name" has been registered successfully.
   */
  async userRegistered(userId) {
    try {
      const user = await User.findByPk(userId);
      const userName = `${user.user_fname} ${user.user_lname}`;

      await this.create({
        for_admin: true,
        notification_type: "user_registered",
        title: "User Registered",
        message: `New User: "${userName}" has been registered successfully.`,
        metadata: {
          user_id: userId,
          user_name: userName,
          email: user.email,
        },
      });
    } catch (error) {
      logger.error("Error creating user_registered notification", {
        error: error.message,
        userId,
      });
    }
  },

  /**
   * User Post Created
   * Post Created: A new post was created by {UserName}.
   */
  async userPostCreated(userId, postId, postTitle, postType = "manual") {
    try {
      const user = await User.findByPk(userId);
      const userName = `${user.user_fname} ${user.user_lname}`;

      // Admin notification
      await this.create({
        for_admin: true,
        notification_type: "user_post_created",
        title: "User Post Created",
        message: `Post Created: A new ${postType}-post titled "${postTitle}" was created by ${userName}.`,
        metadata: {
          user_id: userId,
          user_name: userName,
          post_id: postId,
          post_title: postTitle,
          post_type: postType,
        },
      });

      // User notification
      await this.create({
        for_user_id: userId,
        notification_type: "post_created",
        title: "Post Created",
        message: `Your "${postType}-post" titled "${postTitle}" has been created successfully.`,
        metadata: {
          post_id: postId,
          post_title: postTitle,
          post_type: postType,
        },
      });
    } catch (error) {
      logger.error("Error creating userPostCreated notification", {
        error: error.message,
        userId,
        postId,
      });
    }
  },

  /**
   * User Post Published
   * Post Published: A new AI-Post was published by {UserName}.
   */
  async userPostPublished(userId, postId, postTitle, postType = "manual") {
    try {
      const user = await User.findByPk(userId);
      const userName = `${user.user_fname} ${user.user_lname}`;

      // Admin notification
      await this.create({
        for_admin: true,
        notification_type: "user_post_published",
        title: "User Post Published",
        message: `Post Published: A new ${postType}-Post was published by ${userName}.`,
        metadata: {
          user_id: userId,
          user_name: userName,
          post_id: postId,
          post_title: postTitle,
          post_type: postType,
        },
      });

      // User notification
      await this.create({
        for_user_id: userId,
        notification_type: "post_published",
        title: "Post Published",
        message: `Your ${postType}-Post published successfully.`,
        metadata: {
          post_id: postId,
          post_title: postTitle,
          post_type: postType,
        },
      });
    } catch (error) {
      logger.error("Error creating userPostPublished notification", {
        error: error.message,
        userId,
        postId,
      });
    }
  },

  /**
   * User Scheduled AI-Post
   */
  async userScheduledPost(userId, postId, postTitle, scheduledTime, postType = "manual") {
    try {
      const user = await User.findByPk(userId);
      const userName = `${user.user_fname} ${user.user_lname}`;
      const dateTime = new Date(scheduledTime).toLocaleString();

      // Admin notification
      await this.create({
        for_admin: true,
        notification_type: "user_scheduled_post",
        title: "User Scheduled Post",
        message: `Scheduled Post: ${userName} scheduled a ${postType}-post "${postTitle}" for ${dateTime}.`,
        metadata: {
          user_id: userId,
          user_name: userName,
          post_id: postId,
          post_title: postTitle,
          scheduled_time: scheduledTime,
          post_type: postType,
        },
      });

      // User notification
      await this.create({
        for_user_id: userId,
        notification_type: "schedule_reminder",
        title: "Schedule Reminder",
        message: `Reminder: Your scheduled ${postType}-Post will be published on ${dateTime}.`,
        metadata: {
          post_id: postId,
          post_title: postTitle,
          scheduled_time: scheduledTime,
          post_type: postType,
        },
      });
    } catch (error) {
      logger.error("Error creating userScheduledPost notification", {
        error: error.message,
        userId,
        postId,
      });
    }
  },

  /**
   * Post Pending for Review
   */
  async postPendingReview(userId, postId, postTitle, postType = "manual") {
    try {
      const user = await User.findByPk(userId);
      const userName = `${user.user_fname} ${user.user_lname}`;

      // Admin notification
      await this.create({
        for_admin: true,
        notification_type: "post_pending_review",
        title: "Post Pending for Review",
        message: `Attention: ${postType}-Post from "${userName}" is pending for review.`,
        metadata: {
          user_id: userId,
          user_name: userName,
          post_id: postId,
          post_title: postTitle,
          post_type: postType,
        },
      });

      // User notification
      await this.create({
        for_user_id: userId,
        notification_type: "review_mode_enabled",
        title: "Review Mode Enabled",
        message: `Your "${postTitle}" will now require review before publishing.`,
        metadata: {
          post_id: postId,
          post_title: postTitle,
          post_type: postType,
        },
      });
    } catch (error) {
      logger.error("Error creating postPendingReview notification", {
        error: error.message,
        userId,
        postId,
      });
    }
  },

  /**
   * User Draft Post
   */
  async userDraftPost(userId, postId, postTitle, postType = "manual") {
    try {
      const user = await User.findByPk(userId);
      const userName = `${user.user_fname} ${user.user_lname}`;

      // Admin notification
      await this.create({
        for_admin: true,
        notification_type: "user_draft_post",
        title: "User Draft Post",
        message: `Draft Post- ${userName} drafted a ${postType}-Post.`,
        metadata: {
          user_id: userId,
          user_name: userName,
          post_id: postId,
          post_title: postTitle,
          post_type: postType,
        },
      });

      // User notification
      await this.create({
        for_user_id: userId,
        notification_type: "draft_post",
        title: "Draft Post",
        message: `You have drafted a ${postType}-post. You can publish it later.`,
        metadata: {
          post_id: postId,
          post_title: postTitle,
          post_type: postType,
        },
      });
    } catch (error) {
      logger.error("Error creating userDraftPost notification", {
        error: error.message,
        userId,
        postId,
      });
    }
  },

  /**
   * User Reached AI Limit
   */
  async userAILimitAlert(userId, limitPercentage, plan) {
    try {
      const user = await User.findByPk(userId);
      const userName = `${user.user_fname} ${user.user_lname}`;

      // Admin notification
      await this.create({
        for_admin: true,
        notification_type: "user_reached_ai_limit",
        title: "User Reached AI Limit",
        message: `Alert: ${userName} has reached ${limitPercentage}% of their AI post limit.`,
        metadata: {
          user_id: userId,
          user_name: userName,
          limit_percentage: limitPercentage,
          plan_name: plan?.name,
        },
      });

      // User notification
      await this.create({
        for_user_id: userId,
        notification_type: "ai_limit_low",
        title: "AI Limit Low",
        message: `Notice: Your AI post limit has been reached ${limitPercentage}%. ${limitPercentage === 100 ? "Please upgrade your plan." : "Please upgrade your plan to continue."
          }`,
        metadata: {
          limit_percentage: limitPercentage,
          plan_name: plan?.name,
        },
      });
    } catch (error) {
      logger.error("Error creating userAILimitAlert notification", {
        error: error.message,
        userId,
        limitPercentage,
      });
    }
  },

  /**
   * Plan Purchase
   */
  async planPurchase(userId, planId, planName, amount = 0) {
    try {
      const user = await User.findByPk(userId);
      const userName = `${user.user_fname} ${user.user_lname}`;

      // User notification
      await this.create({
        for_user_id: userId,
        notification_type: "plan_purchase_success",
        title: "Plan Purchase Success",
        message: `Congratulations! You have successfully purchased the plan "${planName}".`,
        metadata: {
          user_id: userId,
          plan_id: planId,
          plan_name: planName,
          amount,
        },
      });

      // Admin notification
      await this.create({
        for_admin: true,
        notification_type: "plan_purchase",
        title: "New Plan Purchase",
        message: `Congratulations! "${userName}" successfully purchased "${planName}" plan.`,
        metadata: {
          user_id: userId,
          user_name: userName,
          plan_id: planId,
          plan_name: planName,
          amount,
        },
      });
    } catch (error) {
      logger.error("Error creating planPurchase notification", {
        error: error.message,
        userId,
        planId,
      });
    }
  },

  /**
   * Draft post reminder
   */
  async draftPostReminder(userId, draftCount) {
    try {
      await this.create({
        for_user_id: userId,
        notification_type: "draft_post",
        title: "Draft Post",
        message: `Reminder: You still have ${draftCount} draft posts pending.`,
        metadata: {
          draft_count: draftCount,
        },
      });
    } catch (error) {
      logger.error("Error creating draftPostReminder notification", {
        error: error.message,
        userId,
        draftCount,
      });
    }
  },

  /**
   * New Plan Created - Broadcast to all users
   */
  async planCreated(planName, price) {
    try {
      await this.create({
        for_all: true,
        notification_type: "plan_created",
        title: "New Plan Available",
        message: `Excellent news! A new plan "${planName}" starting at tylko ₹${price} is now available. Upgrade now!`,
        metadata: {
          plan_name: planName,
          price: price,
        },
      });
    } catch (error) {
      logger.error("Error creating planCreated notification", {
        error: error.message,
        planName,
      });
    }
  },
};

module.exports = notificationService;
