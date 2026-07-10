const ApiResponse = require('../utils/apiResponse');
const AuditLog = require('../models/AuditLog');

const auditController = {
  getAll: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
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
