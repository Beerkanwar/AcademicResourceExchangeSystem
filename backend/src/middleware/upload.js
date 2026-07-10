const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const env = require('../config/env');
const { sanitizeFilename } = require('../utils/fileHelpers');
const { BadRequestError } = require('../utils/apiError');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.resolve(env.UPLOAD_DIR);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const sanitized = sanitizeFilename(file.originalname);
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    const ext = path.extname(sanitized);
    const name = path.basename(sanitized, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  if (env.ALLOWED_FILE_TYPES.includes(ext)) {
    cb(null, true);
  } else {
    cb(new BadRequestError(`File type .${ext} is not allowed. Allowed types: ${env.ALLOWED_FILE_TYPES.join(', ')}`), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE,
  },
});

module.exports = upload;
