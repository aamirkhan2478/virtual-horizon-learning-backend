const express = require("express");
const {
  getNotifications,
  createNotification,
  deleteNotification,
  markNotificationAsRead,
  clearNotifications,
  updateNotificationStatus,
  getNotificationById,
} = require("../controllers/notifications.controllers.js");

// Create a new router
const router = express.Router();
// Handle create notification
router.post("/create", createNotification);

// Handle get notifications
router.get("/all", getNotifications);

// Handle delete notification
router.delete("/:id/delete", deleteNotification);

// Handle clear notifications
router.delete("/clear", clearNotifications);

// Handle mark notification as read
router.patch("/:id/read", markNotificationAsRead);

// Handle update notification status
router.patch("/:id/status", updateNotificationStatus);

// Handle get notification by id
router.get("/:id/show", getNotificationById);

// Export the router
module.exports = router;
