import mongoose from 'mongoose';

const pilgrimSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: [true, 'Pilgrim name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  passportNumber: {
    type: String,
    required: [true, 'Passport number is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  nationality: {
    type: String,
    required: [true, 'Nationality is required'],
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: [true, 'Gender is required']
  },

  // Hajj Information
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: [true, 'Group assignment is required']
  },
  hajjType: {
    type: String,
    enum: ['hajj', 'umrah'],
    default: 'hajj'
  },
  arrivalDate: {
    type: Date,
    required: [true, 'Arrival date is required']
  },
  departureDate: {
    type: Date,
    required: [true, 'Departure date is required']
  },

  // Current Status
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Location coordinates are required']
    },
    address: {
      type: String,
      trim: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },

  // Journey Progress
  journeyStages: {
    ihram: {
      completed: { type: Boolean, default: false },
      completedAt: Date,
      location: String
    },
    tawaf: {
      completed: { type: Boolean, default: false },
      completedAt: Date,
      rounds: { type: Number, default: 0, max: 7 }
    },
    sai: {
      completed: { type: Boolean, default: false },
      completedAt: Date,
      rounds: { type: Number, default: 0, max: 7 }
    },
    arafat: {
      completed: { type: Boolean, default: false },
      arrivedAt: Date,
      departedAt: Date
    },
    muzdalifah: {
      completed: { type: Boolean, default: false },
      arrivedAt: Date,
      departedAt: Date
    },
    jamarat: {
      completed: { type: Boolean, default: false },
      stoningDays: [{
        day: Number,
        completed: Boolean,
        completedAt: Date
      }]
    },
    tawafalWada: {
      completed: { type: Boolean, default: false },
      completedAt: Date
    }
  },

  // Device & Tracking
  deviceInfo: {
    deviceId: {
      type: String,
      unique: true,
      sparse: true
    },
    batteryLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    signalStrength: {
      type: Number,
      min: 0,
      max: 5,
      default: 5
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    isOnline: {
      type: Boolean,
      default: true
    }
  },

  // Health & Emergency
  healthInfo: {
    medicalConditions: [String],
    medications: [String],
    allergies: [String],
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    }
  },

  // Family Connections
  familyContacts: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    relationship: {
      type: String,
      required: true,
      enum: ['spouse', 'parent', 'child', 'sibling', 'other']
    },
    phone: {
      type: String,
      required: true
    },
    email: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],

  // Status & Alerts
  status: {
    type: String,
    enum: ['active', 'inactive', 'emergency', 'completed', 'low_battery'],
    default: 'active'
  },
  alerts: [{
    type: {
      type: String,
      enum: ['emergency', 'low_battery', 'missed_checkin', 'medical', 'location']
    },
    message: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    resolved: {
      type: Boolean,
      default: false
    },
    resolvedAt: Date
  }],

  // Metadata
  createdBy: {
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
pilgrimSchema.index({ 'currentLocation': '2dsphere' });
pilgrimSchema.index({ groupId: 1, status: 1 });
pilgrimSchema.index({ email: 1 });
pilgrimSchema.index({ passportNumber: 1 });
pilgrimSchema.index({ 'deviceInfo.deviceId': 1 });
pilgrimSchema.index({ createdAt: -1 });

// Virtual for age
pilgrimSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
});

// Virtual for journey completion percentage
pilgrimSchema.virtual('journeyCompletion').get(function() {
  const stages = Object.keys(this.journeyStages);
  const completedStages = stages.filter(stage => this.journeyStages[stage].completed);
  return Math.round((completedStages.length / stages.length) * 100);
});

// Pre-save middleware
pilgrimSchema.pre('save', function(next) {
  // Update lastSeen when location changes
  if (this.isModified('currentLocation')) {
    this.currentLocation.lastUpdated = new Date();
    this.deviceInfo.lastSeen = new Date();
  }
  
  next();
});

// Static method to find pilgrims near a location
pilgrimSchema.statics.findNearby = function(longitude, latitude, maxDistance = 1000) {
  return this.find({
    currentLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    }
  });
};

// Instance method to send emergency alert
pilgrimSchema.methods.sendEmergencyAlert = function(message) {
  this.alerts.push({
    type: 'emergency',
    message: message || 'Emergency alert triggered',
    createdAt: new Date()
  });
  this.status = 'emergency';
  return this.save();
};

// Instance method to update journey stage
pilgrimSchema.methods.completeStage = function(stageName, additionalData = {}) {
  if (this.journeyStages[stageName]) {
    this.journeyStages[stageName].completed = true;
    this.journeyStages[stageName].completedAt = new Date();
    
    // Add any additional data
    Object.assign(this.journeyStages[stageName], additionalData);
    
    return this.save();
  }
  throw new Error(`Invalid journey stage: ${stageName}`);
};

const Pilgrim = mongoose.model('Pilgrim', pilgrimSchema);

export default Pilgrim;