const crypto = require('crypto');
const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    /** SHA-256 hash of the opaque refresh token (never store the raw token) */
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    /** Groups rotated tokens from the same login session (reuse detection) */
    familyId: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    replacedByTokenHash: {
      type: String,
      default: null,
    },
    createdByIp: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ user: 1, familyId: 1 });

refreshTokenSchema.virtual('isExpired').get(function () {
  return this.expiresAt.getTime() <= Date.now();
});

refreshTokenSchema.virtual('isRevoked').get(function () {
  return this.revokedAt != null;
});

refreshTokenSchema.virtual('isActive').get(function () {
  return !this.isRevoked && !this.isExpired;
});

refreshTokenSchema.statics.hashToken = function (rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
};

refreshTokenSchema.statics.generateRawToken = function () {
  return crypto.randomBytes(64).toString('hex');
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
