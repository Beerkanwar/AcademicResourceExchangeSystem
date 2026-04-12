const ApiResponse = require('../utils/apiResponse');

const resourceController = {
  getAll: async (req, res, next) => {
    try {
      return ApiResponse.success(res, [], 'Get all resources — coming in Phase 4');
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      return ApiResponse.success(res, null, 'Get resource by ID — coming in Phase 4');
    } catch (error) {
      next(error);
    }
  },

  upload: async (req, res, next) => {
    try {
      return ApiResponse.created(res, null, 'Upload resource — coming in Phase 4');
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      return ApiResponse.success(res, null, 'Update resource — coming in Phase 4');
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      return ApiResponse.success(res, null, 'Delete resource — coming in Phase 4');
    } catch (error) {
      next(error);
    }
  },

  download: async (req, res, next) => {
    try {
      return ApiResponse.success(res, null, 'Download resource — coming in Phase 6');
    } catch (error) {
      next(error);
    }
  },

  preview: async (req, res, next) => {
    try {
      return ApiResponse.success(res, null, 'Preview resource — coming in Phase 6');
    } catch (error) {
      next(error);
    }
  },

  getMyUploads: async (req, res, next) => {
    try {
      return ApiResponse.success(res, [], 'Get my uploads — coming in Phase 4');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = resourceController;
