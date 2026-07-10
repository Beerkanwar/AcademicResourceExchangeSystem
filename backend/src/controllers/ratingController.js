const ApiResponse = require('../utils/apiResponse');

const ratingController = {
  getForResource: async (req, res, next) => {
    try {
      return ApiResponse.success(res, [], 'Get ratings — coming in Phase 8');
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      return ApiResponse.created(res, null, 'Create rating — coming in Phase 8');
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      return ApiResponse.success(res, null, 'Update rating — coming in Phase 8');
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      return ApiResponse.success(res, null, 'Delete rating — coming in Phase 8');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = ratingController;
