/**
 * Derive inline preview kind from MIME type (preferred) or file extension.
 * Supported: PDF and common images (png/jpg/jpeg).
 */
const IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg']);
const IMAGE_MIMES = new Set(['image/png', 'image/jpeg', 'image/jpg']);

export function getPreviewMeta({ mimeType, fileType, previewable, previewKind } = {}) {
  if (previewKind === 'pdf' || previewKind === 'image') {
    return { previewable: true, previewKind };
  }
  if (previewable === false) {
    return { previewable: false, previewKind: null };
  }

  const mime = String(mimeType || '').toLowerCase().trim();
  const ext = String(fileType || '')
    .toLowerCase()
    .replace(/^\./, '')
    .trim();

  if (mime === 'application/pdf' || ext === 'pdf') {
    return { previewable: true, previewKind: 'pdf' };
  }

  if (IMAGE_MIMES.has(mime) || IMAGE_EXTS.has(ext)) {
    return { previewable: true, previewKind: 'image' };
  }

  return { previewable: false, previewKind: null };
}
