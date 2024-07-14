const nodemailer = require("nodemailer");
const User = require("../models/user.model.js");
const crypto = require("crypto");

const sendEmail = async ({ email, emailType, userId }) => {
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

    let transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let mailOptions = {
      from: {
        name: "Food Donation Finder",
        email: process.env.EMAIL_USER,
      },
      to: email,
      subject: emailType === "verify" ? "Verify Email" : "Reset Password",
      html:
        emailType === "verify"
          ? `<h1>Verify Email</h1>
      <p>Click <a href="${
        process.env.CLIENT_URL_PRODUCTION || process.env.CLIENT_URL_DEVELOPMENT
      }/verify/${hashToken}">here</a> to verify your email</p>`
          : `<h1>Reset Password</h1>
      <p>Click <a href="${
        process.env.CLIENT_URL_PRODUCTION || process.env.CLIENT_URL_DEVELOPMENT
      }/reset-password/${hashToken}">here</a> to reset your password</p>`,
    };

    const mailResponse = await transporter.sendMail(mailOptions);

    return mailResponse;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  sendEmail,
};
