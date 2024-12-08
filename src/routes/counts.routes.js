const express = require("express");

const auth = require("../middlewares/auth.middleware.js");

const { dashboardCounts } = require("../controllers/counts.controllers.js");

// Create a new router
const router = express.Router();

// Handle get dashboard counts
router.get("/dashboard", auth, dashboardCounts);


module.exports = router;