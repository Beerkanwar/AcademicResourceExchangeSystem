const { ApiError } = require('../utils/apiError');
const env = require('../config/env');
const logger = require('../utils/logger');

/**
 * Global error handling middleware
 * Catches all errors and returns structured JSON responses
 */
const errorHandler = (err, req, res, _next) => {
  const requestMeta = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id || req.user?._id,
  };

  if (err instanceof ApiError) {
    logger.warn(err.message, {
      ...requestMeta,
      statusCode: err.statusCode,
      errors: err.errors,
    });

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    logger.warn('Validation failed', { ...requestMeta, errors });
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    logger.warn('Duplicate key error', { ...requestMeta, field, value: err.keyValue[field] });
    return res.status(409).json({
      success: false,
      message: `Duplicate value for field: ${field}`,
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    logger.warn('Cast error', { ...requestMeta, path: err.path, value: err.value });
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    logger.warn('File too large', requestMeta);
    return res.status(413).json({
      success: false,
      message: 'File too large. Maximum size is 50MB.',
    });
  }

  // Unexpected / uncaught errors
  logger.error('Unhandled error', {
    ...requestMeta,
    error: err.message,
    stack: err.stack,
    name: err.name,
  });

  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    ...((env.NODE_ENV === 'development' || env.NODE_ENV === 'test') && {
      error: err.message,
      stack: err.stack,
    }),
  });
};

module.exports = errorHandler;
