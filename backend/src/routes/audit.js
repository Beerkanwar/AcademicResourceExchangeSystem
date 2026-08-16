const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { auth, roleGuard } = require('../middleware/auth');
const { ROLES } = require('../utils/constants');

// Admin only
router.use(auth, roleGuard(ROLES.ADMIN));

router.get('/', auditController.getAll);

module.exports = router;
