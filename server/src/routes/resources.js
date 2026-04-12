const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { auth, optionalAuth } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { ROLES } = require('../utils/constants');

// Public (with optional auth for personalization)
router.get('/', optionalAuth, resourceController.getAll);
router.get('/:id', optionalAuth, resourceController.getById);

// Authenticated
router.post('/', auth, uploadLimiter, resourceController.upload);
router.put('/:id', auth, resourceController.update);
router.delete('/:id', auth, resourceController.delete);
router.get('/:id/download', auth, resourceController.download);
router.get('/:id/preview', auth, resourceController.preview);
router.get('/user/my-uploads', auth, resourceController.getMyUploads);

module.exports = router;
