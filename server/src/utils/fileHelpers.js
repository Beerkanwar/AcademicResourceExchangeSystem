const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Generate SHA-256 hash from file buffer
 */
const generateFileHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

/**
 * Generate SHA-256 hash from file path
 */
const generateFileHashFromPath = async (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
};

/**
 * Sanitize filename to prevent path traversal and special characters
 */
const sanitizeFilename = (filename) => {
  // Remove path traversal characters
  let sanitized = filename.replace(/[/\\:*?"<>|]/g, '_');
  // Remove leading dots (hidden files)
  sanitized = sanitized.replace(/^\.+/, '');
  // Limit length
  if (sanitized.length > 200) {
    const ext = path.extname(sanitized);
    sanitized = sanitized.substring(0, 200 - ext.length) + ext;
  }
  return sanitized;
};

/**
 * Get file extension from filename
 */
const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase().replace('.', '');
};

/**
 * Create directory if it doesn't exist
 */
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Generate organized upload path: uploads/<department>/<semester>/<year>/
 */
const generateUploadPath = (baseDir, department, semester, academicYear) => {
  const uploadPath = path.join(
    baseDir,
    department || 'general',
    `semester-${semester || 'misc'}`,
    academicYear || 'unknown'
  );
  ensureDir(uploadPath);
  return uploadPath;
};

/**
 * Get file size in human readable format
 */
const formatFileSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

module.exports = {
  generateFileHash,
  generateFileHashFromPath,
  sanitizeFilename,
  getFileExtension,
  ensureDir,
  generateUploadPath,
  formatFileSize,
};
