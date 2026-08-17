const Notification = require('../models/Notification');
const { RESOURCE_STATUS } = require('../utils/constants');
const logger = require('../utils/logger');

class NotificationService {
  /**
   * Create an in-app notification when a resource is approved or rejected.
   * Failures are logged and swallowed so verification is never blocked.
   */
  static async notifyResourceVerification(resource, action) {
    if (!resource?.uploadedBy) {
      logger.warn('Skipping verification notification: missing uploader', {
        resourceId: resource?._id,
      });
      return null;
    }

    const isApproved = action === 'approve' || resource.status === RESOURCE_STATUS.APPROVED;
    const type = isApproved ? 'resource_approved' : 'resource_rejected';
    const title = resource.title || 'your resource';

    const message = isApproved
      ? `Your resource "${title}" has been approved and is now available in the repository.`
      : `Your resource "${title}" was rejected${
          resource.rejectionReason ? `: ${resource.rejectionReason}` : '.'
        }`;

    try {
      const notification = await Notification.create({
        user: resource.uploadedBy,
        message,
        type,
        link: `/resources/${resource._id}`,
        read: false,
      });

      logger.info('Verification notification created', {
        notificationId: notification._id,
        userId: resource.uploadedBy,
        resourceId: resource._id,
        type,
      });

      return notification;
    } catch (err) {
      logger.error('Failed to create verification notification', {
        error: err.message,
        resourceId: resource._id,
        userId: resource.uploadedBy,
      });
      return null;
    }
  }

  /**
   * Bulk-create verification notifications with a single insertMany.
   */
  static async notifyResourceVerificationBulk(resources, action) {
    if (!Array.isArray(resources) || resources.length === 0) {
      return [];
    }

    const isApproved = action === 'approve';
    const type = isApproved ? 'resource_approved' : 'resource_rejected';

    const docs = [];
    for (const resource of resources) {
      if (!resource?.uploadedBy) {
        logger.warn('Skipping verification notification: missing uploader', {
          resourceId: resource?._id,
        });
        continue;
      }

      const title = resource.title || 'your resource';
      const message = isApproved
        ? `Your resource "${title}" has been approved and is now available in the repository.`
        : `Your resource "${title}" was rejected${
            resource.rejectionReason ? `: ${resource.rejectionReason}` : '.'
          }`;

      docs.push({
        user: resource.uploadedBy,
        message,
        type,
        link: `/resources/${resource._id}`,
        read: false,
      });
    }

    if (docs.length === 0) {
      return [];
    }

    try {
      const created = await Notification.insertMany(docs, { ordered: false });
      logger.info('Bulk verification notifications created', {
        count: created.length,
        type,
      });
      return created;
    } catch (err) {
      logger.error('Failed to create bulk verification notifications', {
        error: err.message,
        attempted: docs.length,
      });
      return [];
    }
  }
}

module.exports = NotificationService;
