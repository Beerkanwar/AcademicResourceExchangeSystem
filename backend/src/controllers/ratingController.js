const mongoose = require('mongoose');
const ApiResponse = require('../utils/apiResponse');
const Rating = require('../models/Rating');
const Resource = require('../models/Resource');
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} = require('../utils/apiError');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const parseStars = (value) => {
  const stars = Number(value);
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    throw new BadRequestError('Rating must be an integer between 1 and 5');
  }
  return stars;
};

/**
 * Recalculate and persist averageRating / totalRatings on the Resource.
 */
const recalculateResourceRating = async (resourceId) => {
  const [stats] = await Rating.aggregate([
    { $match: { resource: new mongoose.Types.ObjectId(resourceId) } },
    {
      $group: {
        _id: '$resource',
        averageRating: { $avg: '$stars' },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  const averageRating = stats
    ? Number(stats.averageRating.toFixed(1))
    : 0;
  const totalRatings = stats ? stats.totalRatings : 0;

  await Resource.findByIdAndUpdate(resourceId, {
    averageRating,
    totalRatings,
  });

  return { averageRating, totalRatings };
};

const ratingController = {
  /**
   * GET /api/ratings/resource/:resourceId
   * Returns ratings list, aggregates, and the current user's rating (if authenticated).
   */
  getForResource: async (req, res, next) => {
    try {
      const { resourceId } = req.params;

      if (!isValidObjectId(resourceId)) {
        throw new BadRequestError('Invalid resource ID');
      }

      const resource = await Resource.findOne({
        _id: resourceId,
        isDeleted: false,
      }).select('averageRating totalRatings');

      if (!resource) {
        throw new NotFoundError('Resource not found');
      }

      const ratings = await Rating.find({ resource: resourceId })
        .populate('user', 'name email role')
        .sort({ createdAt: -1 })
        .lean();

      let userRating = null;
      if (req.user) {
        userRating =
          ratings.find(
            (r) => r.user?._id?.toString() === req.user._id.toString()
          ) || null;
      }

      return ApiResponse.success(
        res,
        {
          ratings,
          averageRating: resource.averageRating,
          totalRatings: resource.totalRatings,
          userRating,
        },
        'Ratings retrieved'
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/ratings/resource/:resourceId
   * Create a rating (or conflict if the user already rated — use PUT to update).
   * Body: { stars: 1-5, comment?: string }
   */
  create: async (req, res, next) => {
    try {
      const { resourceId } = req.params;
      const userId = req.user._id;

      if (!isValidObjectId(resourceId)) {
        throw new BadRequestError('Invalid resource ID');
      }

      const stars = parseStars(req.body.stars);
      const comment =
        typeof req.body.comment === 'string' ? req.body.comment.trim() : '';

      if (comment.length > 500) {
        throw new BadRequestError('Comment cannot exceed 500 characters');
      }

      const resource = await Resource.findOne({
        _id: resourceId,
        isDeleted: false,
      });

      if (!resource) {
        throw new NotFoundError('Resource not found');
      }

      if (resource.status !== 'approved') {
        throw new BadRequestError('Only approved resources can be rated');
      }

      const existing = await Rating.findOne({
        user: userId,
        resource: resourceId,
      });

      if (existing) {
        throw new ConflictError(
          'You have already rated this resource. Update your existing rating instead.'
        );
      }

      const rating = await Rating.create({
        user: userId,
        resource: resourceId,
        stars,
        comment,
      });

      const aggregates = await recalculateResourceRating(resourceId);

      const populated = await Rating.findById(rating._id)
        .populate('user', 'name email role')
        .lean();

      return ApiResponse.created(
        res,
        { rating: populated, ...aggregates },
        'Rating submitted'
      );
    } catch (error) {
      if (error.code === 11000) {
        return next(
          new ConflictError(
            'You have already rated this resource. Update your existing rating instead.'
          )
        );
      }
      next(error);
    }
  },

  /**
   * PUT /api/ratings/:id
   * Update the authenticated user's own rating.
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        throw new BadRequestError('Invalid rating ID');
      }

      const rating = await Rating.findById(id);
      if (!rating) {
        throw new NotFoundError('Rating not found');
      }

      if (rating.user.toString() !== req.user._id.toString()) {
        throw new ForbiddenError('You can only update your own rating');
      }

      if (req.body.stars !== undefined) {
        rating.stars = parseStars(req.body.stars);
      }

      if (req.body.comment !== undefined) {
        if (typeof req.body.comment !== 'string') {
          throw new BadRequestError('Comment must be a string');
        }
        const comment = req.body.comment.trim();
        if (comment.length > 500) {
          throw new BadRequestError('Comment cannot exceed 500 characters');
        }
        rating.comment = comment;
      }

      await rating.save();

      const aggregates = await recalculateResourceRating(rating.resource);

      const populated = await Rating.findById(rating._id)
        .populate('user', 'name email role')
        .lean();

      return ApiResponse.success(
        res,
        { rating: populated, ...aggregates },
        'Rating updated'
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/ratings/:id
   * Delete the authenticated user's own rating.
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        throw new BadRequestError('Invalid rating ID');
      }

      const rating = await Rating.findById(id);
      if (!rating) {
        throw new NotFoundError('Rating not found');
      }

      if (rating.user.toString() !== req.user._id.toString()) {
        throw new ForbiddenError('You can only delete your own rating');
      }

      const resourceId = rating.resource;
      await Rating.deleteOne({ _id: rating._id });

      const aggregates = await recalculateResourceRating(resourceId);

      return ApiResponse.success(
        res,
        aggregates,
        'Rating removed'
      );
    } catch (error) {
      next(error);
    }
  },
};

module.exports = ratingController;
