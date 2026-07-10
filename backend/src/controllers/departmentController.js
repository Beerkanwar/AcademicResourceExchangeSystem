const ApiResponse = require('../utils/apiResponse');
const Department = require('../models/Department');

const departmentController = {
  getAll: async (req, res, next) => {
    try {
      const departments = await Department.find({ isActive: true }).sort({ name: 1 });
      return ApiResponse.success(res, departments, 'Departments retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const department = await Department.findById(req.params.id);
      if (!department) {
        return ApiResponse.error(res, 'Department not found', 404);
      }
      return ApiResponse.success(res, department);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const department = await Department.create(req.body);
      return ApiResponse.created(res, department, 'Department created successfully');
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!department) {
        return ApiResponse.error(res, 'Department not found', 404);
      }
      return ApiResponse.success(res, department, 'Department updated successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = departmentController;
