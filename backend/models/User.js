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
  constructor({ id, firstname, lastname, email, role, displayrole, location, avatar, status, countrycode, mobile }) {
    this.id = id;
    this.firstname = firstname;
    this.lastname = lastname;
    this.email = email;
    this.role = role;
    this.displayrole = displayrole;
    this.location = location;
    this.avatar = avatar;
    this.status = status;
    this.countrycode = countrycode;
    this.mobile = mobile;
  }

  static async findOne({ id, email, phone }) {
    let whereClause = [];
    let values = [];
    let idx = 1;

    if (id) {
      whereClause.push(`id = $${idx++}`);
      values.push(id);
    }
    if (email) {
      whereClause.push(`email = $${idx++}`);
      values.push(email);
    }
    if (phone) {
      whereClause.push(`mobile = $${idx++}`);
      values.push(phone);
    }

    if (whereClause.length === 0) {
      throw new Error('At least one identifier (id, email, or mobile) must be provided');
    }

    const query = `SELECT * FROM users WHERE ${whereClause.join(' OR ')} LIMIT 1`;
    const result = await dbPool.query(query, values);

    if (result.rows.length === 0) return null;
    return new User(result.rows[0]);
  }

  static async findAll() {
    const result = await dbPool.query(
      'SELECT id,firstname,lastname,role FROM users where role != 1',
    );
    return result.rows;
  }
  static async findWithPagination(search, offset, limit) {
    let whereClause = "WHERE role != 1";
    let values = [];
    if (search) {
      whereClause += ` AND (firstname ILIKE $1 OR lastname ILIKE $1 OR mobile ILIKE $1 OR mobile ILIKE $1 OR email ILIKE $1)`;
      values.push(search);
    }
    const totalResult = await dbPool.query(`SELECT COUNT(*) FROM users ${whereClause}`,
      values);
    const totalUsers = parseInt(totalResult.rows[0].count, 10);

    values.push(limit, offset); 
    const result = await dbPool.query(
      `SELECT id, firstname, lastname, email, mobile, created_at, status, countrycode FROM users ${whereClause} ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );
    return { rows: result.rows, totalUsers };
  }
  static async save({ firstName, lastName, email, password, mobile, countrycode, role, created_at, avatar }) {
    const query = `
      INSERT INTO users (firstname, lastname, email, password, mobile, countrycode, role, created_at, avatar)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, firstname, lastname, email, role, mobile, created_at, avatar, countrycode
    `;
    const values = [
      firstName,
      lastName,
      email,
      password,
      mobile,
      countrycode,
      role,
      created_at,
      avatar
    ];
    const result = await dbPool.query(query, values);
    return result.rows[0];
  }
  static async update({where, updateData}) {
    const setClause = Object.keys(updateData)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    const values = Object.values(updateData);
    values.push(where.id);

    const query = `UPDATE users SET ${setClause} WHERE id = $${values.length} RETURNING id, firstname, lastname, email, status, mobile, created_at, countrycode`;
    const result = await dbPool.query(query, values);
    return result.rows[0];
  }
  static async deleteOne(id) {
    const query = 'DELETE FROM users WHERE id = $1';
    const values = [id];
    await dbPool.query(query, values);
    return true;
  }
  static async userExistWithSameEmail({ email, id }) {
    const query = 'SELECT * FROM users WHERE email = $1 AND id != $2 LIMIT 1';
    const values = [email, id];
    const result = await dbPool.query(query, values);
    if (result.rows.length === 0) return null;
    return new User(result.rows[0]);
  }

}

export default User;