const ApiResponse = require('../utils/apiResponse');
const ResourceService = require('../services/resourceService');
const { BadRequestError } = require('../utils/apiError');

const adminController = {
  /**
   * POST /api/admin/resources/bulk-action
   * Body: { resourceIds: string[], action: 'approve'|'reject', reason?: string }
   */
  bulkResourceAction: async (req, res, next) => {
    try {
      const { resourceIds, action, reason } = req.body || {};

      if (!action || !['approve', 'reject'].includes(action)) {
        throw new BadRequestError("action must be 'approve' or 'reject'");
      }

      const result = await ResourceService.bulkVerifyResources(
        resourceIds,
        action,
        req.user._id,
        req.user.role,
        reason
      );

      const message =
        result.failedCount === 0
          ? `Bulk ${action} completed for ${result.succeededCount} resource(s)`
          : `Bulk ${action} completed with ${result.succeededCount} succeeded and ${result.failedCount} failed`;

      return ApiResponse.success(res, result, message);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = adminController;
