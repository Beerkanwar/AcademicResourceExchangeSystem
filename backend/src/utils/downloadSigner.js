const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { UnauthorizedError, ForbiddenError } = require('./apiError');

const DOWNLOAD_TOKEN_TYPE = 'download';

/**
 * Create a short-lived download JWT bound to a user and file.
 */
const createDownloadToken = ({
  fileId,
  userId,
  versionId = null,
  purpose = 'download',
}) => {
  const expiresIn = env.DOWNLOAD_SIGNED_URL_EXPIRES_IN;
  const payload = {
    type: DOWNLOAD_TOKEN_TYPE,
    fileId: String(fileId),
    userId: String(userId),
    purpose,
  };

  if (versionId) {
    payload.versionId = String(versionId);
  }

  const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn });
  const decoded = jwt.decode(token);
  const expiresAt = decoded?.exp
    ? new Date(decoded.exp * 1000).toISOString()
    : new Date(Date.now() + 5 * 60 * 1000).toISOString();

  return { token, expiresAt, expiresIn };
};

/**
 * Verify a download JWT. Rejects expired, tampered, or wrong-type tokens.
 */
const verifyDownloadToken = (token) => {
  if (!token || typeof token !== 'string') {
    throw new UnauthorizedError('Download token is required.');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (decoded.type !== DOWNLOAD_TOKEN_TYPE) {
      throw new UnauthorizedError('Invalid download token.');
    }

    if (!decoded.fileId || !decoded.userId) {
      throw new UnauthorizedError('Invalid download token payload.');
    }

    return {
      fileId: String(decoded.fileId),
      userId: String(decoded.userId),
      versionId: decoded.versionId ? String(decoded.versionId) : null,
      purpose: decoded.purpose === 'preview' ? 'preview' : 'download',
      exp: decoded.exp,
    };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ForbiddenError('Download link has expired.');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Invalid or tampered download token.');
    }
    throw error;
  }
};

module.exports = {
  DOWNLOAD_TOKEN_TYPE,
  createDownloadToken,
  verifyDownloadToken,
};
