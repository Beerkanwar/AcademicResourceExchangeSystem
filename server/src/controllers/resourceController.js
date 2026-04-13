const { validationResult, body } = require('express-validator');
const ResourceService = require('../services/resourceService');
const ApiResponse = require('../utils/apiResponse');
const { BadRequestError } = require('../utils/apiError');
const upload = require('../middleware/upload');
const { ROLES } = require('../utils/constants');

const resourceController = {
  /**
   * GET /api/resources
   */
  getAll: async (req, res, next) => {
    try {
      const isAdminOrTeacher = req.user && [ROLES.ADMIN, ROLES.TEACHER].includes(req.user.role);
      const result = await ResourceService.listResources({
        ...req.query,
        showAll: isAdminOrTeacher && req.query.showAll === 'true',
      });
      return ApiResponse.success(res, result, 'Resources retrieved');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/resources/:id
   */
  getById: async (req, res, next) => {
    try {
      const resource = await ResourceService.getById(req.params.id);
      return ApiResponse.success(res, resource, 'Resource retrieved');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/resources
   * Uses multer middleware for file upload
   */
  upload: [
    // Multer middleware — single file upload
    (req, res, next) => {
      upload.single('file')(req, res, (err) => {
        if (err) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new BadRequestError('File size exceeds the maximum limit'));
          }
          return next(err);
        }
        next();
      });
    },

    // Validation
    body('title').trim().notEmpty().withMessage('Title is required'),

    async (req, res, next) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          throw new BadRequestError('Validation failed', errors.array());
        }

        // Auto-approve for teachers and admins
        if ([ROLES.TEACHER, ROLES.ADMIN].includes(req.user.role)) {
          req.body._autoApprove = true;
        }

        const resource = await ResourceService.upload(req.file, req.body, req.user._id);
        return ApiResponse.created(res, resource, 'Resource uploaded successfully');
      } catch (error) {
        next(error);
      }
    },
  ],

  /**
   * PUT /api/resources/:id
   */
  update: [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim(),

    async (req, res, next) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          throw new BadRequestError('Validation failed', errors.array());
        }

        const resource = await ResourceService.updateResource(
          req.params.id,
          req.body,
          req.user._id.toString(),
          req.user.role
        );
        return ApiResponse.success(res, resource, 'Resource updated');
      } catch (error) {
        next(error);
      }
    },
  ],

  /**
   * DELETE /api/resources/:id
   */
  delete: async (req, res, next) => {
    try {
      const result = await ResourceService.deleteResource(
        req.params.id,
        req.user._id.toString(),
        req.user.role
      );
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/resources/:id/download
   */
  download: async (req, res, next) => {
    try {
      const { filePath, filename, mimeType } = await ResourceService.download(
        req.params.id,
        req.user._id
      );

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      return res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/resources/user/my-uploads
   */
  getMyUploads: async (req, res, next) => {
    try {
      const result = await ResourceService.getMyUploads(req.user._id, req.query);
      return ApiResponse.success(res, result, 'My uploads retrieved');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = resourceController;
