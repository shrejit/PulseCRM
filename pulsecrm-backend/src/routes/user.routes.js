const express = require("express");
const userController = require("../controllers/user.controller");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const {
  assignRoleSchema,
  assignTeamSchema,
  setStatusSchema,
} = require("../validators/user.validator");

const router = express.Router();

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: List all users in the authenticated user's company (Admin or Manager only)
 *     tags: [User]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Forbidden
 */
router.get("/", authenticate, authorize("ADMIN", "MANAGER"), userController.listUsers);

/**
 * @openapi
 * /api/users/{id}/role:
 *   patch:
 *     summary: Assign a role to a user (Admin only)
 *     tags: [User]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [ADMIN, MANAGER, REP] }
 *     responses:
 *       200:
 *         description: Role updated
 *       400:
 *         description: Would remove the last Admin, or validation failed
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.patch(
  "/:id/role",
  authenticate,
  authorize("ADMIN"),
  validate(assignRoleSchema),
  userController.assignRole
);

/**
 * @openapi
 * /api/users/{id}/team:
 *   patch:
 *     summary: Assign or remove a user's team (Admin or Manager only)
 *     tags: [User]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [teamId]
 *             properties:
 *               teamId: { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: Team assignment updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User or team not found
 */
router.patch(
  "/:id/team",
  authenticate,
  authorize("ADMIN", "MANAGER"),
  validate(assignTeamSchema),
  userController.assignTeam
);

/**
 * @openapi
 * /api/users/{id}/status:
 *   patch:
 *     summary: Activate or deactivate a user (Admin only)
 *     tags: [User]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isActive]
 *             properties:
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Would deactivate the last Admin
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN"),
  validate(setStatusSchema),
  userController.setStatus
);

module.exports = router;
