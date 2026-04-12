const ApiResponse = require('../utils/apiResponse');

const bookmarkController = {
  getMyBookmarks: async (req, res, next) => {
    try {
      return ApiResponse.success(res, [], 'Get bookmarks — coming in Phase 8');
    } catch (error) {
      next(error);
    }
  },

  toggle: async (req, res, next) => {
    try {
      return ApiResponse.success(res, null, 'Toggle bookmark — coming in Phase 8');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = bookmarkController;
