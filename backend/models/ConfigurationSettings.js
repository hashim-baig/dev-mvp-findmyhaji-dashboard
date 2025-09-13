// import mongoose from 'mongoose';
// import crypto from 'crypto';

// const configurationSettingsSchema = new mongoose.Schema({
//   id: {
//     type: String,
//     required: true,
//     unique: true,
//     default: () => crypto.randomUUID()
//   },
//   category: {
//     type: String,
//     required: true,
//     enum: [
//       'map-api',
//       'firebase-notification', 
//       'recaptcha',
//       'apple-login',
//       'email-config',
//       'sms-config',
//       'payment-config',
//       'storage-config',
//       'app-settings',
//       'firebase-auth'
//     ],
//     index: true
//   },
//   settings: {
//     type: Map,
//     of: mongoose.Schema.Types.Mixed,
//     default: {}
//   },
//   enabled: {
//     type: Boolean,
//     default: false
//   },
//   lastUpdated: {
//     type: Date,
//     default: Date.now
//   },
//   updatedBy: {
//     userId: String,
//     userName: String,
//     userEmail: String
//   },
//   version: {
//     type: Number,
//     default: 1
//   },
//   environment: {
//     type: String,
//     enum: ['development', 'staging', 'production'],
//     default: 'production'
//   },
//   backup: {
//     type: Map,
//     of: mongoose.Schema.Types.Mixed,
//     default: {}
//   }
// }, {
//   timestamps: true,
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true }
// });

// // Compound unique index for category
// configurationSettingsSchema.index({ category: 1 }, { unique: true });

// // Method to backup current settings before update
// configurationSettingsSchema.methods.createBackup = function() {
//   this.backup = new Map(this.settings);
//   this.version = this.version + 1;
//   this.lastUpdated = new Date();
// };

// // Method to restore from backup
// configurationSettingsSchema.methods.restoreFromBackup = function() {
//   if (this.backup && this.backup.size > 0) {
//     this.settings = new Map(this.backup);
//     this.lastUpdated = new Date();
//     return true;
//   }
//   return false;
// };

// // Method to get specific setting
// configurationSettingsSchema.methods.getSetting = function(key) {
//   return this.settings.get(key);
// };

// // Method to set specific setting
// configurationSettingsSchema.methods.setSetting = function(key, value) {
//   this.settings.set(key, value);
//   this.lastUpdated = new Date();
// };

// // Method to get all settings as plain object
// configurationSettingsSchema.methods.getSettingsObject = function() {
//   const obj = {};
//   for (let [key, value] of this.settings) {
//     obj[key] = value;
//   }
//   return obj;
// };

// // Static method to get configuration by category
// configurationSettingsSchema.statics.getByCategory = async function(category) {
//   const config = await this.findOne({ category });
//   return config ? config.getSettingsObject() : {};
// };

// // Static method to update configuration
// configurationSettingsSchema.statics.updateByCategory = async function(category, settings, user) {
//   let config = await this.findOne({ category });
  
//   if (!config) {
//     config = new this({
//       category,
//       settings: new Map(Object.entries(settings)),
//       updatedBy: {
//         userId: user.id,
//         userName: user.name || user.firstName + ' ' + user.lastName,
//         userEmail: user.email
//       }
//     });
//   } else {
//     // Create backup before updating
//     config.createBackup();
    
//     // Update settings
//     config.settings = new Map(Object.entries(settings));
//     config.updatedBy = {
//       userId: user.id,
//       userName: user.name || user.firstName + ' ' + user.lastName,
//       userEmail: user.email
//     };
//   }
  
//   await config.save();
//   return config;
// };

// // Static method to get all configurations
// configurationSettingsSchema.statics.getAllConfigurations = async function() {
//   const configs = await this.find({}).lean();
//   const result = {};
  
//   configs.forEach(config => {
//     result[config.category] = {
//       settings: Object.fromEntries(config.settings),
//       enabled: config.enabled,
//       lastUpdated: config.lastUpdated,
//       version: config.version
//     };
//   });
  
//   return result;
// };

// // Pre-save hook to update lastUpdated
// configurationSettingsSchema.pre('save', function(next) {
//   this.lastUpdated = new Date();
//   next();
// });

// export default mongoose.model('ConfigurationSettings', configurationSettingsSchema);

import dbPool from '../db.js';

class ConfigurationSettings {
  constructor({ id, client_key, status}) {
    this.id = id;
    this.client_key = client_key;
    this.status = status;
  }

  static async findAll(table) {
    const result = await dbPool.query(
      `SELECT * FROM ${table}`,
    );
    return result.rows[0];
  }
  static async update(table, { where, updateData }) {
    const setClause = Object.keys(updateData)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    const values = Object.values(updateData);
    values.push(where.id); // Assuming 'id' is the primary key

    const query = `UPDATE ${table} SET ${setClause} WHERE id = $${values.length} RETURNING *`;
    const result = await dbPool.query(query, values);
    return result.rows[0];
  }

}

export default ConfigurationSettings;