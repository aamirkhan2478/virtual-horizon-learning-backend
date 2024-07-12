const express = require("express");
// const auth = require("../middleware/auth.middleware.mjs");

const {
    register,
    login,
    verifyEmail,
    forgotPassword,
    resetPassword,
    // updateUser,
    changePassword,
    // updateImage,
    resendEmail,
    // getAllUsers,
} = require("../controllers/user.controllers.js");

const router = express.Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
// router.put("/update-user", auth, updateUser);
router.put("/change-password", auth, changePassword);
// router.patch("/update-image", auth, updateImage);
router.post("/resend-email", resendEmail);
// router.get("/all", auth, getAllUsers);

module.exports = router;
