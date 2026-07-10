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

  static async getMyUploads(userId, { page = 1, limit = 20 }) {
    return ResourceService.listResources({
      page,
      limit,
      uploadedBy: userId,
      showAll: true,
    });
  }

  /**
   * Get dynamic dashboard stats for a user
   */
  static async getUserStats(userId) {
    const mongoose = require('mongoose');
    const uId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

    const filter = { uploadedBy: uId, isDeleted: false };
    
    const [totalUploads, approved, pending, rejected, aggregation] = await Promise.all([
      Resource.countDocuments(filter),
      Resource.countDocuments({ ...filter, status: RESOURCE_STATUS.APPROVED }),
      Resource.countDocuments({ ...filter, status: RESOURCE_STATUS.PENDING }),
      Resource.countDocuments({ ...filter, status: RESOURCE_STATUS.REJECTED }),
      Resource.aggregate([
        { $match: { uploadedBy: uId, isDeleted: false } },
        { 
          $group: { 
            _id: null, 
            totalDownloads: { $sum: '$downloads' }, 
            averageRating: { $avg: '$averageRating' } 
          } 
        }
      ])
    ]);

    return {
      totalUploads,
      approved,
      pending,
      rejected,
      totalDownloads: aggregation[0]?.totalDownloads || 0,
      reputationScore: aggregation[0]?.averageRating ? Number(aggregation[0].averageRating.toFixed(1)) : 0
    };
  }

  /**
   * Verify a resource (Approve or Reject)
   */
  static async verifyResource(resourceId, action, userId, userRole, reason = '') {
    const resource = await Resource.findOne({ _id: resourceId, isDeleted: false });
    if (!resource) throw new NotFoundError('Resource not found');

    if (![ROLES.ADMIN, ROLES.TEACHER].includes(userRole)) {
      throw new ForbiddenError('Only teachers and admins can verify resources');
    }

    if (action === 'approve') {
      resource.status = RESOURCE_STATUS.APPROVED;
      resource.rejectionReason = '';
    } else if (action === 'reject') {
      if (!reason.trim()) {
        throw new BadRequestError('Reason is required when rejecting a resource');
      }
      resource.status = RESOURCE_STATUS.REJECTED;
      resource.rejectionReason = reason.trim();
    } else {
      throw new BadRequestError('Invalid verification action');
    }

    resource.verifiedBy = userId;
    resource.verifiedAt = new Date();
    await resource.save();

    await AuditLog.create({
      actor: userId,
      action: action === 'approve' ? AUDIT_ACTIONS.RESOURCE_APPROVED : AUDIT_ACTIONS.RESOURCE_REJECTED,
      targetType: 'Resource',
      targetId: resource._id,
      details: { 
        title: resource.title,
        status: resource.status,
        reason: action === 'reject' ? reason : undefined
      },
    });

    return resource;
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
  /**
   * Upload a new version for an existing resource
   */
  static async uploadNewVersion(resourceId, file, userId, userRole) {
    if (!file) throw new BadRequestError('No file uploaded');

    const resource = await Resource.findOne({ _id: resourceId, isDeleted: false });
    if (!resource) {
      fs.unlinkSync(file.path);
      throw new NotFoundError('Resource not found');
    }

    if (resource.uploadedBy.toString() !== userId && userRole !== ROLES.ADMIN) {
      fs.unlinkSync(file.path);
      throw new ForbiddenError('You can only update versions on your own resources');
    }

    const fileHash = await generateFileHashFromPath(file.path);
    const existingResource = await Resource.findOne({ fileHash, isDeleted: false });
    if (existingResource) {
      fs.unlinkSync(file.path);
      throw new BadRequestError('This exact file already exists globally in the repository');
    }

    // Archive current active document to versions array
    resource.versions.push({
      version: resource.currentVersion,
      originalFilename: resource.originalFilename,
      storedFilename: resource.storedFilename,
      filePath: resource.filePath,
      fileSize: resource.fileSize,
      fileHash: resource.fileHash,
      mimeType: resource.mimeType,
      uploadedAt: resource.updatedAt || resource.createdAt,
    });

    let extractedText = '';
    try {
      extractedText = await ResourceService.extractText(file.path, file.mimetype);
    } catch (err) { /* ignore */ }

    // Overwrite master properties
    resource.originalFilename = file.originalname;
    resource.storedFilename = file.filename;
    resource.filePath = file.path;
    resource.fileSize = file.size;
    resource.fileType = path.extname(file.originalname).toLowerCase().replace('.', '');
    resource.mimeType = file.mimetype;
    resource.fileHash = fileHash;
    resource.extractedText = extractedText;
    
    resource.currentVersion += 1;

    // Reset verification natively unless Admin or Teacher
    if (userRole !== ROLES.ADMIN && userRole !== ROLES.TEACHER) {
      resource.status = RESOURCE_STATUS.PENDING;
    }

    await resource.save();

    await AuditLog.create({
      actor: userId,
      action: 'version_uploaded',
      targetType: 'Resource',
      targetId: resource._id,
      details: { title: resource.title, newVersion: resource.currentVersion },
    });

    return Resource.findById(resource._id)
      .populate('uploadedBy', 'firstName lastName email role')
      .populate('subject', 'name code')
      .populate('department', 'name code');
  }

  /**
   * Download a specific historic version of a resource
   */
  static async downloadVersion(resourceId, versionId, userId) {
    const resource = await Resource.findOne({ _id: resourceId, isDeleted: false });
    if (!resource) throw new NotFoundError('Resource not found');

    const versionDoc = resource.versions.find(v => v._id.toString() === versionId.toString());
    if (!versionDoc) throw new NotFoundError('Specific version archive not found');

    if (!fs.existsSync(versionDoc.filePath)) {
      throw new NotFoundError('Archived file missing from disk structure');
    }

    await AuditLog.create({
      actor: userId,
      action: 'resource_downloaded',
      targetType: 'Resource',
      targetId: resource._id,
      details: { versionRecord: versionDoc.version },
    });

    return {
      filePath: versionDoc.filePath,
      filename: versionDoc.originalFilename,
      mimeType: versionDoc.mimeType,
    };
  }
}

module.exports = ResourceService;
