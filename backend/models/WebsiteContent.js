import mongoose from 'mongoose';

const websiteContentSchema = new mongoose.Schema({
  section: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed, // Allows for flexible content structure
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    required: true
  },
  lastUpdatedBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
websiteContentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes
websiteContentSchema.index({ section: 1 });
websiteContentSchema.index({ isActive: 1 });

const WebsiteContent = mongoose.model('WebsiteContent', websiteContentSchema);

export default WebsiteContent;