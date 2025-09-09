// import jwt from 'jsonwebtoken';

// const userSchema = new mongoose.Schema({
//   id: {
//     type: String,
//     default: uuidv4,
//     unique: true
//   },
//   email: {
//     type: String,
//     required: [true, 'Email is required'],
//     unique: true,
//     lowercase: true,
//     match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
//   },
//   password: {
//     type: String,
//     required: [true, 'Password is required'],
//     minlength: [6, 'Password must be at least 6 characters long'],
//     select: false // Don't include password in queries by default
//   },
//   role: {
//     type: String,
//     enum: ['admin', 'provider', 'customer'],
//     default: 'customer',
//     required: true
//   },
//   profile: {
//     firstName: {
//       type: String,
//       trim: true
//     },
//     lastName: {
//       type: String,
//       trim: true
//     },
//     phone: {
//       type: String,
//       match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
//     },
//     avatar: {
//       type: String // URL to profile picture
//     }
//   },
//   // Reference to role-specific data
//   providerProfile: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Provider'
//   },
//   // Admin specific fields
//   adminProfile: {
//     department: {
//       type: String,
//       enum: ['Operations', 'Management', 'Customer Service', 'Technical', 'Finance']
//     },
//     permissions: [{
//       type: String,
//       enum: [
//         'user_management',
//         'provider_management', 
//         'pilgrim_management',
//         'group_management',
//         'analytics_view',
//         'system_settings',
//         'emergency_response',
//         'financial_reports',
//         'audit_logs'
//       ]
//     }],
//     lastLoginIp: String,
//     loginAttempts: {
//       type: Number,
//       default: 0
//     },
//     lockUntil: Date
//   },
//   // Account status
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   isVerified: {
//     type: Boolean,
//     default: false
//   },
//   emailVerificationToken: String,
//   emailVerifiedAt: Date,
//   passwordResetToken: String,
//   passwordResetExpires: Date,
//   lastLoginAt: Date,
//   lastLoginIp: String,
//   loginHistory: [{
//     loginAt: Date,
//     ip: String,
//     userAgent: String,
//     success: Boolean
//   }],
//   // Security & Preferences
//   twoFactorEnabled: {
//     type: Boolean,
//     default: false
//   },
//   twoFactorSecret: {
//     type: String,
//     select: false
//   },
//   preferences: {
//     language: {
//       type: String,
//       enum: ['en', 'ar', 'ur'],
//       default: 'en'
//     },
//     timezone: {
//       type: String,
//       default: 'Asia/Riyadh'
//     },
//     notifications: {
//       email: {
//         type: Boolean,
//         default: true
//       },
//       sms: {
//         type: Boolean,
//         default: false
//       },
//       push: {
//         type: Boolean,
//         default: true
//       }
//     }
//   }
// }, {
//   timestamps: true,
//   toJSON: { 
//     virtuals: true,
//     transform: function(doc, ret) {
//       delete ret.password;
//       delete ret.twoFactorSecret;
//       delete ret.emailVerificationToken;
//       delete ret.passwordResetToken;
//       return ret;
//     }
//   },
//   toObject: { virtuals: true }
// });

// // Virtual for full name
// userSchema.virtual('fullName').get(function() {
//   if (this.profile.firstName && this.profile.lastName) {
//     return `${this.profile.firstName} ${this.profile.lastName}`;
//   }
//   return this.email;
// });

// // Virtual for account lock status
// userSchema.virtual('isLocked').get(function() {
//   return !!(this.adminProfile?.lockUntil && this.adminProfile.lockUntil > Date.now());
// });

// // Indexes
// userSchema.index({ email: 1 });
// userSchema.index({ role: 1 });
// userSchema.index({ isActive: 1 });
// userSchema.index({ createdAt: -1 });

// // Pre-save middleware to hash password
// userSchema.pre('save', async function(next) {
//   // Only hash the password if it has been modified (or is new)
//   if (!this.isModified('password')) return next();
  
//   try {
//     // Hash password with cost of 12
//     const salt = await bcrypt.genSalt(12);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // Instance method to check password
// userSchema.methods.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// // Instance method to generate JWT token
// userSchema.methods.generateAuthToken = function() {
//   const payload = {
//     id: this.id,
//     email: this.email,
//     role: this.role
//   };
  
//   return jwt.sign(payload, process.env.JWT_SECRET || 'findmyhaji_secret', {
//     expiresIn: '7d'
//   });
// };

// // Instance method to generate password reset token
// userSchema.methods.generatePasswordResetToken = function() {
//   const resetToken = uuidv4();
//   this.passwordResetToken = resetToken;
//   this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
//   return resetToken;
// };

// // Instance method to check permissions
// userSchema.methods.hasPermission = function(permission) {
//   if (this.role === 'admin') {
//     return this.adminProfile?.permissions?.includes(permission) || false;
//   }
//   return false;
// };

// // Instance method to record login
// userSchema.methods.recordLogin = function(ip, userAgent, success = true) {
//   this.lastLoginAt = new Date();
//   this.lastLoginIp = ip;
  
//   // Add to login history (keep only last 50 logins)
//   this.loginHistory.unshift({
//     loginAt: new Date(),
//     ip,
//     userAgent,
//     success
//   });
  
//   if (this.loginHistory.length > 50) {
//     this.loginHistory = this.loginHistory.slice(0, 50);
//   }
  
//   // Reset failed login attempts on successful login
//   if (success && this.adminProfile) {
//     this.adminProfile.loginAttempts = 0;
//     this.adminProfile.lockUntil = undefined;
//   }
  
//   return this.save();
// };

// // Instance method to handle failed login
// userSchema.methods.recordFailedLogin = function() {
//   if (this.role === 'admin' && this.adminProfile) {
//     this.adminProfile.loginAttempts += 1;
    
//     // Lock account after 5 failed attempts
//     if (this.adminProfile.loginAttempts >= 5) {
//       this.adminProfile.lockUntil = Date.now() + (30 * 60 * 1000); // 30 minutes
//     }
    
//     return this.save();
//   }
// };

// // Static method to find by email with password
// userSchema.statics.findByEmailWithPassword = function(email) {
//   return this.findOne({ email }).select('+password');
// };

// // Static method to find active users by role
// userSchema.statics.findActiveByRole = function(role) {
//   return this.find({ role, isActive: true });
// };

// const User = mongoose.model('User', userSchema);

// export default User;

import dbPool from '../db.js';

class User {
  constructor({ id, name, email, role, displayrole, location, avatar }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = displayrole || role; // prefer displayrole if available
    this.location = location;
    // this.avatar = avatar;
  }

  static async findOne(id) {
    const result = await dbPool.query(
      'SELECT * FROM users WHERE id = $1 LIMIT 1',
      [id]
    );
    if (result.rows.length === 0) return null;
    return new User(result.rows[0]);
  }

 static async findAll() {
    const result = await dbPool.query(
      'SELECT id,name,role FROM users'
    );
    return result.rows;
  }
}

export default User;