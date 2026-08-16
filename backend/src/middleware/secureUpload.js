const path = require('path');
const Resource = require('../models/Resource');
const { ForbiddenError, NotFoundError } = require('../utils/apiError');
const { ROLES, RESOURCE_STATUS } = require('../utils/constants');

/**
 * Guards /uploads file access after authentication.
 * - Approved (not deleted): any authenticated user
 * - Pending / rejected: uploader, teacher, or admin
 * - Soft-deleted: teacher or admin only
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
    }).select('status isDeleted uploadedBy');

    if (!resource) {
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
      return next();
    }

    // Approved resources: any authenticated user
    if (resource.status !== RESOURCE_STATUS.APPROVED) {
      throw new ForbiddenError('You do not have permission to access this file.');
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = uploadAccessGuard;
