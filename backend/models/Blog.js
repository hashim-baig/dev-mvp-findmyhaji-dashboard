import mongoose from 'mongoose';
import crypto from 'crypto';

const blogSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomUUID()
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: true,
    maxLength: 300,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    default: ''
  },
  author: {
    id: String,
    name: String,
    email: String,
    role: {
      type: String,
      enum: ['admin', 'content_manager', 'provider'],
      default: 'admin'
    }
  },
  category: {
    type: String,
    required: true,
    enum: [
      'rituals',
      'safety', 
      'family',
      'duas',
      'provider_tips',
      'packing',
      'travel',
      'spiritual_guidance',
      'news',
      'general'
    ],
    default: 'general'
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  publishedAt: {
    type: Date
  },
  scheduledAt: {
    type: Date
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  readTime: {
    type: Number, // in minutes
    default: 5
  },
  language: {
    type: String,
    enum: ['en', 'ar', 'ur'],
    default: 'en'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug from title before saving
blogSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }
  
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Calculate read time based on content length
  if (this.isModified('content')) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }
  
  next();
});

// Index for search and filtering
blogSchema.index({ title: 'text', content: 'text', excerpt: 'text' });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ featured: 1, status: 1, publishedAt: -1 });
blogSchema.index({ slug: 1 });

// Virtual for URL-friendly ID
blogSchema.virtual('urlId').get(function() {
  return `${this.slug}-${this.id.slice(-8)}`;
});

export default mongoose.model('Blog', blogSchema);