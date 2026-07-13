const authService = require("../services/auth.service");

// Register
const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    await authService.logout(req.body);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Refresh Token
const refreshToken = async (req, res) => {
  try {
    const result = await authService.refreshToken(req.body);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    await authService.forgotPassword(req.body);

    return res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    await authService.resetPassword(req.params.token, req.body);

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Verify Email
const verifyEmail = async (req, res) => {
  try {
    await authService.verifyEmail(req.params.token);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
};