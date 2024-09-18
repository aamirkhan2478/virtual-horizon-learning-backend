const Notification = require("../models/notifications.model");

// @route   POST /api/notification/create
// @desc    Create New Notification
// @access  Private
const createNotification = async (req, res) => {
  // Get title and message from request body
  const { title, message, teacherEmail, studentEmail, courseTitle } = req.body;

  // Check if title and message are empty
  if (!title || !message || !teacherEmail || !studentEmail || !courseTitle) {
    return res.status(400).json({ error: "Title and message are required" });
  }

  try {
    // Insert new notification into the database
    const notification = await Notification.query().insert({
      title,
      message,
      teacher_email: teacherEmail,
      student_email: studentEmail,
      course_title: courseTitle,
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
const getNotifications = async (_req, res) => {
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

// @route   PATCH /api/notification/:id/read
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

// @route   DELETE /api/notification/:id/clear
// @desc    Clear All Notifications
// @access  Private
const clearNotifications = async (_req, res) => {
  try {
    // Delete all notifications from the database
    await Notification.query().delete();

    // Return success response
    res.status(200).json({ message: "Notifications cleared successfully" });
  } catch (err) {
    // Return error response
    res.status(400).json({ error: err.message });
  }
};

// @route   PATCH /api/notification/:id/update-status
// @desc    Update Notification Status
// @access  Private
const updateNotificationStatus = async (req, res) => {
  // Get notification id from request parameters
  const { id } = req.params;

  // Get status from request body
  const { status } = req.body;

  // Check if status is match with enum values
  if (!["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    // Update notification in the database
    const notification = await Notification.query().findById(id).patch({
      status,
    });

    // Return success response
    res.status(200).json(notification);
  } catch (err) {
    // Return error response
    res.status(400).json({ error: err.message });
  }
};

// @route   GET /api/notification/:id/show
// @desc    Get Notification by ID
// @access  Private
const getNotificationById = async (req, res) => {
  // Get notification id from request parameters
  const { id } = req.params;

  try {
    // Get notification from the database
    const notification = await Notification.query().findById(id);

    // Return success response
    res.status(200).json(notification);
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
  clearNotifications,
  updateNotificationStatus,
  getNotificationById,
};
