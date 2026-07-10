const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, roleGuard } = require('../middleware/auth');
const { ROLES } = require('../utils/constants');

// Apply admin guard to the entire router natively
router.use(auth, roleGuard(ROLES.ADMIN));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.put('/users/:id/role', adminController.updateRole);

// You can share the admin stats with Teachers optionally, but users/roles is strictly admin.
// Let's create an exception for stats if needed, but for now we'll just guard it all.

module.exports = router;
