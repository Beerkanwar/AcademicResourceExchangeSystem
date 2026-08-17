const path = require('path');
const fs = require('fs');
const Resource = require('../models/Resource');
const env = require('../config/env');
const { ForbiddenError, NotFoundError } = require('../utils/apiError');
const { ROLES, RESOURCE_STATUS } = require('../utils/constants');

/**
 * Resolve absolute file path from a resource document for the requested basename.
 */
const resolveUploadFilePath = (resource, requested) => {
  if (resource.storedFilename === requested) {
    return resource.filePath;
  }
  const version = (resource.versions || []).find(
    (v) => v.storedFilename === requested
  );
  return version?.filePath || null;
};

/**
 * Ensure a resolved path stays inside UPLOAD_DIR (no traversal).
 */
const isInsideUploadDir = (filePath) => {
  const uploadRoot = path.resolve(env.UPLOAD_DIR);
  const resolved = path.resolve(filePath);
  const relative = path.relative(uploadRoot, resolved);
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
};

/**
 * Guards /uploads file access after authentication.
 * - Approved (not deleted): any authenticated user
 * - Pending / rejected: uploader, teacher, or admin
 * - Soft-deleted: teacher or admin only
 *
 * Attaches `req.uploadFilePath` so nested storage layouts still serve correctly.
 */
const uploadAccessGuard = async (req, res, next) => {
  try {
    const requested = path.basename(decodeURIComponent(req.path));

    if (!requested || requested === '.' || requested === '..') {
      throw new NotFoundError('File not found');
    }

    // Prevent path traversal via encoded segments before basename
    if (req.path.includes('..')) {
      throw new ForbiddenError('Invalid file path');
    }

    const resource = await Resource.findOne({
      $or: [
        { storedFilename: requested },
        { 'versions.storedFilename': requested },
      ],
    }).select('status isDeleted uploadedBy filePath storedFilename versions');

    if (!resource) {
      throw new NotFoundError('File not found');
    }

    const filePath = resolveUploadFilePath(resource, requested);
    if (!filePath || !isInsideUploadDir(filePath) || !fs.existsSync(path.resolve(filePath))) {
      throw new NotFoundError('File not found');
    }

    const userId = req.user._id.toString();
    const isOwner = resource.uploadedBy.toString() === userId;
    const isPrivileged =
      req.user.role === ROLES.ADMIN || req.user.role === ROLES.TEACHER;

    if (resource.isDeleted) {
      if (!isPrivileged) {
        throw new ForbiddenError('This file is no longer available.');
      }
      req.uploadFilePath = path.resolve(filePath);
      return next();
    }

    if (
      resource.status === RESOURCE_STATUS.PENDING ||
      resource.status === RESOURCE_STATUS.REJECTED
    ) {
      if (!isPrivileged && !isOwner) {
        throw new ForbiddenError(
          'You do not have permission to access this file.'
        );
      }
      req.uploadFilePath = path.resolve(filePath);
      return next();
    }

    // Approved resources: any authenticated user
    if (resource.status !== RESOURCE_STATUS.APPROVED) {
      throw new ForbiddenError('You do not have permission to access this file.');
    }

    req.uploadFilePath = path.resolve(filePath);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = uploadAccessGuard;
