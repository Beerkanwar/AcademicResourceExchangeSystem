const ApiResponse = require('../utils/apiResponse');

const verificationController = {
  getPending: async (req, res, next) => {
    try {
      return ApiResponse.success(res, [], 'Get pending resources — coming in Phase 5');
    } catch (error) {
      next(error);
    }
  },

  approve: async (req, res, next) => {
    try {
      return ApiResponse.success(res, null, 'Approve resource — coming in Phase 5');
    } catch (error) {
      next(error);
    }
  },

  reject: async (req, res, next) => {
    try {
      return ApiResponse.success(res, null, 'Reject resource — coming in Phase 5');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = verificationController;
