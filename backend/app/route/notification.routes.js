const router = require("express").Router();
const controller = require("../controllers/notification.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

// Get all notifications for current user/admin
router.get("/", authenticateToken, controller.getNotifications);

// Get unread count
router.get("/count/unread", authenticateToken, controller.getUnreadCount);

// Mark single notification as read
router.put("/:id/read", authenticateToken, controller.markAsRead);

// Mark all notifications as read
router.put("/read/all", authenticateToken, controller.markAllAsRead);

// Delete notification
router.delete("/:id", authenticateToken, controller.deleteNotification);

module.exports = router;