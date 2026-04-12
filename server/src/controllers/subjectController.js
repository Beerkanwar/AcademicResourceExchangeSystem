const ApiResponse = require('../utils/apiResponse');
const Subject = require('../models/Subject');

const subjectController = {
  getAll: async (req, res, next) => {
    try {
      const filter = { isActive: true };
      if (req.query.department) filter.department = req.query.department;
      if (req.query.semester) filter.semester = parseInt(req.query.semester, 10);

      const subjects = await Subject.find(filter)
        .populate('department', 'name code')
        .sort({ semester: 1, name: 1 });

      return ApiResponse.success(res, subjects, 'Subjects retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const subject = await Subject.findById(req.params.id).populate('department', 'name code');
      if (!subject) {
        return ApiResponse.error(res, 'Subject not found', 404);
      }
      return ApiResponse.success(res, subject);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const subject = await Subject.create(req.body);
      return ApiResponse.created(res, subject, 'Subject created successfully');
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!subject) {
        return ApiResponse.error(res, 'Subject not found', 404);
      }
      return ApiResponse.success(res, subject, 'Subject updated successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = subjectController;
