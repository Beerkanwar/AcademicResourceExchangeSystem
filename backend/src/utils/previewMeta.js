/**
 * Derive whether a resource can be previewed inline and which renderer to use.
 * Prefers MIME type, falls back to file extension.
 */
const IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg']);
const IMAGE_MIMES = new Set(['image/png', 'image/jpeg', 'image/jpg']);

function normalizeExt(fileType) {
  return String(fileType || '')
    .toLowerCase()
    .replace(/^\./, '')
    .trim();
}

function getPreviewMeta({ mimeType, fileType } = {}) {
  const mime = String(mimeType || '').toLowerCase().trim();
  const ext = normalizeExt(fileType);

  if (mime === 'application/pdf' || ext === 'pdf') {
    return { previewable: true, previewKind: 'pdf' };
  }

  if (IMAGE_MIMES.has(mime) || IMAGE_EXTS.has(ext)) {
    return { previewable: true, previewKind: 'image' };
  }

  return { previewable: false, previewKind: null };
}

module.exports = { getPreviewMeta, IMAGE_EXTS, IMAGE_MIMES };
