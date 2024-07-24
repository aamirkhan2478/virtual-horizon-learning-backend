const User = require("../models/user.model.js");
const { sendEmail } = require("../utils/mailer.utils.js");
const bcrypt = require("bcryptjs");

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

  const userTypes = ["Admin", "Teacher", "Student", "Parent"];
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

// @route   POST /api/user/verify-email
// @desc    Verify user email
// @access  Public
const verifyEmail = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Invalid token", success: false });
  }

  try {
    // Find user with token and expiry
    const user = await User.query()
      .where("verifyToken", token)
      .andWhere("verifyTokenExpiry", ">", new Date().toISOString())
      .first();

    // Check if user exists
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired token", success: false });
    }

    // Update user with verified email and remove token and expiry
    await User.query().patchAndFetchById(user.id, {
      isVerified: true,
      verifyToken: null,
      verifyTokenExpiry: null,
    });

    return res
      .status(200)
      .json({ message: "Email verified successfully", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/user/login
// @desc    Login user
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "All fields are required", success: false });
  }

  try {
    // Find user with email
    const user = await User.query().findOne({ email });

    // Check if user exists
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res
        .status(400)
        .json({ message: "Email not verified", success: false });
    }

    // Generate access token
    const token = user.generateAccessToken();

    const userWithOutPass = await User.query()
      .findById(user.id)
      .select("id", "name", "email", "userType", "phoneNumber");

    // return success response
    return res.status(200).json({
      message: "User logged in successfully",
      token,
      success: true,
      user: userWithOutPass,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// @route   POST /api/user/forgot-password
// @desc    Forgot password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ message: "Email is required", success: false });
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ message: "Email is not valid", success: false });
  }

  try {
    // Find user with email
    const user = await User.query().findOne({ email });

    // Check if user exists
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }

    // send reset password email
    await sendEmail({ email, emailType: "reset", userId: user.id });

    return res
      .status(200)
      .json({ message: "Reset link sent to email", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// @route   POST /api/user/reset-password
// @desc    Reset password
// @access  Public
const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
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

  try {
    // Find user with token and expiry
    const user = await User.query()
      .where("forgotPasswordToken", token)
      .andWhere("forgotPasswordTokenExpiry", ">", new Date().toISOString())
      .first();

    // Check if user exists
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired token", success: false });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user with new password
    await User.query().patchAndFetchById(user.id, {
      password: hashedPassword,
      forgotPasswordToken: null,
      forgotPasswordTokenExpiry: null,
    });

    // return success response
    return res
      .status(200)
      .json({ message: "Password reset successfully", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// @route   PUT api/user/change-password
// @desc    Change user password
// @access  Private
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "All fields are required", success: false });
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&#_])[A-Za-z\d$@$!%*?&#_]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      message:
        "Password must be 8 characters long, include 1 special character, any number, and one capital letter",
      success: false,
    });
  }

  try {
    // Find user by id
    const user = await User.query().findById(req.user.id);

    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }

    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid current password", success: false });
    }

    // hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user with new password
    await User.query().patchAndFetchById(user.id, {
      password: hashedPassword,
    });

    return res
      .status(200)
      .json({ message: "Password changed successfully", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// @route   POST api/user/resend-email
// @desc    Resend verification email
// @access  Public
const resendEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ message: "Email is required", success: false });
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ message: "Email is not valid", success: false });
  }

  try {
    // Find user with email
    const user = await User.query().findOne({ email });

    // Check if user exists
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }

    // Check if email is verified
    if (user.isVerified) {
      return res
        .status(400)
        .json({ message: "Email already verified", success: false });
    }

    // send verification email
    await sendEmail({ email, emailType: "verify", userId: user.id });

    return res
      .status(200)
      .json({ message: "Verification link sent to email", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// @route   PUT /api/user/update-user
// @desc    Update loggedIn user
// @access  Private
const updateUser = async (req, res) => {
  try {
    // Find user by id
    const user = await User.query().findById(req.user.id);

    // Check if user exists
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }

    // Get user details from request body
    const { name, email, phoneNumber } = req.body;

    // Update user details
    if (name) user.name = name;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    // Save user
    await user.$query().patch();

    // return success response
    return res
      .status(200)
      .json({ message: "User updated successfully", success: true });
  } catch (error) {
    // return error response
    return res.status(500).json({ message: error.message, success: false });
  }
};

// @route   PATCH /api/user/update-image
// @desc    Update loggedIn user image
// @access  Private
const updateImage = async (req, res) => {
  const file = req.file;

  // https://domainname.com/uploads/filename-dfse3453ds.jpeg
  const basePath = `${req.protocol}://${req.get("host")}/uploads/`;

  // Check if files are available
  if (!file) {
    return res
      .status(400)
      .json({ message: "Please select an file!", success: false });
  }

  // Create user image path
  const pic = `${basePath}${file.filename}`;

  try {
    // Find user by id
    const user = await User.query().findById(req.user.id);

    // Check if user exists
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }

    // Update user image
    user.pic = pic;

    // Save user
    await user.$query().patch();

    // return success response
    return res.status(200).json({
      pic: user.pic,
      message: "Image updated successfully",
      success: true,
    });
  } catch (error) {
    // return error response
    return res.status(500).json({ message: error.message, success: false });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  resendEmail,
  updateUser,
  updateImage,
};
