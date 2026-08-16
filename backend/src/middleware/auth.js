const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const { UnauthorizedError, ForbiddenError } = require('../utils/apiError');

/** Routes still allowed while mustChangePassword is true */
const MUST_CHANGE_PASSWORD_EXEMPT = [
  { method: 'POST', pattern: /\/auth\/change-password\/?$/i },
  { method: 'POST', pattern: /\/auth\/logout\/?$/i },
];

/**
 * Whether this request may proceed when the user must change their password.
 */
const isMustChangePasswordExempt = (req) => {
  const path = (req.originalUrl || req.url || '').split('?')[0];
  return MUST_CHANGE_PASSWORD_EXEMPT.some(
    (rule) => req.method === rule.method && rule.pattern.test(path)
  );
};

/**
 * Block authenticated users who still need to change their password,
 * except for the password-change and logout endpoints.
 */
const enforcePasswordChange = (req) => {
  if (req.user?.mustChangePassword && !isMustChangePasswordExempt(req)) {
    throw new ForbiddenError(
      'Password change required. Please update your password before accessing this resource.'
    );
  }
};

/**
 * JWT Authentication Middleware
 * Extracts token from Authorization header, verifies it, and attaches user to req
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Access denied. No token provided.');
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw new UnauthorizedError('Token is valid but user no longer exists.');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account has been deactivated.');
    }

    // Attach user to request
    req.user = user;
    enforcePasswordChange(req);
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid token.'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token has expired.'));
    }
    next(error);
  }
};

/**
 * Optional auth — attaches user if token exists, but doesn't reject without one
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, env.JWT_SECRET);
          const user = await User.findById(decoded.id).select('-password');
          if (user && user.isActive) {
            req.user = user;
          }
        } catch {
          // Invalid/expired token — continue without attaching a user
        }
      }
    }

    enforcePasswordChange(req);
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role Guardian Middleware
 * Checks if authenticated user has required role(s)
 */
const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('Access denied. Authentication required.'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Access denied. Insufficient permissions.'));
    }
    next();
  };
};

module.exports = { auth, optionalAuth, roleGuard };
