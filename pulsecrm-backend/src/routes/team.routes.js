const express = require("express");
const teamController = require("../controllers/team.controller");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const {
  createTeamSchema,
  updateTeamSchema,
} = require("../validators/team.validator");

const router = express.Router();

/**
 * @openapi
 * /api/teams:
 *   get:
 *     summary: List all teams in the authenticated user's company
 *     tags: [Team]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of teams
 */
router.get("/", authenticate, teamController.listTeams);

/**
 * @openapi
 * /api/teams/{id}:
 *   get:
 *     summary: Get a single team (and its members) by id
 *     tags: [Team]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Team details
 *       404:
 *         description: Team not found
 */
router.get("/:id", authenticate, teamController.getTeam);

/**
 * @openapi
 * /api/teams:
 *   post:
 *     summary: Create a team (Admin or Manager only)
 *     tags: [Team]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *     responses:
 *       201:
 *         description: Team created
 *       403:
 *         description: Forbidden
 *       422:
 *         description: Validation failed
 */
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "MANAGER"),
  validate(createTeamSchema),
  teamController.createTeam
);

/**
 * @openapi
 * /api/teams/{id}:
 *   patch:
 *     summary: Rename a team (Admin or Manager only)
 *     tags: [Team]
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
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *     responses:
 *       200:
 *         description: Team updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Team not found
 */
router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN", "MANAGER"),
  validate(updateTeamSchema),
  teamController.updateTeam
);

/**
 * @openapi
 * /api/teams/{id}:
 *   delete:
 *     summary: Delete a team (Admin only). Members are unassigned, not deleted.
 *     tags: [Team]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Team deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Team not found
 */
router.delete("/:id", authenticate, authorize("ADMIN"), teamController.deleteTeam);

module.exports = router;
