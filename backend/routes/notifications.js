import express from 'express';
import NotificationConfig from '../models/NotificationConfig.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Default notification templates
const defaultTemplates = {
  pilgrims: {
    booking_placed: {
      text: 'Your booking has been successfully placed. Reference: {booking_id}',
      variables: ['{booking_id}', '{service_name}', '{date}'],
      firebase: {
        title: 'Booking Placed',
        android: {
          priority: 'high',
          notification: {
            icon: 'ic_booking',
            color: '#0f4c3a',
            channelId: 'booking_updates'
          }
        }
      }
    },
    booking_accepted: {
      text: 'Great news! Your booking for {service_name} has been accepted.',
      variables: ['{booking_id}', '{service_name}', '{provider_name}', '{date}'],
      firebase: {
        title: 'Booking Accepted',
        android: {
          priority: 'high',
          notification: {
            icon: 'ic_check',
            color: '#10b981',
            channelId: 'booking_updates'
          }
        }
      }
    },
    booking_ongoing: {
      text: 'Your service {service_name} is now active. Safe travels!',
      variables: ['{service_name}', '{location}', '{duration}'],
      firebase: {
        title: 'Service Active',
        android: {
          notification: {
            channelId: 'service_updates'
          }
        }
      }
    },
    booking_complete: {
      text: 'Your service has been completed successfully. Barakallahu feeki!',
      variables: ['{service_name}', '{rating_link}'],
      firebase: {
        title: 'Service Completed'
      }
    },
    booking_cancelled: {
      text: 'Your booking for {service_name} has been cancelled. Refund will be processed.',
      variables: ['{booking_id}', '{service_name}', '{reason}'],
      firebase: {
        title: 'Booking Cancelled',
        android: {
          notification: {
            color: '#ef4444'
          }
        }
      }
    },
    schedule_change: {
      text: 'Schedule update: Your {service_name} time has changed to {new_time}.',
      variables: ['{service_name}', '{new_time}', '{old_time}'],
      firebase: {
        title: 'Schedule Changed'
      }
    },
    group_leader_assigned: {
      text: 'You have been assigned to group {group_name}. Leader: {leader_name}',
      variables: ['{group_name}', '{leader_name}', '{contact}'],
      firebase: {
        title: 'Group Assignment'
      }
    },
    otp_verification: {
      text: 'Your FindMyHaji verification code is: {otp}. Valid for 5 minutes.',
      variables: ['{otp}', '{expiry_time}'],
      firebase: {
        title: 'Verification Code',
        android: {
          priority: 'high'
        }
      }
    },
    daily_tip: {
      text: 'Daily Reminder: {tip_content} - May Allah accept your pilgrimage.',
      variables: ['{tip_content}', '{prayer_time}'],
      firebase: {
        title: 'Daily Reminder'
      }
    },
    add_funds: {
      text: 'Funds added successfully! New balance: {balance} SAR',
      variables: ['{amount}', '{balance}', '{transaction_id}'],
      firebase: {
        title: 'Funds Added'
      }
    },
    payment_approved: {
      text: 'Your offline payment of {amount} SAR has been approved.',
      variables: ['{amount}', '{payment_method}', '{reference}'],
      firebase: {
        title: 'Payment Approved'
      }
    },
    custom_support: {
      text: 'Support team will contact you within 30 minutes regarding: {issue}',
      variables: ['{issue}', '{priority}', '{eta}'],
      firebase: {
        title: 'Support Request'
      }
    },
    location_updated: {
      text: 'Your location has been shared with family. Current: {location}',
      variables: ['{location}', '{time}', '{accuracy}'],
      firebase: {
        title: 'Location Shared'
      }
    },
    lost_pilgrim: {
      text: 'URGENT: Please confirm your safety. Emergency contacts notified.',
      variables: ['{last_location}', '{emergency_contact}', '{help_number}'],
      firebase: {
        title: 'Emergency Alert',
        android: {
          priority: 'high',
          notification: {
            color: '#dc2626'
          }
        }
      }
    }
  },
  providers: {
    new_booking: {
      text: 'New booking request for {service_name} from {pilgrim_name}.',
      variables: ['{pilgrim_name}', '{service_name}', '{date}', '{amount}'],
      firebase: {
        title: 'New Booking Request'
      }
    },
    booking_confirmed: {
      text: 'Booking confirmed for {pilgrim_name}. Service starts at {time}.',
      variables: ['{pilgrim_name}', '{time}', '{location}'],
      firebase: {
        title: 'Booking Confirmed'
      }
    },
    payment_received: {
      text: 'Payment of {amount} SAR received for booking {booking_id}.',
      variables: ['{amount}', '{booking_id}', '{commission}'],
      firebase: {
        title: 'Payment Received'
      }
    },
    rating_received: {
      text: 'New {stars}-star rating from {pilgrim_name}: "{review}"',
      variables: ['{stars}', '{pilgrim_name}', '{review}'],
      firebase: {
        title: 'New Rating'
      }
    },
    profile_update: {
      text: 'Please update your profile documents for continued service.',
      variables: ['{missing_docs}', '{deadline}'],
      firebase: {
        title: 'Profile Update Required'
      }
    }
  },
  family: {
    pilgrim_arrived: {
      text: '{pilgrim_name} has arrived safely in {location}. Alhamdulillah!',
      variables: ['{pilgrim_name}', '{location}', '{time}'],
      firebase: {
        title: 'Safe Arrival'
      }
    },
    location_update: {
      text: '{pilgrim_name} is currently at {location}. Last updated: {time}',
      variables: ['{pilgrim_name}', '{location}', '{time}', '{activity}'],
      firebase: {
        title: 'Location Update'
      }
    },
    emergency_alert: {
      text: 'URGENT: {pilgrim_name} needs assistance at {location}. Contact: {number}',
      variables: ['{pilgrim_name}', '{location}', '{number}', '{situation}'],
      firebase: {
        title: 'EMERGENCY ALERT',
        android: {
          priority: 'high'
        }
      }
    },
    ritual_completed: {
      text: '{pilgrim_name} has completed {ritual_name}. May Allah accept it!',
      variables: ['{pilgrim_name}', '{ritual_name}', '{location}', '{time}'],
      firebase: {
        title: 'Ritual Completed'
      }
    },
    journey_complete: {
      text: 'Alhamdulillah! {pilgrim_name} has completed their pilgrimage successfully.',
      variables: ['{pilgrim_name}', '{completion_date}', '{return_flight}'],
      firebase: {
        title: 'Journey Complete'
      }
    }
  }
};

