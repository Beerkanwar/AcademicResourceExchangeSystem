const { PAGINATION } = require('./constants');

/**
 * Safely parse and clamp a pagination limit query value.
 * Handles missing, NaN, and out-of-range values.
 */
function clampLimit(
  value,
  {
    defaultLimit = PAGINATION.DEFAULT_LIMIT,
    min = 1,
    max = PAGINATION.MAX_LIMIT,
  } = {}
) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return defaultLimit;
  }
  return Math.min(Math.max(parsed, min), max);
}

/**
 * Safely parse a page number (minimum 1).
 */
function clampPage(value, defaultPage = PAGINATION.DEFAULT_PAGE) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return defaultPage;
  }
  return parsed;
}

module.exports = {
  clampLimit,
  clampPage,
};
