const express = require("express");
const { sendingEmail } = require("../controllers/meetings.controllers.js");

const router = express.Router();

router.post("/send-email", sendingEmail);

module.exports = router;
