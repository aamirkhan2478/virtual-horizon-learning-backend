const express = require("express");
const auth = require("../middlewares/auth.middleware.js");

const {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  updateUser,
  changePassword,
  updateImage,
  resendEmail,
  // getAllUsers,
} = require("../controllers/user.controllers.js");
const upload = require("../middlewares/multer.middleware.js");

// Create a new router
const router = express.Router();

// Handle register
router.post("/register", register);

// Handle verify email
router.post("/verify-email", verifyEmail);

// Handle login
router.post("/login", login);

// Handle forgot password
router.post("/forgot-password", forgotPassword);

// Handle reset password
router.post("/reset-password", resetPassword);

// Handle update user
router.put("/update-user", auth, updateUser);

// Handle change password
router.put("/change-password", auth, changePassword);

// Handle update image
router.patch("/update-image", auth, upload.single("pic"), updateImage);

// Handle resend email
router.post("/resend-email", resendEmail);

// Handle get all users
// router.get("/all", auth, getAllUsers);

// Export the router
module.exports = router;
