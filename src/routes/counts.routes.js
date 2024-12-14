const express = require("express");

const { counts } = require("../controllers/counts.controllers.js");

// Create a new router
const router = express.Router();

// Handle get dashboard counts
router.get("/", counts);

module.exports = router;
