const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const { auth } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { ROLES } = require('../utils/constants');

// Teacher and Admin can verify
router.use(auth, roleGuard(ROLES.ADMIN, ROLES.TEACHER));

router.get('/pending', verificationController.getPending);
router.post('/:id/approve', verificationController.approve);
router.post('/:id/reject', verificationController.reject);

module.exports = router;
