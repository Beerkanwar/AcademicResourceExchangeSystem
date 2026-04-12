// Application-wide constants

const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
};

const RESOURCE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const ALLOWED_FILE_TYPES = [
  'pdf', 'ppt', 'pptx', 'doc', 'docx', 'txt',
  'zip', 'rar', 'xlsx', 'xls', 'csv',
  'png', 'jpg', 'jpeg',
];

const MIME_TYPE_MAP = {
  'application/pdf': 'pdf',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
  'application/zip': 'zip',
  'application/x-rar-compressed': 'rar',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'text/csv': 'csv',
  'image/png': 'png',
  'image/jpeg': 'jpg',
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const AUDIT_ACTIONS = {
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  USER_ACTIVATED: 'user_activated',
  USER_DEACTIVATED: 'user_deactivated',
  PASSWORD_CHANGED: 'password_changed',
  PASSWORD_RESET: 'password_reset',
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  RESOURCE_UPLOADED: 'resource_uploaded',
  RESOURCE_APPROVED: 'resource_approved',
  RESOURCE_REJECTED: 'resource_rejected',
  RESOURCE_DELETED: 'resource_deleted',
  RESOURCE_DOWNLOADED: 'resource_downloaded',
  VERSION_UPLOADED: 'version_uploaded',
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

module.exports = {
  ROLES,
  RESOURCE_STATUS,
  ALLOWED_FILE_TYPES,
  MIME_TYPE_MAP,
  MAX_FILE_SIZE,
  SEMESTERS,
  AUDIT_ACTIONS,
  PAGINATION,
};
