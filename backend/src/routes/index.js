const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users');
const resourceRoutes = require('./resources');
const downloadRoutes = require('./downloads');
const departmentRoutes = require('./departments');
const subjectRoutes = require('./subjects');
const verificationRoutes = require('./verification');
const bookmarkRoutes = require('./bookmarks');
const ratingRoutes = require('./ratings');
const auditRoutes = require('./audit');
const adminRoutes = require('./admin');

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'NITJ Resource Exchange API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/resources', resourceRoutes);
router.use('/downloads', downloadRoutes);
router.use('/departments', departmentRoutes);
router.use('/subjects', subjectRoutes);
router.use('/verification', verificationRoutes);
router.use('/bookmarks', bookmarkRoutes);
router.use('/ratings', ratingRoutes);
router.use('/audit', auditRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
