const ApiResponse = require('../utils/apiResponse');

const searchController = {
  search: async (req, res, next) => {
    try {
      return ApiResponse.success(res, [], 'Search resources — coming in Phase 7');
    } catch (error) {
      next(error);
    }
  },

  advancedSearch: async (req, res, next) => {
    try {
      return ApiResponse.success(res, [], 'Advanced search — coming in Phase 7');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = searchController;
