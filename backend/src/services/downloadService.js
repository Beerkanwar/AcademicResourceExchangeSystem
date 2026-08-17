const mongoose = require('mongoose');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { createDownloadToken, verifyDownloadToken } = require('../utils/downloadSigner');
const { loadAuthorizedResourceFile } = require('./resourceAccess');
const { AUDIT_ACTIONS } = require('../utils/constants');
const { UnauthorizedError, BadRequestError } = require('../utils/apiError');

const VALID_PURPOSES = new Set(['download', 'preview']);

class DownloadService {
  /**
   * Authenticated: verify access, then issue a time-limited signed download URL.
   */
  static async createSignedUrl({
    fileId,
    user,
    versionId = null,
    purpose = 'download',
  }) {
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      throw new BadRequestError('Invalid file ID');
    }

    const normalizedPurpose = VALID_PURPOSES.has(purpose) ? purpose : 'download';

    await loadAuthorizedResourceFile({
      fileId,
      user,
      versionId: versionId || null,
    });

    const { token, expiresAt, expiresIn } = createDownloadToken({
      fileId,
      userId: user._id,
      versionId: versionId || null,
      purpose: normalizedPurpose,
    });

    const url = `/api/downloads/file?token=${encodeURIComponent(token)}`;

    return {
      token,
      url,
      expiresAt,
      expiresIn,
      fileId: String(fileId),
      versionId: versionId ? String(versionId) : null,
      purpose: normalizedPurpose,
    };
  }

  /**
   * Validate signature/expiry, re-check permissions, return file stream metadata.
   * Records audit + download count for purpose=download only.
   */
  static async executeDownload({ token, ipAddress = '' }) {
    const claims = verifyDownloadToken(token);

    const user = await User.findById(claims.userId).select('-password');
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Download token user is no longer valid.');
    }

    const { resource, filePath, filename, mimeType, version } =
      await loadAuthorizedResourceFile({
        fileId: claims.fileId,
        user,
        versionId: claims.versionId,
      });

    if (claims.purpose === 'download') {
      resource.downloads += 1;
      await resource.save();

      await AuditLog.create({
        actor: user._id,
        action: AUDIT_ACTIONS.RESOURCE_DOWNLOADED,
        targetType: 'Resource',
        targetId: resource._id,
        details: {
          purpose: claims.purpose,
          version,
          versionId: claims.versionId || undefined,
        },
        ipAddress: ipAddress || '',
      });
    }

    return {
      filePath,
      filename,
      mimeType,
      fileId: resource._id.toString(),
      userId: user._id.toString(),
      purpose: claims.purpose,
    };
  }
}

module.exports = DownloadService;
