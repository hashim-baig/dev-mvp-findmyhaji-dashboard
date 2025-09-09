import mongoose from 'mongoose';
import crypto from 'crypto';

const notificationConfigSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomUUID()
  },
  messageType: {
    type: String,
    required: true,
    enum: ['pilgrims', 'providers', 'family'],
    index: true
  },
  messageKey: {
    type: String,
    required: true,
    index: true
  },
  language: {
    type: String,
    required: true,
    enum: ['default', 'en', 'ar', 'ur', 'bn', 'hi'],
    default: 'default',
    index: true
  },
  content: {
    text: {
      type: String,
      required: true,
      trim: true
    },
    variables: [{
      type: String,
      trim: true
    }],
    enabled: {
      type: Boolean,
      default: true
    }
  },
  firebase: {
    title: String,
    body: String,
    data: {
      type: Map,
      of: String,
      default: {}
    },
    android: {
      priority: {
        type: String,
        enum: ['normal', 'high'],
        default: 'high'
      },
      notification: {
        icon: String,
        color: String,
        sound: String,
        channelId: String
      }
    },
    apns: {
      payload: {
        aps: {
          alert: {
            title: String,
            body: String
          },
          badge: Number,
          sound: String,
          category: String
        }
      }
    }
  },
  scheduling: {
    enabled: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['immediate', 'daily', 'weekly', 'custom'],
      default: 'immediate'
    },
    customCron: String,
    timezone: {
      type: String,
      default: 'Asia/Riyadh'
    }
  },
  targeting: {
    userTypes: [{
      type: String,
      enum: ['pilgrim', 'provider', 'family', 'admin']
    }],
    locations: [{
      type: String // e.g., 'makkah', 'madinah', 'global'
    }],
    segments: [{
      type: String // Custom user segments
    }]
  },
  analytics: {
    sent: {
      type: Number,
      default: 0
    },
    delivered: {
      type: Number,
      default: 0
    },
    opened: {
      type: Number,
      default: 0
    },
    clicked: {
      type: Number,
      default: 0
    },
    lastSent: Date
  },
  metadata: {
    category: {
      type: String,
      enum: ['booking', 'location', 'emergency', 'ritual', 'payment', 'general'],
      default: 'general'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    requiresAction: {
      type: Boolean,
      default: false
    },
    expiresAt: Date,
    tags: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for efficient querying
notificationConfigSchema.index({ 
  messageType: 1, 
  messageKey: 1, 
  language: 1 
}, { unique: true });

notificationConfigSchema.index({ 
  'content.enabled': 1, 
  messageType: 1 
});

notificationConfigSchema.index({ 
  'scheduling.enabled': 1, 
  'scheduling.frequency': 1 
});

// Virtual for formatted content with variable replacement
notificationConfigSchema.virtual('formattedText').get(function() {
  return this.content.text;
});

// Method to replace variables in text
notificationConfigSchema.methods.replaceVariables = function(variables = {}) {
  let text = this.content.text;
  
  // Replace variables in format {variable_name}
  Object.keys(variables).forEach(key => {
    const placeholder = `{${key}}`;
    text = text.replace(new RegExp(placeholder, 'g'), variables[key] || '');
  });
  
  return text;
};

// Method to get Firebase message format
notificationConfigSchema.methods.getFirebaseMessage = function(variables = {}, deviceToken) {
  const message = {
    token: deviceToken,
    notification: {
      title: this.firebase.title || 'FindMyHaji',
      body: this.replaceVariables(variables)
    },
    data: {
      messageType: this.messageType,
      messageKey: this.messageKey,
      language: this.language,
      ...Object.fromEntries(this.firebase.data || new Map())
    },
    android: {
      priority: this.firebase.android?.priority || 'high',
      notification: {
        icon: this.firebase.android?.notification?.icon || 'ic_notification',
        color: this.firebase.android?.notification?.color || '#0f4c3a',
        sound: this.firebase.android?.notification?.sound || 'default',
        channelId: this.firebase.android?.notification?.channelId || 'findmyhaji_default'
      }
    },
    apns: {
      payload: {
        aps: {
          alert: {
            title: this.firebase.title || 'FindMyHaji',
            body: this.replaceVariables(variables)
          },
          badge: 1,
          sound: this.firebase.apns?.payload?.aps?.sound || 'default',
          category: this.firebase.apns?.payload?.aps?.category || 'general'
        }
      }
    }
  };

  return message;
};

// Static method to get configuration by type and key
notificationConfigSchema.statics.getConfig = async function(messageType, messageKey, language = 'default') {
  // Try to find specific language config first
  let config = await this.findOne({ messageType, messageKey, language });
  
  // Fallback to default language if specific not found
  if (!config && language !== 'default') {
    config = await this.findOne({ messageType, messageKey, language: 'default' });
  }
  
  return config;
};

// Static method to get all configurations grouped by type
notificationConfigSchema.statics.getAllGrouped = async function() {
  const configs = await this.find({}).lean();
  
  const grouped = {};
  configs.forEach(config => {
    if (!grouped[config.messageType]) {
      grouped[config.messageType] = {};
    }
    if (!grouped[config.messageType][config.messageKey]) {
      grouped[config.messageType][config.messageKey] = {};
    }
    grouped[config.messageType][config.messageKey][config.language] = {
      text: config.content.text,
      enabled: config.content.enabled,
      variables: config.content.variables,
      firebase: config.firebase,
      analytics: config.analytics
    };
  });
  
  return grouped;
};

export default mongoose.model('NotificationConfig', notificationConfigSchema);