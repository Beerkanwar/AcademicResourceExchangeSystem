const fs = require('fs');
const path = require('path');
const Resource = require('../models/Resource');
const AuditLog = require('../models/AuditLog');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/apiError');
const { generateFileHashFromPath } = require('../utils/fileHelpers');
const { AUDIT_ACTIONS, RESOURCE_STATUS, ROLES } = require('../utils/constants');
const env = require('../config/env');

class ResourceService {
  /**
   * Upload a new resource
   */
  static async upload(file, metadata, userId) {
    if (!file) throw new BadRequestError('No file uploaded');

    // Generate file hash for deduplication
    const fileHash = await generateFileHashFromPath(file.path);

    // Check for duplicate file
    const existingResource = await Resource.findOne({ fileHash, isDeleted: false });
    if (existingResource) {
      // Clean up uploaded file since it's a duplicate
      fs.unlinkSync(file.path);
      throw new BadRequestError(
        `This file has already been uploaded as "${existingResource.title}"`
      );
    }

    // Extract text content from PDF/DOCX for full-text search
    let extractedText = '';
    try {
      extractedText = await ResourceService.extractText(file.path, file.mimetype);
    } catch (err) {
      console.warn('Text extraction failed:', err.message);
    }

    // Parse tags from string
    let tags = [];
    if (metadata.tags) {
      tags = typeof metadata.tags === 'string'
        ? metadata.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
        : metadata.tags;
    }

    // Create resource record
    const resource = await Resource.create({
      title: metadata.title,
      description: metadata.description || '',
      originalFilename: file.originalname,
      storedFilename: file.filename,
      filePath: file.path,
      fileSize: file.size,
      fileType: path.extname(file.originalname).toLowerCase().replace('.', ''),
      mimeType: file.mimetype,
      fileHash,
      subject: metadata.subject || undefined,
      semester: metadata.semester ? Number(metadata.semester) : undefined,
      department: metadata.department || undefined,
      courseCode: metadata.courseCode || '',
      academicYear: metadata.academicYear || '',
      author: metadata.author || '',
      tags,
      uploadedBy: userId,
      extractedText,
      // Teachers' uploads auto-approved, students' are pending
      status: metadata._autoApprove ? RESOURCE_STATUS.APPROVED : RESOURCE_STATUS.PENDING,
    });

    // Audit log
    await AuditLog.create({
      actor: userId,
      action: AUDIT_ACTIONS.RESOURCE_UPLOADED,
      targetType: 'Resource',
      targetId: resource._id,
      details: {
        title: resource.title,
        fileType: resource.fileType,
        fileSize: resource.fileSize,
      },
    });

    // Return populated resource
    return Resource.findById(resource._id)
      .populate('uploadedBy', 'firstName lastName email role')
      .populate('subject', 'name code')
      .populate('department', 'name code');
  }

