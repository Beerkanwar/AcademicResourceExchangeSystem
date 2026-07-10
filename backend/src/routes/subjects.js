const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const { auth } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { ROLES } = require('../utils/constants');

// Public
router.get('/', subjectController.getAll);
router.get('/:id', subjectController.getById);

// Admin only
router.post('/', auth, roleGuard(ROLES.ADMIN), subjectController.create);
router.put('/:id', auth, roleGuard(ROLES.ADMIN), subjectController.update);

module.exports = router;
