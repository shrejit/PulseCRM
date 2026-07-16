const express = require("express");
const authController = require("../controllers/auth.controller");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

/**
 * Authentication Routes
 */

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user (and a new company, if companyName is given)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string }
 *               companyName: { type: string, description: "Creates a new company; the registering user becomes ADMIN" }
 *               companyId: { type: string, description: "Join an existing company instead of creating one" }
 *     responses:
 *       201:
 *         description: User registered, tokens issued, verification email sent
 *       400:
 *         description: Missing fields or email already exists
 */
router.post("/register", authController.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful, tokens issued
 *       401:
 *         description: Invalid credentials or inactive account
 */
router.post("/login", authController.login);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Log out — revokes the current session's refresh token (or all sessions if none is provided)
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Not authenticated
 */
router.post("/logout", authenticate, authController.logout);

/**
 * @openapi
 * /api/auth/refresh-token:
 *   post:
 *     summary: Exchange a refresh token for a new access/refresh token pair (rotation)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: New access/refresh token pair
 *       401:
 *         description: Invalid, expired, or reused (revoked) refresh token
 */
router.post("/refresh-token", authController.refreshToken);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get the currently authenticated user's profile
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: The authenticated user's profile
 *       401:
 *         description: Not authenticated
 */
router.get("/me", authenticate, authController.getMe);

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Reset email sent (if the account exists)
 *       400:
 *         description: User not found
 */
router.post("/forgot-password", authController.forgotPassword);

/**
 * @openapi
 * /api/auth/reset-password/{token}:
 *   post:
 *     summary: Reset a password using a reset token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Password reset successful; all existing sessions revoked
 *       400:
 *         description: Invalid or expired token
 */
router.post("/reset-password/:token", authController.resetPassword);

/**
 * @openapi
 * /api/auth/verify-email/{token}:
 *   get:
 *     summary: Verify an email address using a verification token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid token
 */
router.get("/verify-email/:token", authController.verifyEmail);

module.exports = router;
