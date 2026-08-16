const { validationResult, body, query } = require('express-validator');
const User = require('../models/User');
const Resource = require('../models/Resource');
const Department = require('../models/Department');
const UserService = require('../services/userService');
const ApiResponse = require('../utils/apiResponse');
const { BadRequestError } = require('../utils/apiError');
const { RESOURCE_STATUS } = require('../utils/constants');

const userController = {
  /**
   * GET /api/users/stats
   * Returns aggregate counts for the admin/teacher dashboard
   * (active users, resources, pending verifications, departments).
   */
  getStats: async (req, res, next) => {
    try {
      const [totalUsers, totalResources, pendingResources, totalDepartments] = await Promise.all([
        User.countDocuments({ isActive: true }),
        Resource.countDocuments({ isDeleted: false }),
        Resource.countDocuments({ status: RESOURCE_STATUS.PENDING, isDeleted: false }),
        Department.countDocuments({ isActive: true }),
      ]);

      return ApiResponse.success(res, {
        totalUsers,
        totalResources,
        pendingResources,
        totalDepartments,
      }, 'Admin stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/users
   * Paginated, filterable user list for administration.
   */
  getAll: [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('role').optional().isIn(['student', 'teacher', 'admin']),

    async (req, res, next) => {
      try {
        const result = await UserService.listUsers(req.query);
        return ApiResponse.success(res, result, 'Users retrieved');
      } catch (error) {
        next(error);
      }
    },
  ],

  /**
   * GET /api/users/:id
   * Fetch a single user by ID.
   */
  getById: async (req, res, next) => {
    try {
      const user = await UserService.getUserById(req.params.id);
      return ApiResponse.success(res, user, 'User retrieved');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/users
   * Create a user account (admin only). Default password is derived
   * from roll number for students, or a fixed default for other roles.
   */
  create: [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('role').isIn(['student', 'teacher', 'admin']).withMessage('Valid role is required'),
    body('firstName').optional().trim().isLength({ max: 50 }),
    body('lastName').optional().trim().isLength({ max: 50 }),
    body('rollNumber').optional().trim(),
    body('department').optional().isMongoId(),

    async (req, res, next) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          throw new BadRequestError('Validation failed', errors.array());
        }

        const user = await UserService.createUser(req.body, req.user._id);
        return ApiResponse.created(res, user, 'User created successfully');
      } catch (error) {
        next(error);
      }
    },
  ],

  /**
   * PUT /api/users/:id
   * Update user profile fields and role assignments.
   * Admins cannot change their own role via this endpoint.
   */
  update: [
    body('firstName').optional().trim().isLength({ max: 50 }),
    body('lastName').optional().trim().isLength({ max: 50 }),
    body('role').optional().isIn(['student', 'teacher', 'admin']),
    body('isActive').optional().isBoolean(),
    body('department').optional().isMongoId(),

    async (req, res, next) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          throw new BadRequestError('Validation failed', errors.array());
        }

        const user = await UserService.updateUser(req.params.id, req.body, req.user._id);
        return ApiResponse.success(res, user, 'User updated');
      } catch (error) {
        next(error);
      }
    },
  ],

  /**
   * DELETE /api/users/:id
   * Toggle the user's active status (soft deactivate / reactivate).
   */
  delete: async (req, res, next) => {
    try {
      const user = await UserService.toggleUserStatus(req.params.id, req.user._id);
      const status = user.isActive ? 'activated' : 'deactivated';
      return ApiResponse.success(res, user, `User ${status}`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/users/:id/reset-password
   * Reset a user's password to the system default and require a change on next login.
   */
  resetPassword: async (req, res, next) => {
    try {
      const result = await UserService.resetPassword(req.params.id, req.user._id);
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
