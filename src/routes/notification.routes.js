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

const router = express.Router();

router.post("/create", createNotification);
router.get("/all", getNotifications);
router.delete("/:id/delete", deleteNotification);
router.delete("/clear", clearNotifications);
router.patch("/:id/read", markNotificationAsRead);
router.patch("/:id/status", updateNotificationStatus);
router.get("/:id/show", getNotificationById);

module.exports = router;
