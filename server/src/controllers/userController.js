const ApiResponse = require('../utils/apiResponse');

const userController = {
  getAll: async (req, res, next) => {
    try {
      return ApiResponse.success(res, [], 'Get all users — coming in Phase 3');
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      return ApiResponse.success(res, null, 'Get user by ID — coming in Phase 3');
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      return ApiResponse.created(res, null, 'Create user — coming in Phase 3');
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      return ApiResponse.success(res, null, 'Update user — coming in Phase 3');
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      return ApiResponse.success(res, null, 'Delete user — coming in Phase 3');
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async (req, res, next) => {
    try {
      return ApiResponse.success(res, null, 'Reset password — coming in Phase 3');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
