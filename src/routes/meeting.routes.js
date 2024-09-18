const express = require("express");
const { sendingEmail } = require("../controllers/meetings.controllers.js");

// Create a new router
const router = express.Router();

// Handle sending email
router.post("/send-email", sendingEmail);

// Export the router
module.exports = router;
