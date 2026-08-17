const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, optionalAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/login', authLimiter, authController.login);
router.post('/refresh', authLimiter, authController.refresh);
router.post('/logout', optionalAuth, authController.logout);
router.post('/change-password', auth, authController.changePassword);
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);

module.exports = router;
