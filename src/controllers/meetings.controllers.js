const { sendEmail } = require("../utils/mailer.utils");

const sendingEmail = async (req, res) => {
  // Get data from request body
  const { emailType, emails, meetingLink, meetingDate, courseTitle } = req.body;

  // Check if all fields are provided
  if (!emailType || !emails || !meetingLink || !meetingDate || !courseTitle) {
    return res
      .status(400)
      .json({ error: "All fields are required to send email" });
  }
  try {
    // Send email
    await sendEmail({
      emailType,
      emails,
      meetingLink,
      meetingDate,
      courseTitle,
    });

    // Return success response
    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    // Return error response
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  sendingEmail,
};
