const dotenv = require('dotenv');
const path = require('path');

// Load .env from project root
dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') });

const logger = require('../utils/logger');

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI,
  DB_NAME: process.env.DB_NAME,
  JWT_SECRET: process.env.JWT_SECRET,
  /** @deprecated Prefer JWT_ACCESS_EXPIRES_IN; kept for backward compatibility */
  JWT_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '15m',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  /** Short-lived signed download URL TTL (default 5 minutes) */
  DOWNLOAD_SIGNED_URL_EXPIRES_IN: process.env.DOWNLOAD_SIGNED_URL_EXPIRES_IN || '5m',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE, 10) || 52428800, // 50MB
  ALLOWED_FILE_TYPES: (process.env.ALLOWED_FILE_TYPES || 'pdf,ppt,pptx,doc,docx,txt,zip,rar,xlsx,xls,csv,png,jpg,jpeg').split(','),
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@nitj.ac.in',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};

// Validate required variables (skipped in test — setupEnv provides them)
if (env.NODE_ENV !== 'test') {
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = required.filter((key) => !env[key]);

  if (missing.length > 0) {
    logger.error('Missing required environment variables', {
      missing,
      hint: 'Copy .env.example to .env and fill in the values.',
    });
    process.exit(1);
  }
}

module.exports = env;
