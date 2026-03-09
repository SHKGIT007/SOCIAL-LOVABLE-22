const { Notification, User } = require("../models");
const { asyncHandler } = require("../middleware/error.middleware");
const logger = require("../config/logger");
const socket = require("../../socket");
const notificationService = require("../services/notification.service");

// Create notification (internal function)
const createNotification = async (data) => {
  return await notificationService.create(data);
};

// Get notifications for current user or admin
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, is_read, notification_type } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = {};

  // If admin, get admin notifications
  if (req.user.user_type === "admin") {
    whereClause.for_admin = true;
  } else {
    // If user, get their personal notifications
    whereClause.for_user_id = req.user.id;
  }

  // Filter by read status
  if (is_read !== undefined) {
    whereClause.is_read = is_read === "true";
  }

  // Filter by notification type
  if (notification_type) {
    whereClause.notification_type = notification_type;
  }

  const { count, rows: notifications } = await Notification.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: "User",
        attributes: ["id", "user_name", "email", "user_fname", "user_lname"],
      },
    ],
    order: [["created_at", "DESC"]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  // Count unread
  const unreadCount = await Notification.count({
    where: {
      ...whereClause,
      is_read: false,
    },
  });

  res.json({
    status: true,
    data: {
      notifications,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
      unreadCount,
    },
  });
});

// Get unread count
const getUnreadCount = asyncHandler(async (req, res) => {
  const whereClause = {
    is_read: false,
  };

  if (req.user.user_type === "admin") {
    whereClause.for_admin = true;
  } else {
    whereClause.for_user_id = req.user.id;
  }

  const unreadCount = await Notification.count({
    where: whereClause,
  });

  res.json({
    status: true,
    data: {
      unreadCount,
    },
  });
});

// Mark single notification as read
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findByPk(id);

  if (!notification) {
    return res.status(404).json({
      status: false,
      message: "Notification not found",
    });
  }

  // Verify ownership
  if (req.user.user_type !== "admin" && notification.for_user_id !== req.user.id) {
    return res.status(403).json({
      status: false,
      message: "Unauthorized",
    });
  }

  await notification.update({
    is_read: true,
    read_at: new Date(),
  });

  res.json({
    status: true,
    message: "Notification marked as read",
    data: notification,
  });
});

// Mark all notifications as read
const markAllAsRead = asyncHandler(async (req, res) => {
  const whereClause = {
    is_read: false,
  };

  if (req.user.user_type === "admin") {
    whereClause.for_admin = true;
  } else {
    whereClause.for_user_id = req.user.id;
  }

  const result = await Notification.update(
    {
      is_read: true,
      read_at: new Date(),
    },
    {
      where: whereClause,
    }
  );

  res.json({
    status: true,
    message: "All notifications marked as read",
    data: {
      updatedCount: result[0],
    },
  });
});

// Delete notification
const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findByPk(id);

  if (!notification) {
    return res.status(404).json({
      status: false,
      message: "Notification not found",
    });
  }

  // Verify ownership
  if (req.user.user_type !== "admin" && notification.for_user_id !== req.user.id) {
    return res.status(403).json({
      status: false,
      message: "Unauthorized",
    });
  }

  await notification.destroy();

  res.json({
    status: true,
    message: "Notification deleted",
  });
});

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
