const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const env = require('./config/env');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { auth } = require('./middleware/auth');
const uploadAccessGuard = require('./middleware/secureUpload');
const { ensureDir } = require('./utils/fileHelpers');

/**
 * Build the Express application (no DB connection / listen).
 * Used by both the production server entrypoint and integration tests.
 */
const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use('/api/', apiLimiter);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else if (env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }

  ensureDir(path.resolve(env.UPLOAD_DIR));

  app.use('/uploads', auth, uploadAccessGuard, express.static(path.resolve(env.UPLOAD_DIR)));
  app.use('/uploads', (req, res) => {
    res.status(404).json({ success: false, message: 'File not found' });
  });

  app.use('/api', routes);

  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  app.use(errorHandler);

  return app;
};

module.exports = createApp;
