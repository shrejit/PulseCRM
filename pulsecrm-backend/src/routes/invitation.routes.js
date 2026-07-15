const express = require("express");
const invitationController = require("../controllers/invitation.controller");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const {
  createInvitationSchema,
  acceptInvitationSchema,
} = require("../validators/invitation.validator");

const router = express.Router();

/**
 * @openapi
 * /api/invitations:
 *   post:
 *     summary: Invite a new user to the company (Admin or Manager only)
 *     tags: [Invitation]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *               role: { type: string, enum: [ADMIN, MANAGER, REP] }
 *               teamId: { type: string, nullable: true }
 *     responses:
 *       201:
 *         description: Invitation created and emailed
 *       403:
 *         description: Forbidden
 *       409:
 *         description: User already exists or invitation already pending
 */
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "MANAGER"),
  validate(createInvitationSchema),
  invitationController.createInvitation
);

/**
 * @openapi
 * /api/invitations:
 *   get:
 *     summary: List invitations for the authenticated user's company (Admin or Manager only)
 *     tags: [Invitation]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of invitations
 *       403:
 *         description: Forbidden
 */
router.get("/", authenticate, authorize("ADMIN", "MANAGER"), invitationController.listInvitations);

/**
 * @openapi
 * /api/invitations/{token}:
 *   get:
 *     summary: Look up an invitation by token (public — used to render the accept-invite page)
 *     tags: [Invitation]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Invitation details (email, role, company/team name)
 *       400:
 *         description: Invitation expired or already used
 *       404:
 *         description: Invitation not found
 */
router.get("/:token", invitationController.getInvitationByToken);

/**
 * @openapi
 * /api/invitations/{token}/accept:
 *   post:
 *     summary: Accept an invitation and create the account (public)
 *     tags: [Invitation]
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
 *             required: [name, password]
 *             properties:
 *               name: { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: Account created and logged in
 *       400:
 *         description: Invitation expired or already used
 *       404:
 *         description: Invitation not found
 */
router.post(
  "/:token/accept",
  validate(acceptInvitationSchema),
  invitationController.acceptInvitation
);

/**
 * @openapi
 * /api/invitations/{id}:
 *   delete:
 *     summary: Revoke a pending invitation (Admin or Manager only)
 *     tags: [Invitation]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Invitation revoked
 *       400:
 *         description: Invitation is not pending
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Invitation not found
 */
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "MANAGER"),
  invitationController.revokeInvitation
);

module.exports = router;
