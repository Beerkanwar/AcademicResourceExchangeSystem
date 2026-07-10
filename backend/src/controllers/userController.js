const { validationResult, body, query } = require('express-validator');
const UserService = require('../services/userService');
const ApiResponse = require('../utils/apiResponse');
const { BadRequestError } = require('../utils/apiError');

const userController = {
  /**
   * GET /api/users
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
   * DELETE /api/users/:id (toggle active status)
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
