import express from 'express';
import ConfigurationSettings from '../models/ConfigurationSettings.js';
import { authenticate, authorize } from '../middleware/auth.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// ===== ADMIN ROUTES =====

// GET /api/configurations - Get all configurations
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const configurations = await ConfigurationSettings.getAllConfigurations();
    
    res.json({
      success: true,
      data: configurations
    });
    
  } catch (error) {
    console.error('Error fetching configurations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching configurations',
      error: error.message
    });
  }
});

// GET /api/configurations/:category - Get specific category configuration
router.get('/:category', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { category } = req.params;
    
    const settings = await ConfigurationSettings.getByCategory(category);
    
    res.json({
      success: true,
      data: settings
    });
    
  } catch (error) {
    console.error('Error fetching configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching configuration',
      error: error.message
    });
  }
});

// PUT /api/configurations/update - Update configuration
router.put('/update', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { category, config } = req.body;
    
    if (!category || !config) {
      return res.status(400).json({
        success: false,
        message: 'Category and config are required'
      });
    }
    
    const validCategories = [
      'map-api',
      'firebase-notification', 
      'recaptcha',
      'apple-login',
      'email-config',
      'sms-config',
      'payment-config',
      'storage-config',
      'app-settings',
      'firebase-auth'
    ];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }
    
    const updatedConfig = await ConfigurationSettings.updateByCategory(
      category,
      config,
      req.user
    );
    
    res.json({
      success: true,
      message: 'Configuration updated successfully',
      data: {
        category: updatedConfig.category,
        settings: updatedConfig.getSettingsObject(),
        version: updatedConfig.version,
        lastUpdated: updatedConfig.lastUpdated
      }
    });
    
  } catch (error) {
    console.error('Error updating configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating configuration',
      error: error.message
    });
  }
});

// POST /api/configurations/test-email - Test email configuration
router.post('/test-email', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { email, config } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }
    
    // Use provided config or fetch from database
    let emailConfig = config;
    if (!emailConfig) {
      emailConfig = await ConfigurationSettings.getByCategory('email-config');
    }
    
    if (!emailConfig || !emailConfig.host) {
      return res.status(400).json({
        success: false,
        message: 'Email configuration not found or incomplete'
      });
    }
    
    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: emailConfig.host,
      port: parseInt(emailConfig.port) || 587,
      secure: emailConfig.encryption === 'ssl',
      auth: {
        user: emailConfig.username,
        pass: emailConfig.password
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    // Test email content
    const mailOptions = {
      from: `"${emailConfig.mailerName || 'FindMyHaji'}" <${emailConfig.emailId}>`,
      to: email,
      subject: 'FindMyHaji - Email Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0f4c3a; margin-bottom: 10px;">🕌 FindMyHaji</h1>
            <h2 style="color: #666; font-weight: normal;">Email Configuration Test</h2>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #333;">
              <strong>Congratulations!</strong> Your email configuration is working correctly.
            </p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #0f4c3a; margin-bottom: 15px;">Configuration Details:</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li><strong>SMTP Host:</strong> ${emailConfig.host}</li>
              <li><strong>Port:</strong> ${emailConfig.port}</li>
              <li><strong>Encryption:</strong> ${emailConfig.encryption?.toUpperCase() || 'None'}</li>
              <li><strong>From Email:</strong> ${emailConfig.emailId}</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #888; font-size: 14px; margin: 0;">
              This is an automated test email from FindMyHaji Admin Panel
              <br>
              <em>Sent at ${new Date().toLocaleString()}</em>
            </p>
          </div>
        </div>
      `
    };
    
    // Send test email
    const info = await transporter.sendMail(mailOptions);
    
    res.json({
      success: true,
      message: `Test email sent successfully to ${email}`,
      data: {
        messageId: info.messageId,
        response: info.response
      }
    });
    
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email: ' + error.message
    });
  }
});

// POST /api/configurations/backup/:category - Create backup of specific configuration
router.post('/backup/:category', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { category } = req.params;
    
    const config = await ConfigurationSettings.findOne({ category });
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }
    
    config.createBackup();
    await config.save();
    
    res.json({
      success: true,
      message: 'Backup created successfully',
      data: {
        version: config.version,
        backupCreated: config.lastUpdated
      }
    });
    
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating backup',
      error: error.message
    });
  }
});

// POST /api/configurations/restore/:category - Restore from backup
router.post('/restore/:category', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { category } = req.params;
    
    const config = await ConfigurationSettings.findOne({ category });
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }
    
    const restored = config.restoreFromBackup();
    if (!restored) {
      return res.status(400).json({
        success: false,
        message: 'No backup available to restore'
      });
    }
    
    await config.save();
    
    res.json({
      success: true,
      message: 'Configuration restored from backup',
      data: {
        settings: config.getSettingsObject(),
        restoredAt: config.lastUpdated
      }
    });
    
  } catch (error) {
    console.error('Error restoring from backup:', error);
    res.status(500).json({
      success: false,
      message: 'Error restoring from backup',
      error: error.message
    });
  }
});

// GET /api/configurations/history/:category - Get configuration history
router.get('/history/:category', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { category } = req.params;
    
    const config = await ConfigurationSettings.findOne({ category });
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        category: config.category,
        currentVersion: config.version,
        lastUpdated: config.lastUpdated,
        updatedBy: config.updatedBy,
        hasBackup: config.backup && config.backup.size > 0,
        created: config.createdAt
      }
    });
    
  } catch (error) {
    console.error('Error fetching configuration history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching configuration history',
      error: error.message
    });
  }
});

// ===== PUBLIC ROUTES =====

// GET /api/configurations/public/:category - Get public configuration (limited data)
router.get('/public/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    // Only allow certain categories to be publicly accessible
    const publicCategories = ['app-settings', 'recaptcha'];
    
    if (!publicCategories.includes(category)) {
      return res.status(403).json({
        success: false,
        message: 'This configuration is not publicly accessible'
      });
    }
    
    const settings = await ConfigurationSettings.getByCategory(category);
    
    // Filter sensitive data for public access
    let publicData = {};
    if (category === 'app-settings') {
      publicData = {
        appName: settings.appName,
        appVersion: settings.appVersion,
        appDescription: settings.appDescription,
        supportEmail: settings.supportEmail,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        timezone: settings.timezone,
        dateFormat: settings.dateFormat,
        timeFormat: settings.timeFormat,
        defaultLanguage: settings.defaultLanguage,
        enabledLanguages: settings.enabledLanguages,
        maintenanceMode: settings.maintenanceMode,
        maintenanceMessage: settings.maintenanceMessage,
        forceUpdate: settings.forceUpdate,
        minAppVersion: settings.minAppVersion
      };
    } else if (category === 'recaptcha') {
      publicData = {
        enabled: settings.enabled,
        siteKey: settings.siteKey,
        version: settings.version
      };
    }
    
    res.json({
      success: true,
      data: publicData
    });
    
  } catch (error) {
    console.error('Error fetching public configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching configuration',
      error: error.message
    });
  }
});

export default router;