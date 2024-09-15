const Notification = require("../models/notifications.model");

// @route   POST /api/notification/create
// @desc    Create New Notification
// @access  Private
const createNotification = async (req, res) => {
  // Get title and message from request body
  const { title, message } = req.body;

  // Check if title and message are empty
  if (!title || !message) {
    return res.status(400).json({ error: "Title and message are required" });
  }

  try {
    // Insert new notification into the database
    const notification = await Notification.query().insert({
      title,
      message,
    });

    // Return success response
    res.status(201).json(("Request sent to admin.", notification));
  } catch (err) {
    // Return error response
    res.status(400).json({ error: err.message });
  }
};

// @route   GET /api/notification/all
// @desc    Get All Notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    // Get all notifications from the database
    const notifications = await Notification.query();

    // Return success response
    res.status(200).json(notifications);
  } catch (err) {
    // Return error response
    res.status(400).json({ error: err.message });
  }
};

// @route   PUT /api/notification/:id/read
// @desc    Mark Notification as Read
// @access  Private
const markNotificationAsRead = async (req, res) => {
  // Get notification id from request parameters
  const { id } = req.params;

  try {
    // Update notification in the database
    const notification = await Notification.query().findById(id).patch({
      read: true,
    });

    // Return success response
    res.status(200).json(notification);
  } catch (err) {
    // Return error response
    res.status(400).json({ error: err.message });
  }
};

// @route   DELETE /api/notification/:id/delete
// @desc    Delete Notification
// @access  Private
const deleteNotification = async (req, res) => {
  // Get notification id from request parameters
  const { id } = req.params;

  try {
    // Delete notification from the database
    await Notification.query().deleteById(id);

    // Return success response
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (err) {
    // Return error response
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
};
