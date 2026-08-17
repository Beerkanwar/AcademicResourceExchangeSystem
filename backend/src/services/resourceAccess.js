const path = require('path');
const fs = require('fs');
const Resource = require('../models/Resource');
const env = require('../config/env');
const { ForbiddenError, NotFoundError } = require('../utils/apiError');
const { ROLES, RESOURCE_STATUS } = require('../utils/constants');
const { isInsideUploadDir } = require('../utils/fileHelpers');

/**
 * Resolve which on-disk file a resource request should serve.
 */
const resolveResourceFile = (resource, versionId = null) => {
  if (versionId) {
    const versionDoc = (resource.versions || []).find(
      (v) => v._id.toString() === String(versionId)
    );
    if (!versionDoc) {
      throw new NotFoundError('Specific version archive not found');
    }
    return {
      filePath: versionDoc.filePath,
      filename: versionDoc.originalFilename,
      mimeType: versionDoc.mimeType,
      version: versionDoc.version,
    };
  }

  return {
    filePath: resource.filePath,
    filename: resource.originalFilename,
    mimeType: resource.mimeType,
    version: resource.currentVersion,
  };
};

/**
 * Whether the given user may access this resource file.
 * - Approved (not deleted): any authenticated user
 * - Pending / rejected: uploader, teacher, or admin
 * - Soft-deleted: teacher or admin only
 */
const assertResourceFileAccess = (resource, user) => {
  if (!user?._id) {
    throw new ForbiddenError('You do not have permission to access this file.');
  }

  const userId = user._id.toString();
  const isOwner = resource.uploadedBy.toString() === userId;
  const isPrivileged = user.role === ROLES.ADMIN || user.role === ROLES.TEACHER;

  if (resource.isDeleted) {
    if (!isPrivileged) {
      throw new ForbiddenError('This file is no longer available.');
    }
    return;
  }

  if (
    resource.status === RESOURCE_STATUS.PENDING ||
    resource.status === RESOURCE_STATUS.REJECTED
  ) {
    if (!isPrivileged && !isOwner) {
      throw new ForbiddenError('You do not have permission to access this file.');
    }
    return;
  }

  if (resource.status !== RESOURCE_STATUS.APPROVED) {
    throw new ForbiddenError('You do not have permission to access this file.');
  }
};

/**
 * Load a resource and validate the caller may access its file (or a version).
 * Returns the resource plus resolved file metadata.
 */
const loadAuthorizedResourceFile = async ({ fileId, user, versionId = null }) => {
  const resource = await Resource.findById(fileId).select(
    'status isDeleted uploadedBy filePath originalFilename mimeType storedFilename currentVersion versions downloads'
  );

  if (!resource) {
    throw new NotFoundError('Resource not found');
  }

  assertResourceFileAccess(resource, user);

  const fileMeta = resolveResourceFile(resource, versionId);
  const absolutePath = path.resolve(fileMeta.filePath);

  if (!isInsideUploadDir(absolutePath, env.UPLOAD_DIR) || !fs.existsSync(absolutePath)) {
    throw new NotFoundError('File not found on disk');
  }

  return {
    resource,
    filePath: absolutePath,
    filename: fileMeta.filename,
    mimeType: fileMeta.mimeType,
    version: fileMeta.version,
  };
};

module.exports = {
  resolveResourceFile,
  assertResourceFileAccess,
  loadAuthorizedResourceFile,
};
