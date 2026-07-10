const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, searchController.search);
router.post('/advanced', optionalAuth, searchController.advancedSearch);

module.exports = router;
