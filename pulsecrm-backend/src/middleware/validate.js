/**
 * Generic request validation middleware.
 *
 * Usage:
 *   router.post("/teams", authenticate, validate(createTeamSchema), teamController.create);
 *
 * `schema` is a zod object schema validated against `req.body` by default.
 * Pass `{ source: "params" }` or `{ source: "query" }` to validate those instead.
 */
const validate = (schema, { source = "body" } = {}) => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    req[source] = result.data;
    next();
  };
};

module.exports = validate;
