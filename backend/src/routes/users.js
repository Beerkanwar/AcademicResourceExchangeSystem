const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { ROLES } = require('../utils/constants');

// All user management routes require admin
router.use(auth, roleGuard(ROLES.ADMIN));

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);
router.post('/:id/reset-password', userController.resetPassword);

module.exports = router;
