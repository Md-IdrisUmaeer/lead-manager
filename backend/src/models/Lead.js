const mongoose = require('mongoose');
const { LEAD_SOURCES, LEAD_STATUSES, DEFAULT_STATUS } = require('../constants/lead.constants');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be 2–100 characters'],
      maxlength: [100, 'Name must be 2–100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      maxlength: [254, 'Enter a valid email'],
      match: [EMAIL_REGEX, 'Enter a valid email'],
      unique: true,
    },
    phone: {
      type: String,
      trim: true,
      match: [PHONE_REGEX, 'Enter a valid phone number'],
    },
    company: {
      type: String,
      trim: true,
      maxlength: [100, 'Company must be at most 100 characters'],
    },
    source: {
      type: String,
      required: [true, 'Source is required'],
      enum: { values: LEAD_SOURCES, message: 'Invalid source' },
    },
    status: {
      type: String,
      required: [true, 'Invalid status'],
      enum: { values: LEAD_STATUSES, message: 'Invalid status' },
      default: DEFAULT_STATUS,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// email_1 (unique) comes from `unique: true` above.
leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);
module.exports.EMAIL_REGEX = EMAIL_REGEX;
module.exports.PHONE_REGEX = PHONE_REGEX;
