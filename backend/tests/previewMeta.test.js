const { getPreviewMeta } = require('../src/utils/previewMeta');

describe('getPreviewMeta', () => {
  it('detects PDF from mime type', () => {
    expect(getPreviewMeta({ mimeType: 'application/pdf', fileType: 'bin' })).toEqual({
      previewable: true,
      previewKind: 'pdf',
    });
  });

  it('detects PDF from extension when mime is missing', () => {
    expect(getPreviewMeta({ fileType: 'pdf' })).toEqual({
      previewable: true,
      previewKind: 'pdf',
    });
  });

  it('detects images from mime or extension', () => {
    expect(getPreviewMeta({ mimeType: 'image/png' }).previewKind).toBe('image');
    expect(getPreviewMeta({ fileType: 'jpeg' }).previewKind).toBe('image');
  });

  it('marks unsupported types as not previewable', () => {
    expect(getPreviewMeta({ mimeType: 'application/zip', fileType: 'zip' })).toEqual({
      previewable: false,
      previewKind: null,
    });
    expect(getPreviewMeta({ mimeType: 'text/plain', fileType: 'txt' }).previewable).toBe(false);
  });
});
