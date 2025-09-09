import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Group name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Group name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  groupType: {
    type: String,
    enum: ['hajj', 'umrah', 'mixed'],
    default: 'hajj'
  },

  // Leadership
  leader: {
    name: {
      type: String,
      required: [true, 'Group leader name is required'],
      trim: true
    },
    title: {
      type: String,
      enum: ['Imam', 'Sheikh', 'Ustaz', 'Guide', 'Coordinator'],
      default: 'Guide'
    },
    phone: {
      type: String,
      required: [true, 'Leader phone is required'],
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
    },
    email: {
      type: String,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    experience: {
      type: Number,
      min: 0,
      default: 0
    }
  },

  // Assistant Leaders
  assistants: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['Assistant Leader', 'Medical Officer', 'Coordinator', 'Translator'],
      default: 'Assistant Leader'
    },
    phone: String,
    email: String
  }],

  // Schedule & Journey
  schedule: {
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    arrivalFlight: {
      airline: String,
      flightNumber: String,
      departureCity: String,
      arrivalTime: Date
    },
    departureFlight: {
      airline: String,
      flightNumber: String,
      destinationCity: String,
      departureTime: Date
    }
  },

  // Current Status
  currentStage: {
    type: String,
    enum: ['preparation', 'travel', 'ihram', 'tawaf', 'sai', 'arafat', 'muzdalifah', 'jamarat', 'completed'],
    default: 'preparation'
  },
  currentLocation: {
    name: {
      type: String,
      default: 'Not specified'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [39.8262, 21.4225] // Default to Makkah
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },

  // Group Statistics
  capacity: {
    type: Number,
    required: [true, 'Group capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [500, 'Capacity cannot exceed 500']
  },
  pilgrimCount: {
    type: Number,
    default: 0,
    min: 0
  },

  // Accommodation
  accommodation: {
    makkah: {
      hotelName: String,
      address: String,
      checkIn: Date,
      checkOut: Date,
      roomsBooked: Number
    },
    madinah: {
      hotelName: String,
      address: String,
      checkIn: Date,
      checkOut: Date,
      roomsBooked: Number
    },
    mina: {
      tentNumber: String,
      sector: String,
      capacity: Number
    },
    arafat: {
      tentNumber: String,
      sector: String,
      capacity: Number
    }
  },

  // Transportation
  transportation: [{
    type: {
      type: String,
      enum: ['bus', 'van', 'car', 'flight'],
      required: true
    },
    provider: String,
    vehicleNumber: String,
    capacity: Number,
    driver: {
      name: String,
      phone: String,
      license: String
    },
    route: String,
    scheduledTime: Date
  }],

  // Communication
  communicationChannels: {
    whatsappGroup: {
      name: String,
      link: String,
      qrCode: String
    },
    telegramGroup: {
      name: String,
      link: String
    },
    emergencyNumbers: [{
      label: String,
      number: String,
      available24h: {
        type: Boolean,
        default: true
      }
    }]
  },

  // Journey Progress Tracking
  milestones: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    scheduledTime: Date,
    actualTime: Date,
    completed: {
      type: Boolean,
      default: false
    },
    location: {
      name: String,
      coordinates: [Number]
    },
    notes: String
  }],

  // Group Rules and Guidelines
  guidelines: {
    meetingPoints: [{
      name: String,
      location: String,
      coordinates: [Number],
      description: String
    }],
    rules: [String],
    dailySchedule: [{
      time: String,
      activity: String,
      location: String,
      mandatory: {
        type: Boolean,
        default: false
      }
    }]
  },

  // Status and Alerts
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed', 'cancelled', 'emergency'],
    default: 'active'
  },
  alerts: [{
    type: {
      type: String,
      enum: ['general', 'emergency', 'weather', 'schedule', 'location', 'medical']
    },
    title: String,
    message: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: Date,
    acknowledged: [{
      pilgrimId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pilgrim'
      },
      acknowledgedAt: Date
    }]
  }],

  // Financial Information
  financials: {
    packageCost: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    inclusions: [String],
    exclusions: [String],
    paymentDeadline: Date
  },

  // Medical Information
  medical: {
    medicalOfficer: {
      name: String,
      phone: String,
      qualifications: String
    },
    firstAidKit: {
      available: {
        type: Boolean,
        default: false
      },
      contents: [String],
      expiryCheck: Date
    },
    emergencyProtocol: String
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  notes: [{
    message: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
groupSchema.index({ name: 1 });
groupSchema.index({ status: 1, currentStage: 1 });
groupSchema.index({ 'schedule.startDate': 1, 'schedule.endDate': 1 });
groupSchema.index({ createdBy: 1 });
groupSchema.index({ createdAt: -1 });

// Virtual for occupancy rate
groupSchema.virtual('occupancyRate').get(function() {
  return this.capacity > 0 ? Math.round((this.pilgrimCount / this.capacity) * 100) : 0;
});

// Virtual for days remaining
groupSchema.virtual('daysUntilStart').get(function() {
  const now = new Date();
  const startDate = new Date(this.schedule.startDate);
  const diffTime = startDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for journey duration
groupSchema.virtual('journeyDuration').get(function() {
  const start = new Date(this.schedule.startDate);
  const end = new Date(this.schedule.endDate);
  const diffTime = end - start;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to validate dates
groupSchema.pre('save', function(next) {
  if (this.schedule.endDate <= this.schedule.startDate) {
    next(new Error('End date must be after start date'));
  }
  
  if (this.pilgrimCount > this.capacity) {
    next(new Error('Pilgrim count cannot exceed group capacity'));
  }
  
  next();
});

// Static method to find active groups
groupSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

// Static method to find groups by current stage
groupSchema.statics.findByStage = function(stage) {
  return this.find({ currentStage: stage, status: 'active' });
};

// Instance method to add milestone
groupSchema.methods.addMilestone = function(milestone) {
  this.milestones.push({
    ...milestone,
    completed: false
  });
  return this.save();
};

// Instance method to complete milestone
groupSchema.methods.completeMilestone = function(milestoneId) {
  const milestone = this.milestones.id(milestoneId);
  if (milestone) {
    milestone.completed = true;
    milestone.actualTime = new Date();
    return this.save();
  }
  throw new Error('Milestone not found');
};

// Instance method to send group alert
groupSchema.methods.sendAlert = function(alertData) {
  this.alerts.push({
    ...alertData,
    createdAt: new Date()
  });
  return this.save();
};

// Instance method to update pilgrim count
groupSchema.methods.updatePilgrimCount = async function() {
  const Pilgrim = mongoose.model('Pilgrim');
  const count = await Pilgrim.countDocuments({ groupId: this._id });
  this.pilgrimCount = count;
  return this.save();
};

const Group = mongoose.model('Group', groupSchema);

export default Group;