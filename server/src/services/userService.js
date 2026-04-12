const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { BadRequestError, NotFoundError } = require('../utils/apiError');
const { AUDIT_ACTIONS, ROLES } = require('../utils/constants');

class UserService {
  /**
   * List users with filtering and pagination
   */
  static async listUsers({ page = 1, limit = 20, role, department, isActive, search }) {
    const filter = {};

    if (role) filter.role = role;
    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === 'true' || isActive === true;
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .populate('department', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    return {
      users: users.map((u) => u.toSafeJSON()),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single user by ID
   */
  static async getUserById(userId) {
    const user = await User.findById(userId).populate('department', 'name code');
    if (!user) throw new NotFoundError('User not found');
    return user.toSafeJSON();
  }

  /**
   * Create a new user (Admin only)
   * Default password = roll number (students) or 'password123' (teachers)
   */
  static async createUser(data, adminId) {
    const { email, role, firstName, lastName, rollNumber, department, phone } = data;

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new BadRequestError('A user with this email already exists');

    // Set default password
    const defaultPassword = role === ROLES.STUDENT && rollNumber
      ? rollNumber
      : 'password123';

    const user = await User.create({
      email: email.toLowerCase(),
      password: defaultPassword,
      role: role || ROLES.STUDENT,
      firstName: firstName || '',
      lastName: lastName || '',
      rollNumber: rollNumber || '',
      department: department || undefined,
      phone: phone || '',
      mustChangePassword: true,
    });

    // Audit log
    await AuditLog.create({
      actor: adminId,
      action: AUDIT_ACTIONS.USER_CREATED,
      targetType: 'User',
      targetId: user._id,
      details: { email: user.email, role: user.role },
    });

    return user.toSafeJSON();
  }

  /**
   * Update a user (Admin only)
   */
  static async updateUser(userId, data, adminId) {
    const allowedFields = ['firstName', 'lastName', 'rollNumber', 'department', 'phone', 'role', 'isActive'];
    const updates = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) updates[key] = data[key];
    }

    // Prevent admin from demoting themselves
    if (userId === adminId.toString() && updates.role && updates.role !== ROLES.ADMIN) {
      throw new BadRequestError('You cannot change your own role');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).populate('department', 'name code');

    if (!user) throw new NotFoundError('User not found');

    await AuditLog.create({
      actor: adminId,
      action: AUDIT_ACTIONS.USER_UPDATED,
      targetType: 'User',
      targetId: user._id,
      details: { updates: Object.keys(updates) },
    });

    return user.toSafeJSON();
  }

  /**
   * Deactivate / Activate a user (soft delete)
   */
  static async toggleUserStatus(userId, adminId) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    if (userId === adminId.toString()) {
      throw new BadRequestError('You cannot deactivate your own account');
    }

    user.isActive = !user.isActive;
    await user.save();

    await AuditLog.create({
      actor: adminId,
      action: user.isActive ? AUDIT_ACTIONS.USER_ACTIVATED : AUDIT_ACTIONS.USER_DEACTIVATED,
      targetType: 'User',
      targetId: user._id,
      details: { isActive: user.isActive },
    });

    return user.toSafeJSON();
  }

  /**
   * Reset user password to default (Admin only)
   */
  static async resetPassword(userId, adminId) {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new NotFoundError('User not found');

    // Reset to roll number or default
    const newPassword = user.rollNumber || 'password123';
    user.password = newPassword;
    user.mustChangePassword = true;
    await user.save();

    await AuditLog.create({
      actor: adminId,
      action: AUDIT_ACTIONS.PASSWORD_RESET,
      targetType: 'User',
      targetId: user._id,
      details: { resetBy: 'admin' },
    });

    return { message: `Password reset to default. User must change it on next login.` };
  }
}

module.exports = UserService;
