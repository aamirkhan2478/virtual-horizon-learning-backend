const nodemailer = require("nodemailer");
const User = require("../models/user.model.js");
const crypto = require("crypto");
const moment = require("moment");

const sendEmail = async ({
  email,
  emailType,
  userId,
  emails,
  message,
  name,
  meetingLink,
  meetingDate,
  courseTitle,
  subject,
}) => {
  try {
    // Generate token
    const hashToken = crypto.randomBytes(20).toString("hex");

    // Set token expiry
    const expiry = new Date(Date.now() + 3600000).toISOString(); // Convert to ISO string

    switch (emailType) {
      case "verify":
        await User.query().findById(userId).patch({
          verifyToken: hashToken,
          verifyTokenExpiry: expiry,
        });
        break;
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

    let recipient;
    if (emailType === "contact") {
      recipient = process.env.EMAIL_USER;
    } else {
      recipient =
        emailType === "verify" ? email : emailType === "reset" ? email : emails;
    }

    // Validate recipient
    if (!recipient || (Array.isArray(recipient) && recipient.length === 0)) {
      throw new Error("No valid recipients defined for the email.");
    }

    // Create mail options
    let mailOptions = {
      from: {
        name: emailType === "contact" ? name : "Virtual Horizon Learning",
        email: emailType === "contact" ? email : process.env.EMAIL_USER,
      },
      to: recipient,
      subject:
        emailType === "verify"
          ? "Verify Email"
          : emailType === "reset"
          ? "Reset Password"
          : emailType === "contact"
          ? subject
          : "Schedule Meeting Notification",
      html:
        emailType === "verify"
          ? `<h1>Verify Email</h1>
            <p>Click <a href="${
              process.env.CLIENT_URL_DEVELOPMENT
                ? `${process.env.CLIENT_URL_DEVELOPMENT}/verify/${hashToken}`
                : `${process.env.CLIENT_URL_PRODUCTION}/verify/${hashToken}`
            }">here</a> to verify your email</p>`
          : emailType === "reset"
          ? `<h1>Reset Password</h1>
            <p>Click <a href="${
              process.env.CLIENT_URL_DEVELOPMENT
                ? `${process.env.CLIENT_URL_DEVELOPMENT}/reset-password/${hashToken}`
                : `${process.env.CLIENT_URL_PRODUCTION}/reset-password/${hashToken}`
            }">here</a> to reset your password</p>`
          : emailType === "contact"
          ? `
            <h1>Contact Form</h1>
            <p>Name: ${name}</p>
            <p>Email: ${email}</p>
            <p>Message: ${message}</p>
            `
          : `
            <h1>Join Your Meeting</h1>
            <h2>Course: ${courseTitle}</h2>
            <p>Date: ${moment(meetingDate).format("MMMM Do YYYY, h:mm A")}</p>
            <p>Click <a href="${meetingLink}">here</a> to join your meeting</p>`,
    };

    // Send mail
    const mailResponse = await transporter.sendMail(mailOptions);

    return mailResponse;
  } catch (error) {
    console.error("Error in sendEmail:", error.message);
    throw new Error(error.message);
  }
};

//  Export the module
module.exports = {
  sendEmail,
};
