const express = require("express");
const {
  getNotifications,
  createNotification,
  deleteNotification,
  markNotificationAsRead,
} = require("../controllers/notifications.controllers.js");

const router = express.Router();

router.post("/create", createNotification);
router.get("/all", getNotifications);
router.delete("/:id/delete", deleteNotification);
router.put("/:id/read", markNotificationAsRead);

module.exports = router;
