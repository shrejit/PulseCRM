/**
 * Role-based access control middleware factory.
 *
 * Usage:
 *   router.post("/teams", authenticate, authorize("ADMIN"), teamController.create);
 *   router.get("/teams", authenticate, authorize("ADMIN", "MANAGER"), teamController.list);
 *
 * Must be used AFTER `authenticate`, since it relies on `req.user.role`
 * having already been attached.
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
};

module.exports = authorize;
