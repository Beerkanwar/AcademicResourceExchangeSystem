const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const env = require('../config/env');
const { sanitizeFilename } = require('../utils/fileHelpers');
const { BadRequestError } = require('../utils/apiError');
const { MIME_TYPE_MAP } = require('../utils/constants');

// Extensions that lack reliable magic numbers (validated via content sniffing)
const TEXT_BASED_EXTENSIONS = new Set(['txt', 'csv']);

const EXTENSION_ALIASES = {
  jpeg: 'jpg',
};

const normalizeExtension = (ext) => {
  const cleaned = String(ext || '')
    .toLowerCase()
    .replace(/^\./, '');
  return EXTENSION_ALIASES[cleaned] || cleaned;
};

const removeUploadedFile = (file) => {
  if (file?.path && fs.existsSync(file.path)) {
    try {
      fs.unlinkSync(file.path);
    } catch {
      // Best-effort cleanup of rejected uploads
    }
  }
};

/**
 * Heuristic for text/csv/txt when magic-number detection returns nothing.
 * Rejects buffers that look binary (null bytes).
 */
const isLikelyTextContent = (buffer) => {
  if (!buffer || buffer.length === 0) return true;
  for (let i = 0; i < buffer.length; i += 1) {
    if (buffer[i] === 0) return false;
  }
  return true;
};

/**
 * Detect real MIME type from file magic numbers (not client headers / extension).
 */
const detectActualMimeType = async (filePath, claimedExt) => {
  const { fileTypeFromFile } = await import('file-type');
  const detected = await fileTypeFromFile(filePath);

  if (detected?.mime) {
    return detected.mime;
  }

  // txt/csv have no magic numbers — allow only after a basic text check
  if (TEXT_BASED_EXTENSIONS.has(claimedExt)) {
    const fd = fs.openSync(filePath, 'r');
    try {
      const sample = Buffer.alloc(4100);
      const bytesRead = fs.readSync(fd, sample, 0, 4100, 0);
      if (!isLikelyTextContent(sample.subarray(0, bytesRead))) {
        return null;
      }
    } finally {
      fs.closeSync(fd);
    }
    return claimedExt === 'csv' ? 'text/csv' : 'text/plain';
  }

  return null;
};

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

// Preliminary extension filter (still required; magic-byte check follows)
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  if (env.ALLOWED_FILE_TYPES.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        `File type .${ext} is not allowed. Allowed types: ${env.ALLOWED_FILE_TYPES.join(', ')}`
      ),
      false
    );
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

/**
 * Cross-check the uploaded file's actual MIME type (magic numbers) against MIME_TYPE_MAP.
 * Must run after multer has written the file to disk.
 */
const validateMimeType = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const claimedExt = normalizeExtension(path.extname(req.file.originalname));
    const actualMime = await detectActualMimeType(req.file.path, claimedExt);

    if (!actualMime) {
      removeUploadedFile(req.file);
      throw new BadRequestError(
        'Unable to determine file type from content. The file may be corrupted or spoofed.'
      );
    }

    const mappedExt = MIME_TYPE_MAP[actualMime];
    if (!mappedExt) {
      removeUploadedFile(req.file);
      throw new BadRequestError(
        `File MIME type "${actualMime}" is not allowed.`
      );
    }

    const normalizedMappedExt = normalizeExtension(mappedExt);
    if (normalizedMappedExt !== claimedExt) {
      removeUploadedFile(req.file);
      throw new BadRequestError(
        `File content type (${actualMime}) does not match the .${claimedExt} extension.`
      );
    }

    // Prefer detected MIME over client-supplied header
    req.file.mimetype = actualMime;
    return next();
  } catch (error) {
    if (!(error instanceof BadRequestError)) {
      removeUploadedFile(req.file);
    }
    return next(error);
  }
};

module.exports = upload;
module.exports.validateMimeType = validateMimeType;
