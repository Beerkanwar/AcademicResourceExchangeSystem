/**
 * Escape special regex characters so user input is treated as literal text.
 * Prevents ReDoS when feeding strings into MongoDB $regex queries.
 */
function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { escapeRegex };
