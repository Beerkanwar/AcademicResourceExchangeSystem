const ApiResponse = require('../utils/apiResponse');
const AuditLog = require('../models/AuditLog');
const { clampLimit, clampPage } = require('../utils/pagination');

const auditController = {
  getAll: async (req, res, next) => {
    try {
      const page = clampPage(req.query.page);
      const limit = clampLimit(req.query.limit);
      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        AuditLog.find()
          .populate('actor', 'email firstName lastName role')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        AuditLog.countDocuments(),
      ]);

      return ApiResponse.paginated(res, logs, {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }, 'Audit logs retrieved');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = auditController;
