const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Course code is required'],
      uppercase: true,
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    credits: {
      type: Number,
      default: 3,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isElective: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index — a subject code is unique within a department
subjectSchema.index({ code: 1, department: 1 }, { unique: true });
subjectSchema.index({ semester: 1, department: 1 });
subjectSchema.index({ name: 'text', code: 'text' });

module.exports = mongoose.model('Subject', subjectSchema);
