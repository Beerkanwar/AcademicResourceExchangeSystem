const { validationResult, body } = require('express-validator');
const AuthService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');
const { BadRequestError } = require('../utils/apiError');

const authController = {
  /**
   * POST /api/auth/login
   * Authenticate user and return JWT token
   */
  login: [
    // Validation rules
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),

    async (req, res, next) => {
      try {
        // Check validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          throw new BadRequestError('Validation failed', errors.array());
        }

        const { email, password } = req.body;
        const ipAddress = req.ip || req.connection?.remoteAddress || '';

        const result = await AuthService.login(email, password, ipAddress);

        return ApiResponse.success(res, result, 'Login successful');
      } catch (error) {
        next(error);
      }
    },
  ],

  /**
   * POST /api/auth/change-password
   * Change authenticated user's password
   */
  changePassword: [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
    body('confirmPassword')
      .notEmpty()
      .withMessage('Password confirmation is required'),

    async (req, res, next) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          throw new BadRequestError('Validation failed', errors.array());
        }

        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) {
          throw new BadRequestError('New password and confirmation do not match');
        }

        const result = await AuthService.changePassword(
          req.user._id,
          currentPassword,
          newPassword
        );

        return ApiResponse.success(res, null, result.message);
      } catch (error) {
        next(error);
      }
    },
  ],

  /**
   * GET /api/auth/profile
   * Get authenticated user's profile
   */
  getProfile: async (req, res, next) => {
    try {
      const profile = await AuthService.getProfile(req.user._id);
      return ApiResponse.success(res, profile, 'Profile retrieved');
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/auth/profile
   * Update authenticated user's profile
   */
  updateProfile: [
    body('firstName').optional().trim().isLength({ max: 50 }),
    body('lastName').optional().trim().isLength({ max: 50 }),
    body('phone').optional().trim(),

    async (req, res, next) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          throw new BadRequestError('Validation failed', errors.array());
        }

        const updatedProfile = await AuthService.updateProfile(req.user._id, req.body);
        return ApiResponse.success(res, updatedProfile, 'Profile updated');
      } catch (error) {
        next(error);
      }
    },
  ],
};

module.exports = authController;
