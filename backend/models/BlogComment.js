import mongoose from 'mongoose';
import crypto from 'crypto';

const blogCommentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomUUID()
  },
  blogId: {
    type: String,
    required: true,
    ref: 'Blog'
  },
  author: {
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    userId: String, // Optional - for registered users
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxLength: 1000
  },
  parentId: {
    type: String,
    ref: 'BlogComment', // For nested replies
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'spam'],
    default: 'pending'
  },
  likes: {
    type: Number,
    default: 0
  },
  reported: {
    type: Boolean,
    default: false
  },
  reportCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for querying
blogCommentSchema.index({ blogId: 1, status: 1, createdAt: -1 });
blogCommentSchema.index({ parentId: 1 });
blogCommentSchema.index({ status: 1 });

export default mongoose.model('BlogComment', blogCommentSchema);