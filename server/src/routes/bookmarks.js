const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', bookmarkController.getMyBookmarks);
router.get('/:resourceId/status', bookmarkController.check);
router.post('/:resourceId', bookmarkController.toggle);

module.exports = router;
