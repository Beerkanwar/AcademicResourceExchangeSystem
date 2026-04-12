const { ForbiddenError } = require('../utils/apiError');

/**
 * Role-based access control middleware
 * Usage: roleGuard('admin', 'teacher') — allows only admin and teacher roles
 */
const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('Access denied. Authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}.`
        )
      );
    }

    next();
  };
};

module.exports = roleGuard;
