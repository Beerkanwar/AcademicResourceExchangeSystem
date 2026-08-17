const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const RefreshToken = require('../models/RefreshToken');
const { UnauthorizedError, BadRequestError, NotFoundError } = require('../utils/apiError');
const { AUDIT_ACTIONS } = require('../utils/constants');
const logger = require('../utils/logger');

/** Parse durations like "15m", "7d", "1h" into milliseconds */
const parseDurationMs = (value, fallbackMs) => {
  if (!value || typeof value !== 'string') return fallbackMs;
  const match = /^(\d+)(ms|s|m|h|d)$/i.exec(value.trim());
  if (!match) return fallbackMs;
  const amount = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const multipliers = { ms: 1, s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return amount * multipliers[unit];
};

class AuthService {
  /**
   * Short-lived JWT access token
   */
  static generateAccessToken(user) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        type: 'access',
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
    );
  }

  /** @deprecated Use generateAccessToken */
  static generateToken(user) {
    return AuthService.generateAccessToken(user);
  }

  /**
   * Create and persist a refresh token for a user (stores only the hash).
   */
  static async issueRefreshToken(userId, { familyId, ipAddress = '', userAgent = '' } = {}) {
    const rawToken = RefreshToken.generateRawToken();
    const tokenHash = RefreshToken.hashToken(rawToken);
    const resolvedFamilyId = familyId || crypto.randomUUID();
    const expiresAt = new Date(
      Date.now() + parseDurationMs(env.JWT_REFRESH_EXPIRES_IN, 7 * 24 * 60 * 60 * 1000)
    );

    await RefreshToken.create({
      user: userId,
      tokenHash,
      familyId: resolvedFamilyId,
      expiresAt,
      createdByIp: ipAddress,
      userAgent,
    });

    return { rawToken, tokenHash, familyId: resolvedFamilyId, expiresAt };
  }

  static async revokeTokenDocument(tokenDoc, replacedByTokenHash = null) {
    if (!tokenDoc || tokenDoc.revokedAt) return tokenDoc;
    tokenDoc.revokedAt = new Date();
    if (replacedByTokenHash) {
      tokenDoc.replacedByTokenHash = replacedByTokenHash;
    }
    await tokenDoc.save();
    return tokenDoc;
  }

  static async revokeFamily(userId, familyId) {
    await RefreshToken.updateMany(
      { user: userId, familyId, revokedAt: null },
      { $set: { revokedAt: new Date() } }
    );
  }

  static async revokeAllUserTokens(userId) {
    await RefreshToken.updateMany(
      { user: userId, revokedAt: null },
      { $set: { revokedAt: new Date() } }
    );
  }

  /**
   * Authenticate user with email and password
   */
  static async login(email, password, ipAddress = '', userAgent = '') {
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

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await AuthService.logAuditEvent(user._id, AUDIT_ACTIONS.LOGIN_FAILED, 'User', user._id, {
        reason: 'Wrong password',
        ipAddress,
      });
      throw new UnauthorizedError('Invalid email or password');
    }

    user.lastLogin = new Date();
    await user.save();

    const accessToken = AuthService.generateAccessToken(user);
    const { rawToken: refreshToken } = await AuthService.issueRefreshToken(user._id, {
      ipAddress,
      userAgent,
    });

    await AuthService.logAuditEvent(user._id, AUDIT_ACTIONS.LOGIN_SUCCESS, 'User', user._id, {
      ipAddress,
    });

    return {
      accessToken,
      refreshToken,
      /** Backward-compatible alias used by existing clients/tests */
      token: accessToken,
      user: user.toSafeJSON(),
    };
  }

  /**
   * Rotate refresh token and issue a new access token.
   * Reuse of an already-rotated token invalidates the entire token family.
   */
  static async refresh(rawRefreshToken, ipAddress = '', userAgent = '') {
    if (!rawRefreshToken || typeof rawRefreshToken !== 'string') {
      throw new UnauthorizedError('Refresh token is required');
    }

    const tokenHash = RefreshToken.hashToken(rawRefreshToken);
    const stored = await RefreshToken.findOne({ tokenHash });

    if (!stored) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Reuse detection: revoked token presented again → compromise suspected
    if (stored.revokedAt) {
      logger.warn('Refresh token reuse detected; revoking token family', {
        userId: stored.user,
        familyId: stored.familyId,
        ipAddress,
      });

      await AuthService.revokeFamily(stored.user, stored.familyId);
      await AuthService.logAuditEvent(
        stored.user,
        AUDIT_ACTIONS.REFRESH_TOKEN_REUSE,
        'User',
        stored.user,
        { familyId: stored.familyId, ipAddress, userAgent }
      );

      throw new UnauthorizedError(
        'Refresh token reuse detected. All sessions in this login family have been revoked. Please log in again.'
      );
    }

    if (stored.expiresAt.getTime() <= Date.now()) {
      await AuthService.revokeTokenDocument(stored);
      throw new UnauthorizedError('Refresh token has expired. Please log in again.');
    }

    const user = await User.findById(stored.user).populate('department', 'name code');
    if (!user || !user.isActive) {
      await AuthService.revokeFamily(stored.user, stored.familyId);
      throw new UnauthorizedError('User account is no longer valid');
    }

    const { rawToken: newRefreshToken, tokenHash: newHash } = await AuthService.issueRefreshToken(
      user._id,
      {
        familyId: stored.familyId,
        ipAddress,
        userAgent,
      }
    );

    await AuthService.revokeTokenDocument(stored, newHash);

    const accessToken = AuthService.generateAccessToken(user);

    await AuthService.logAuditEvent(user._id, AUDIT_ACTIONS.TOKEN_REFRESH, 'User', user._id, {
      familyId: stored.familyId,
      ipAddress,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      token: accessToken,
      user: user.toSafeJSON(),
    };
  }

  /**
   * Revoke the provided refresh token (logout).
   */
  static async logout(rawRefreshToken, userId = null, ipAddress = '') {
    if (!rawRefreshToken) {
      // Still succeed so clients can clear local state even if token is missing
      return { message: 'Logged out successfully' };
    }

    const tokenHash = RefreshToken.hashToken(rawRefreshToken);
    const stored = await RefreshToken.findOne({ tokenHash });

    if (stored) {
      if (userId && stored.user.toString() !== userId.toString()) {
        throw new UnauthorizedError('Refresh token does not belong to this user');
      }
      await AuthService.revokeTokenDocument(stored);
      await AuthService.logAuditEvent(
        stored.user,
        AUDIT_ACTIONS.LOGOUT,
        'User',
        stored.user,
        { familyId: stored.familyId, ipAddress }
      );
    }

    return { message: 'Logged out successfully' };
  }

  /**
   * Change user password
   */
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new BadRequestError('Current password is incorrect');
    }

    if (newPassword.length < 6) {
      throw new BadRequestError('New password must be at least 6 characters');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestError('New password must be different from current password');
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    // Invalidate all refresh sessions after a password change
    await AuthService.revokeAllUserTokens(userId);

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
      if (!actorId && !targetId) return;
      await AuditLog.create({
        actor: actorId || targetId,
        action,
        targetType,
        targetId: targetId || actorId,
        details,
      });
    } catch (err) {
      logger.error('Audit log failed', { error: err.message });
    }
  }
}

module.exports = AuthService;
