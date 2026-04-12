const mongoose = require('mongoose');
const { RESOURCE_STATUS } = require('../utils/constants');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    // File info
    originalFilename: {
      type: String,
      required: true,
    },
    storedFilename: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileHash: {
      type: String,
      required: true,
      index: true,
    },
    // Academic metadata
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    courseCode: {
      type: String,
      uppercase: true,
      trim: true,
      default: '',
    },
    academicYear: {
      type: String,
      trim: true,
      default: '',
    },
    author: {
      type: String,
      trim: true,
      default: '',
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    // Verification
    status: {
      type: String,
      enum: Object.values(RESOURCE_STATUS),
      default: RESOURCE_STATUS.PENDING,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
    // Uploader
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Stats
    downloads: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    // Full-text search content (extracted from file)
    extractedText: {
      type: String,
      default: '',
      select: false, // Don't include in queries by default — large field
    },
    // Version tracking
    currentVersion: {
      type: Number,
      default: 1,
    },
    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for search and filtering
resourceSchema.index({ status: 1, isDeleted: 1 });
resourceSchema.index({ uploadedBy: 1 });
resourceSchema.index({ department: 1, semester: 1 });
resourceSchema.index({ tags: 1 });
resourceSchema.index({ createdAt: -1 });
resourceSchema.index({ downloads: -1 });
resourceSchema.index({ averageRating: -1 });

// Text index for full-text search
resourceSchema.index(
  {
    title: 'text',
    description: 'text',
    tags: 'text',
    courseCode: 'text',
    author: 'text',
    originalFilename: 'text',
    extractedText: 'text',
  },
  {
    weights: {
      title: 10,
      tags: 8,
      courseCode: 6,
      author: 5,
      description: 4,
      originalFilename: 3,
      extractedText: 1,
    },
    name: 'resource_text_search',
  }
);

module.exports = mongoose.model('Resource', resourceSchema);
