const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { auth } = require('../middleware/auth');

router.get('/resource/:resourceId', ratingController.getForResource);
router.post('/resource/:resourceId', auth, ratingController.create);
router.put('/:id', auth, ratingController.update);
router.delete('/:id', auth, ratingController.delete);

module.exports = router;
