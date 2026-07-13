const express = require("express");
const authController = require("../controllers/auth.controller");

const router = express.Router();

/**
 * Authentication Routes
 */

// Register User
router.post("/register", authController.register);

// Login User
router.post("/login", authController.login);

// Logout User
router.post("/logout", authController.logout);

// Refresh Access Token
router.post("/refresh-token", authController.refreshToken);

// Forgot Password
router.post("/forgot-password", authController.forgotPassword);

// Reset Password
router.post("/reset-password/:token", authController.resetPassword);

// Email Verification
router.get("/verify-email/:token", authController.verifyEmail);

module.exports = router;