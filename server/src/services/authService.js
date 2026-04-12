const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { UnauthorizedError, BadRequestError, NotFoundError } = require('../utils/apiError');
const { AUDIT_ACTIONS } = require('../utils/constants');

class AuthService {
  /**
   * Generate JWT token for a user
   */
  static generateToken(user) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
  }

  /**
   * Authenticate user with email and password
   */
  static async login(email, password, ipAddress = '') {
    // Find user with password field included
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('department', 'name code');

    if (!user) {
      await AuthService.logAuditEvent(null, AUDIT_ACTIONS.LOGIN_FAILED, 'User', null, {
        email,
        reason: 'User not found',
        ipAddress,
      });
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Your account has been deactivated. Contact admin.');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await AuthService.logAuditEvent(user._id, AUDIT_ACTIONS.LOGIN_FAILED, 'User', user._id, {
        reason: 'Wrong password',
        ipAddress,
      });
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = AuthService.generateToken(user);

    // Log successful login
    await AuthService.logAuditEvent(user._id, AUDIT_ACTIONS.LOGIN_SUCCESS, 'User', user._id, {
      ipAddress,
    });

    // Return user data without password
    const userData = user.toSafeJSON();

    return { token, user: userData };
  }

  /**
   * Change user password
   */
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new BadRequestError('Current password is incorrect');
    }

    // Validate new password
    if (newPassword.length < 6) {
      throw new BadRequestError('New password must be at least 6 characters');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestError('New password must be different from current password');
    }

    // Update password
    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    // Log password change
    await AuthService.logAuditEvent(userId, AUDIT_ACTIONS.PASSWORD_CHANGED, 'User', userId, {});

    return { message: 'Password changed successfully' };
  }

  /**
   * Get user profile
   */
  static async getProfile(userId) {
    const user = await User.findById(userId).populate('department', 'name code');
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user.toSafeJSON();
  }

  /**
   * Update user profile (limited fields)
   */
  static async updateProfile(userId, updates) {
    const allowedFields = ['firstName', 'lastName', 'phone', 'avatar'];
    const filteredUpdates = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      filteredUpdates,
      { new: true, runValidators: true }
    ).populate('department', 'name code');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user.toSafeJSON();
  }

  /**
   * Log an audit event
   */
  static async logAuditEvent(actorId, action, targetType, targetId, details = {}) {
    try {
      // For failed logins where we don't have a user ID, skip
      if (!actorId && !targetId) return;
      await AuditLog.create({
        actor: actorId || targetId,
        action,
        targetType,
        targetId: targetId || actorId,
        details,
      });
    } catch (err) {
      // Don't let audit logging failures break the main flow
      console.error('Audit log failed:', err.message);
    }
  }
}

module.exports = AuthService;
