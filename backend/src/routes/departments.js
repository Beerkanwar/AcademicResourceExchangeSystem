const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { auth, roleGuard } = require('../middleware/auth');
const { ROLES } = require('../utils/constants');

// Public
router.get('/', departmentController.getAll);
router.get('/:id', departmentController.getById);

// Admin only
router.post('/', auth, roleGuard(ROLES.ADMIN), departmentController.create);
router.put('/:id', auth, roleGuard(ROLES.ADMIN), departmentController.update);

module.exports = router;
