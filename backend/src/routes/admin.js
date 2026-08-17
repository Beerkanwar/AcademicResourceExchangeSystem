const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, roleGuard } = require('../middleware/auth');
const { ROLES } = require('../utils/constants');

// Teachers and admins moderate the verification queue
router.use(auth, roleGuard(ROLES.ADMIN, ROLES.TEACHER));

router.post('/resources/bulk-action', adminController.bulkResourceAction);

module.exports = router;
