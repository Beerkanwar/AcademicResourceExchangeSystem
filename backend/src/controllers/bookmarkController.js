const ApiResponse = require('../utils/apiResponse');
const Bookmark = require('../models/Bookmark');
const Resource = require('../models/Resource');

const bookmarkController = {
  getMyBookmarks: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 12;
      const skip = (page - 1) * limit;

      const [bookmarks, total] = await Promise.all([
        Bookmark.find({ user: req.user.id })
          .populate({
            path: 'resource',
            populate: [
              { path: 'department', select: 'name code' },
              { path: 'subject', select: 'name code' },
            ],
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Bookmark.countDocuments({ user: req.user.id }),
      ]);

      // Extract populated resources
      const resources = bookmarks.map((b) => b.resource).filter(Boolean);

      return ApiResponse.paginated(res, resources, {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }, 'Bookmarks retrieved');
    } catch (error) {
      next(error);
    }
  },

  check: async (req, res, next) => {
    try {
      const resourceId = req.params.resourceId;
      const userId = req.user.id;
      const existingBookmark = await Bookmark.findOne({ user: userId, resource: resourceId });
      return ApiResponse.success(res, { bookmarked: !!existingBookmark }, 'Bookmark status retrieved');
    } catch (error) {
      next(error);
    }
  },

  toggle: async (req, res, next) => {
    try {
      const resourceId = req.params.resourceId;
      const userId = req.user.id;

      // Verify resource exists
      const resource = await Resource.findById(resourceId);
      if (!resource) {
        return ApiResponse.error(res, 'Resource not found', 404);
      }

      const existingBookmark = await Bookmark.findOne({ user: userId, resource: resourceId });

      if (existingBookmark) {
        await Bookmark.deleteOne({ _id: existingBookmark._id });
        return ApiResponse.success(res, { bookmarked: false }, 'Bookmark removed');
      } else {
        await Bookmark.create({ user: userId, resource: resourceId });
        return ApiResponse.created(res, { bookmarked: true }, 'Bookmark added');
      }
    } catch (error) {
      next(error);
    }
  },
};

module.exports = bookmarkController;

