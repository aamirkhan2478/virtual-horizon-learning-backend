const nodemailer = require("nodemailer");
const User = require("../models/user.model.js");
const crypto = require("crypto");
const moment = require("moment");

const sendEmail = async ({
  email,
  emailType,
  userId,
  emails,
  meetingLink,
  meetingDate,
  courseTitle,
}) => {
  try {
    // Generate token
    const hashToken = crypto.randomBytes(20).toString("hex");

    // Set token expiry
    const expiry = new Date(Date.now() + 3600000).toISOString(); // Convert to ISO string

    switch (emailType) {
      // Update user with token and expiry
      case "verify":
        await User.query().findById(userId).patch({
          verifyToken: hashToken,
          verifyTokenExpiry: expiry,
        });
        break;
      // Update user with token and expiry
      case "reset":
        await User.query().findById(userId).patch({
          forgotPasswordToken: hashToken,
          forgotPasswordTokenExpiry: expiry,
        });
        break;
    }

    // Create transporter
    let transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Create mail options
    let mailOptions = {
      from: {
        name: "Virtual Horizon Learning",
        email: process.env.EMAIL_USER,
      },
      to:
        emailType === "verify" ? email : emailType === "reset" ? email : emails,
      subject:
        emailType === "verify"
          ? "Verify Email"
          : emailType === "reset"
          ? "Reset Password"
          : "Schedule Meeting Notification",
      html:
        emailType === "verify"
          ? process.env.CLIENT_URL_DEVELOPMENT
            ? `<h1>Verify Email</h1>
      <p>Click <a href="${process.env.CLIENT_URL_DEVELOPMENT}/verify/${hashToken}">here</a> to verify your email</p>`
            : `<h1>Verify Email</h1>
      <p>Click <a href="${process.env.CLIENT_URL_PRODUCTION}/verify/${hashToken}">here</a> to verify your email</p>`
          : emailType === "reset"
          ? process.env.CLIENT_URL_DEVELOPMENT
            ? `<h1>Reset Password</h1>
      <p>Click <a href="${process.env.CLIENT_URL_DEVELOPMENT}/reset-password/${hashToken}">here</a> to reset your password</p>`
            : `<h1>Reset Password</h1>
      <p>Click <a href="${process.env.CLIENT_URL_PRODUCTION}/reset-password/${hashToken}">here</a> to reset your password</p>`
          : `
      <h1>Join Your Meeting</h1>
      <h2>Course: ${courseTitle}</h2>
      <p>Date: ${moment(meetingDate).format("MMMM Do YYYY, h:mm A")}</p>
      <p>Click <a href="${meetingLink}">here</a> to join your meeting</p>`,
    };

    // Send mail
    const mailResponse = await transporter.sendMail(mailOptions);

    // Return mail response
    return mailResponse;
  } catch (error) {
    // Throw error if any occurs
    throw new Error(error.message);
  }
};

//  Export the module
module.exports = {
  sendEmail,
};
