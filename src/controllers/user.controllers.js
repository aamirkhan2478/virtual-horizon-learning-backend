const User = require("../models/user.model.js");
const { sendEmail } = require("../utils/mailer.utils.js");

// @route   POST /api/user/register
// @desc    Register new user
// @access  Public
const register = async (req, res) => {
  const { name, email, password, userType, phoneNumber } = req.body;

  if (!name || !email || !password || !userType || !phoneNumber) {
    return res
      .status(400)
      .json({ message: "All fields are required", success: false });
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&#_])[A-Za-z\d$@$!%*?&#_]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must be 8 characters long, include 1 special character, any number, and one capital letter",
      success: false,
    });
  }

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9-]+\.[A-Z]{2,4}$/i;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ message: "Email is not valid", success: false });
  }

  const userTypes = ["Admin", "Donor", "Recipient"];
  if (!userTypes.includes(userType)) {
    return res
      .status(400)
      .json({ message: "Invalid user type", success: false });
  }

  try {
    const userExists = await User.query().findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User already exists", success: false });
    }

    const user = await User.query().insert({
      name,
      email,
      password,
      userType,
      phoneNumber,
    });

    await sendEmail({ email, emailType: "verify", userId: user.id });

    const userWithOutPass = await User.query()
      .findById(user.id)
      .select("id", "name", "email", "userType", "phoneNumber");

    return res.status(201).json({
      message: "Registered Successfully",
      success: true,
      user: userWithOutPass,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

module.exports = {
  register,
};
