const express = require("express");
const companyController = require("../controllers/company.controller");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const { updateCompanySchema } = require("../validators/company.validator");

const router = express.Router();

/**
 * @openapi
 * /api/companies/me:
 *   get:
 *     summary: Get the authenticated user's company
 *     tags: [Company]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Company details
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Company not found
 */
router.get("/me", authenticate, companyController.getMyCompany);

/**
 * @openapi
 * /api/companies/me:
 *   patch:
 *     summary: Update the authenticated user's company (Admin only)
 *     tags: [Company]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               industry:
 *                 type: string
 *     responses:
 *       200:
 *         description: Company updated
 *       403:
 *         description: Forbidden — Admin role required
 *       422:
 *         description: Validation failed
 */
router.patch(
  "/me",
  authenticate,
  authorize("ADMIN"),
  validate(updateCompanySchema),
  companyController.updateMyCompany
);

module.exports = router;
