import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const providerSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    countryCode: {
      type: String,
      required: true,
      default: '+966' // Saudi Arabia default
    },
    number: {
      type: String,
      required: true
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Saudi Arabia'
    }
  },
  zone: {
    type: String,
    required: true,
    enum: ['Makkah', 'Madinah', 'Jeddah', 'Riyadh', 'Dammam', 'Other']
  },
  businessIdProof: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadDate: Date,
    url: String
  },
  businessType: {
    type: String,
    required: true,
    enum: [
      'Travel Agent',
      'Tour Operator', 
      'Transportation Provider',
      'Accommodation Provider',
      'Guide Service',
      'Food Service',
      'Other Services'
    ]
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'approved', 'rejected', 'suspended']
  },
  approvedBy: {
    type: String,
    ref: 'User' // References admin user who approved
  },
  approvedAt: Date,
  rejectionReason: String,
  termsAccepted: {
    type: Boolean,
    required: true,
    default: false
  },
  termsAcceptedAt: Date,
  profileComplete: {
    type: Boolean,
    default: false
  },
  services: [{
    name: String,
    description: String,
    price: Number,
    category: String,
    active: {
      type: Boolean,
      default: true
    }
  }],
  ratings: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  earnings: {
    total: {
      type: Number,
      default: 0
    },
    pending: {
      type: Number,
      default: 0
    },
    paid: {
      type: Number,
      default: 0
    }
  },
  statistics: {
    totalBookings: {
      type: Number,
      default: 0
    },
    completedBookings: {
      type: Number,
      default: 0
    },
    cancelledBookings: {
      type: Number,
      default: 0
    }
  },
  lastLoginAt: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
providerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for formatted phone
providerSchema.virtual('formattedPhone').get(function() {
  return `${this.phone.countryCode} ${this.phone.number}`;
});

// Index for efficient queries
providerSchema.index({ email: 1 });
providerSchema.index({ status: 1 });
providerSchema.index({ zone: 1 });
providerSchema.index({ businessType: 1 });
providerSchema.index({ createdAt: -1 });

// Methods
providerSchema.methods.toSafeObject = function() {
  const provider = this.toObject();
  delete provider.password;
  return provider;
};

providerSchema.methods.updateEarnings = function(amount, type = 'add') {
  if (type === 'add') {
    this.earnings.total += amount;
    this.earnings.pending += amount;
  }
  return this.save();
};

providerSchema.methods.completeBooking = function() {
  this.statistics.completedBookings += 1;
  this.statistics.totalBookings += 1;
  return this.save();
};

providerSchema.methods.cancelBooking = function() {
  this.statistics.cancelledBookings += 1;
  this.statistics.totalBookings += 1;
  return this.save();
};

export default mongoose.model('Provider', providerSchema);