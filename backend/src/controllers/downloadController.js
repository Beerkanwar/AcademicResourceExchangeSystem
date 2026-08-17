const DownloadService = require('../services/downloadService');
const ApiResponse = require('../utils/apiResponse');
const { BadRequestError } = require('../utils/apiError');

const downloadController = {
  /**
   * GET /api/downloads/sign/:fileId
   * Query: versionId?, purpose? (download|preview)
   */
  sign: async (req, res, next) => {
    try {
      const result = await DownloadService.createSignedUrl({
        fileId: req.params.fileId,
        user: req.user,
        versionId: req.query.versionId || null,
        purpose: req.query.purpose || 'download',
      });
      return ApiResponse.success(res, result, 'Signed download URL generated');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/downloads/file?token=...
   * Validates signature + expiry, re-checks permissions, streams the file.
   */
  file: async (req, res, next) => {
    try {
      const token = req.query.token;
      if (!token) {
        throw new BadRequestError('Download token query parameter is required');
      }

      const ipAddress = req.ip || req.connection?.remoteAddress || '';
      const { filePath, filename, mimeType, purpose } = await DownloadService.executeDownload({
        token,
        ipAddress,
      });

      const disposition = purpose === 'preview' ? 'inline' : 'attachment';
      res.setHeader('Content-Type', mimeType);
      res.setHeader(
        'Content-Disposition',
        `${disposition}; filename="${encodeURIComponent(filename)}"`
      );
      // Prevent caching of signed download responses
      res.setHeader('Cache-Control', 'no-store');

      return res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = downloadController;