  /**
   * List resources with filtering, sorting, and pagination
   */
  static async listResources({
    page = 1,
    limit = 20,
    department,
    semester,
    subject,
    status,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    uploadedBy,
    showAll = false,
  }) {
    const filter = { isDeleted: false };

    // By default, only show approved resources (unless admin/teacher or filtering by status)
    if (!showAll && !status) {
      filter.status = RESOURCE_STATUS.APPROVED;
    } else if (status) {
      filter.status = status;
    }

    if (department) filter.department = department;
    if (semester) filter.semester = Number(semester);
    if (subject) filter.subject = subject;
    if (uploadedBy) filter.uploadedBy = uploadedBy;

    if (search) {
      // Use MongoDB text search
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const sort = {};
    if (search) {
      sort.score = { $meta: 'textScore' };
    }
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const queryOptions = search ? { score: { $meta: 'textScore' } } : {};

    const [resources, total] = await Promise.all([
      Resource.find(filter, queryOptions)
        .populate('uploadedBy', 'firstName lastName email role')
        .populate('subject', 'name code')
        .populate('department', 'name code')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Resource.countDocuments(filter),
    ]);

    return {
      resources,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get resource by ID (increments view count)
   */
  static async getById(resourceId, incrementViews = true) {
    const resource = await Resource.findOne({ _id: resourceId, isDeleted: false })
      .populate('uploadedBy', 'firstName lastName email role')
      .populate('subject', 'name code semester')
      .populate('department', 'name code')
      .populate('verifiedBy', 'firstName lastName email');

    if (!resource) throw new NotFoundError('Resource not found');

    if (incrementViews) {
      resource.views += 1;
      await resource.save();
    }

    return resource;
  }

  /**
   * Update resource metadata (owner or admin only)
   */
  static async updateResource(resourceId, updates, userId, userRole) {
    const resource = await Resource.findOne({ _id: resourceId, isDeleted: false });
    if (!resource) throw new NotFoundError('Resource not found');

    // Only owner or admin can update
    if (resource.uploadedBy.toString() !== userId && userRole !== ROLES.ADMIN) {
      throw new ForbiddenError('You can only edit your own resources');
    }

    const allowedFields = ['title', 'description', 'tags', 'courseCode', 'academicYear', 'author', 'subject', 'semester', 'department'];
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        if (key === 'tags' && typeof updates[key] === 'string') {
          resource[key] = updates[key].split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
        } else {
          resource[key] = updates[key];
        }
      }
    }

    // If metadata changed, reset to pending if it was approved (unless admin)
    if (userRole !== ROLES.ADMIN && resource.status === RESOURCE_STATUS.APPROVED) {
      resource.status = RESOURCE_STATUS.PENDING;
    }

    await resource.save();

    return Resource.findById(resource._id)
      .populate('uploadedBy', 'firstName lastName email role')
      .populate('subject', 'name code')
      .populate('department', 'name code');
  }

  /**
   * Soft delete a resource (owner or admin)
   */
  static async deleteResource(resourceId, userId, userRole) {
    const resource = await Resource.findOne({ _id: resourceId, isDeleted: false });
    if (!resource) throw new NotFoundError('Resource not found');

    if (resource.uploadedBy.toString() !== userId && userRole !== ROLES.ADMIN) {
      throw new ForbiddenError('You can only delete your own resources');
    }

    resource.isDeleted = true;
    await resource.save();

    await AuditLog.create({
      actor: userId,
      action: AUDIT_ACTIONS.RESOURCE_DELETED,
      targetType: 'Resource',
      targetId: resource._id,
      details: { title: resource.title },
    });

    return { message: 'Resource deleted successfully' };
  }

  /**
   * Download a resource (increments download count)
   */
  static async download(resourceId, userId) {
    const resource = await Resource.findOne({ _id: resourceId, isDeleted: false });
    if (!resource) throw new NotFoundError('Resource not found');

    // Check file exists
    if (!fs.existsSync(resource.filePath)) {
      throw new NotFoundError('File not found on disk');
    }

    // Increment download count
    resource.downloads += 1;
    await resource.save();

    await AuditLog.create({
      actor: userId,
      action: AUDIT_ACTIONS.RESOURCE_DOWNLOADED,
      targetType: 'Resource',
      targetId: resource._id,
      details: {},
    });

    return {
      filePath: resource.filePath,
      filename: resource.originalFilename,
      mimeType: resource.mimeType,
    };
  }

  /**
   * Get current user's uploads
   */
  static async getMyUploads(userId, { page = 1, limit = 20 }) {
    return ResourceService.listResources({
      page,
      limit,
      uploadedBy: userId,
      showAll: true,
    });
  }

  /**
   * Extract text from uploaded files (for full-text search)
   */
  static async extractText(filePath, mimeType) {
    try {
      if (mimeType === 'application/pdf') {
        const pdfParse = require('pdf-parse');
        const buffer = fs.readFileSync(filePath);
        const data = await pdfParse(buffer);
        return data.text?.substring(0, 50000) || ''; // Limit extracted text
      }

      if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value?.substring(0, 50000) || '';
      }

      if (mimeType === 'text/plain') {
        return fs.readFileSync(filePath, 'utf8').substring(0, 50000);
      }
    } catch (err) {
      console.warn(`Text extraction failed for ${mimeType}:`, err.message);
    }
    return '';
  }
}

module.exports = ResourceService;
