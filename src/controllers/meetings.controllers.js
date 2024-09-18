const { sendEmail } = require("../utils/mailer.utils");

const sendingEmail = async (req, res) => {
  const { emailType, emails, meetingLink, meetingDate, courseTitle } = req.body;

  if (!emailType || !emails || !meetingLink || !meetingDate || !courseTitle) {
    return res
      .status(400)
      .json({ error: "All fields are required to send email" });
  }
  try {
    await sendEmail({
      emailType,
      emails,
      meetingLink,
      meetingDate,
      courseTitle,
    });
    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  sendingEmail,
};
