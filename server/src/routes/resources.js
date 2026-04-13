const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { auth, optionalAuth } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');

// Specific routes MUST come before /:id to avoid being caught by param matching
router.get('/user/my-uploads', auth, resourceController.getMyUploads);

// Public (with optional auth for personalization)
router.get('/', optionalAuth, resourceController.getAll);

// Authenticated — upload
router.post('/', auth, uploadLimiter, resourceController.upload);

// Param routes
router.get('/:id', optionalAuth, resourceController.getById);
router.put('/:id', auth, resourceController.update);
router.delete('/:id', auth, resourceController.delete);
router.get('/:id/download', auth, resourceController.download);

module.exports = router;
