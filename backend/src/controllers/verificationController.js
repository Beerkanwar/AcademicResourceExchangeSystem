const ApiResponse = require('../utils/apiResponse');
const ResourceService = require('../services/resourceService');
const { RESOURCE_STATUS } = require('../utils/constants');

const verificationController = {
  getPending: async (req, res, next) => {
    try {
      const result = await ResourceService.listResources({
        ...req.query,
        status: RESOURCE_STATUS.PENDING,
        showAll: true,
      });
      return ApiResponse.success(res, result, 'Pending resources retrieved');
    } catch (error) {
      next(error);
    }
  },

  approve: async (req, res, next) => {
    try {
      const resource = await ResourceService.verifyResource(
        req.params.id,
        'approve',
        req.user._id,
        req.user.role
      );
      return ApiResponse.success(res, resource, 'Resource approved successfully');
    } catch (error) {
      next(error);
    }
  },

  reject: async (req, res, next) => {
    try {
      const resource = await ResourceService.verifyResource(
        req.params.id,
        'reject',
        req.user._id,
        req.user.role,
        req.body.reason
      );
      return ApiResponse.success(res, resource, 'Resource rejected successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = verificationController;
