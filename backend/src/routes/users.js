const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, roleGuard } = require('../middleware/auth');
const { ROLES } = require('../utils/constants');

/**
 * Dashboard metrics — accessible to admins and teachers.
 * Mounted before the admin-only guard so teachers can load overview stats.
 */
router.get('/stats', auth, roleGuard(ROLES.ADMIN, ROLES.TEACHER), userController.getStats);

/**
 * Remaining routes require an authenticated admin.
 * Covers user listing, CRUD, and password reset.
 */
router.use(auth, roleGuard(ROLES.ADMIN));

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);
router.post('/:id/reset-password', userController.resetPassword);

module.exports = router;
