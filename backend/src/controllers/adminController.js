const User = require('../models/User');
const Resource = require('../models/Resource');
const Department = require('../models/Department');
const ApiResponse = require('../utils/apiResponse');
const { BadRequestError, NotFoundError } = require('../utils/apiError');
const { RESOURCE_STATUS, ROLES } = require('../utils/constants');

const adminController = {
  /**
   * GET /api/admin/stats
   * Global system metrics for administration
   */
  getStats: async (req, res, next) => {
    try {
      const [totalUsers, totalResources, pendingResources, totalDepartments] = await Promise.all([
        User.countDocuments({ isActive: true }),
        Resource.countDocuments({ isDeleted: false }),
        Resource.countDocuments({ status: RESOURCE_STATUS.PENDING, isDeleted: false }),
        Department.countDocuments({ isActive: true })
      ]);

      return ApiResponse.success(res, {
        totalUsers,
        totalResources,
        pendingResources,
        totalDepartments
      }, 'Admin stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/admin/users
   * Paginated user list for RBAC mapping
   */
  getUsers: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        User.find({ isDeleted: false })
          .select('-password')
          .populate('department', 'name code')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        User.countDocuments({ isDeleted: false })
      ]);

      return ApiResponse.success(res, {
        users,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) }
      }, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/admin/users/:id/role
   * Elevate user rights natively
   */
  updateRole: async (req, res, next) => {
    try {
      const { role } = req.body;
      if (!role || !Object.values(ROLES).includes(role)) {
        throw new BadRequestError('Invalid role specified');
      }

      const user = await User.findById(req.params.id);
      if (!user) throw new NotFoundError('User not found');

      if (user._id.toString() === req.user._id.toString()) {
        throw new BadRequestError('You cannot alter your own admin privileges natively');
      }

      user.role = role;
      await user.save();

      const updated = await User.findById(req.params.id).select('-password');
      return ApiResponse.success(res, updated, `User privilege elevated to ${role}`);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = adminController;
