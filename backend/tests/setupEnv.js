const path = require('path');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-nitj-resource-hub';
process.env.JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
process.env.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
process.env.JWT_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN;
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nitj-test-placeholder';
process.env.UPLOAD_DIR = path.join(
  __dirname,
  '..',
  `uploads-test-${process.env.JEST_WORKER_ID || '0'}`
);
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.MAX_FILE_SIZE = '52428800';
process.env.DOWNLOAD_SIGNED_URL_EXPIRES_IN =
  process.env.DOWNLOAD_SIGNED_URL_EXPIRES_IN || '5m';
