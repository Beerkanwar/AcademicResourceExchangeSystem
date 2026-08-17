const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/downloadController');
const { auth } = require('../middleware/auth');

// Authenticated: issue a short-lived signed download URL
router.get('/sign/:fileId', auth, downloadController.sign);

// Token-gated file stream (no Bearer required — identity is bound into the signature)
router.get('/file', downloadController.file);

module.exports = router;