// ===== ADMIN ROUTES =====

// GET /api/notifications/admin/config - Get all notification configurations
router.get('/admin/config', authenticate, authorize('admin'), async (req, res) => {
  try {
    const configs = await NotificationConfig.getAllGrouped();
    
    res.json({
      success: true,
      data: configs
    });
    
  } catch (error) {
    console.error('Error fetching notification configs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification configurations',
      error: error.message
    });
  }
});

// PUT /api/notifications/admin/update - Update notification configuration
router.put('/admin/update', authenticate, authorize('admin'), async (req, res) => {
  try {
    const {
      messageType,
      messageKey,
      language = 'default',
      text,
      enabled = true,
      firebase = {},
      scheduling = {},
      targeting = {}
    } = req.body;

    // Validate required fields
    if (!messageType || !messageKey || !text) {
      return res.status(400).json({
        success: false,
        message: 'MessageType, messageKey, and text are required'
      });
    }

    // Get default template for variables
    const defaultTemplate = defaultTemplates[messageType]?.[messageKey];
    const variables = defaultTemplate?.variables || [];

    // Find existing config or create new
    let config = await NotificationConfig.findOne({
      messageType,
      messageKey,
      language
    });

    if (config) {
      // Update existing
      config.content.text = text;
      config.content.enabled = enabled;
      config.content.variables = variables;
      if (Object.keys(firebase).length > 0) {
        config.firebase = { ...config.firebase, ...firebase };
      }
      if (Object.keys(scheduling).length > 0) {
        config.scheduling = { ...config.scheduling, ...scheduling };
      }
      if (Object.keys(targeting).length > 0) {
        config.targeting = { ...config.targeting, ...targeting };
      }
    } else {
      // Create new
      config = new NotificationConfig({
        messageType,
        messageKey,
        language,
        content: {
          text,
          enabled,
          variables
        },
        firebase: {
          ...defaultTemplate?.firebase,
          ...firebase
        },
        scheduling,
        targeting
      });
    }

    await config.save();

    res.json({
      success: true,
      message: 'Notification configuration updated successfully',
      data: config
    });

  } catch (error) {
    console.error('Error updating notification config:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification configuration',
      error: error.message
    });
  }
});

// POST /api/notifications/admin/init-defaults - Initialize default templates
router.post('/admin/init-defaults', authenticate, authorize('admin'), async (req, res) => {
  try {
    let createdCount = 0;
    
    for (const [messageType, templates] of Object.entries(defaultTemplates)) {
      for (const [messageKey, template] of Object.entries(templates)) {
        // Check if default config exists
        const existingConfig = await NotificationConfig.findOne({
          messageType,
          messageKey,
          language: 'default'
        });

        if (!existingConfig) {
          const config = new NotificationConfig({
            messageType,
            messageKey,
            language: 'default',
            content: {
              text: template.text,
              enabled: true,
              variables: template.variables || []
            },
            firebase: template.firebase || {}
          });

          await config.save();
          createdCount++;
        }
      }
    }

    res.json({
      success: true,
      message: `Initialized ${createdCount} default notification templates`,
      data: { createdCount }
    });

  } catch (error) {
    console.error('Error initializing defaults:', error);
    res.status(500).json({
      success: false,
      message: 'Error initializing default templates',
      error: error.message
    });
  }
});

// DELETE /api/notifications/admin/:id - Delete notification config
router.delete('/admin/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const config = await NotificationConfig.findOneAndDelete({ id });
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Notification configuration not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification configuration deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting notification config:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification configuration',
      error: error.message
    });
  }
});

// ===== PUBLIC ROUTES =====

// GET /api/notifications/config/:messageType/:messageKey - Get specific config (for app usage)
router.get('/config/:messageType/:messageKey', async (req, res) => {
  try {
    const { messageType, messageKey } = req.params;
    const { language = 'default' } = req.query;
    
    const config = await NotificationConfig.getConfig(messageType, messageKey, language);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Notification configuration not found'
      });
    }

    res.json({
      success: true,
      data: {
        text: config.content.text,
        enabled: config.content.enabled,
        variables: config.content.variables
      }
    });

  } catch (error) {
    console.error('Error fetching notification config:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification configuration',
      error: error.message
    });
  }
});

export default router;