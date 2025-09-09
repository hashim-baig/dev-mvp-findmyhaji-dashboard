import express from 'express';
import Pilgrim from '../models/Pilgrim.js';
import Group from '../models/Group.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get emergency dashboard overview
router.get('/dashboard', async (req, res) => {
  try {
    const [
      activeEmergencies,
      resolvedToday,
      totalAlerts,
      lowBatteryAlerts,
      missedCheckins
    ] = await Promise.all([
      Pilgrim.countDocuments({ status: 'emergency' }),
      Pilgrim.countDocuments({
        'alerts.resolvedAt': {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }),
      Pilgrim.countDocuments({ 'alerts.0': { $exists: true } }),
      Pilgrim.countDocuments({ status: 'low_battery' }),
      Pilgrim.countDocuments({
        'deviceInfo.lastSeen': {
          $lt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        status: 'active'
      })
    ]);

    res.json({
      activeEmergencies,
      resolvedToday,
      totalAlerts,
      lowBatteryAlerts,
      missedCheckins,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active emergency alerts
router.get('/active', async (req, res) => {
  try {
    const { limit = 20, priority, type } = req.query;

    let query = {
      $or: [
        { status: 'emergency' },
        { 'alerts.resolved': false }
      ]
    };

    const pilgrims = await Pilgrim.find(query)
      .populate('groupId', 'name leader.name leader.phone')
      .select('name currentLocation alerts status deviceInfo phone')
      .sort({ 'alerts.createdAt': -1 })
      .limit(parseInt(limit));

    // Format emergency data
    const emergencies = [];
    pilgrims.forEach(pilgrim => {
      pilgrim.alerts.forEach(alert => {
        if (!alert.resolved) {
          emergencies.push({
            id: alert._id,
            pilgrimId: pilgrim._id,
            pilgrimName: pilgrim.name,
            pilgrimPhone: pilgrim.phone,
            groupName: pilgrim.groupId?.name,
            groupLeader: pilgrim.groupId?.leader?.name,
            groupLeaderPhone: pilgrim.groupId?.leader?.phone,
            alertType: alert.type,
            message: alert.message,
            location: pilgrim.currentLocation,
            deviceInfo: pilgrim.deviceInfo,
            createdAt: alert.createdAt,
            severity: getSeverityLevel(alert.type, pilgrim.status),
            timeElapsed: getTimeElapsed(alert.createdAt)
          });
        }
      });
    });

    // Sort by severity and time
    emergencies.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json(emergencies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trigger emergency alert for pilgrim
router.post('/pilgrims/:id/alert', [
  body('type').isIn(['emergency', 'medical', 'location', 'security', 'weather']),
  body('message').notEmpty().trim(),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('coordinates').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { type, message, severity = 'high', coordinates, reportedBy = 'System' } = req.body;

    const pilgrim = await Pilgrim.findById(id)
      .populate('groupId', 'name leader communicationChannels');

    if (!pilgrim) {
      return res.status(404).json({ error: 'Pilgrim not found' });
    }

    // Create emergency alert
    const alert = {
      type,
      message,
      createdAt: new Date(),
      resolved: false,
      severity,
      reportedBy
    };

    pilgrim.alerts.push(alert);

    // Update pilgrim status based on alert type
    if (type === 'emergency' || type === 'medical') {
      pilgrim.status = 'emergency';
    }

    // Update location if coordinates provided
    if (coordinates && coordinates.length === 2) {
      pilgrim.currentLocation.coordinates = coordinates;
      pilgrim.currentLocation.lastUpdated = new Date();
    }

    await pilgrim.save();

    // Create emergency response data
    const emergencyData = {
      alertId: alert._id || pilgrim.alerts[pilgrim.alerts.length - 1]._id,
      pilgrimId: pilgrim._id,
      pilgrimName: pilgrim.name,
      pilgrimPhone: pilgrim.phone,
      groupName: pilgrim.groupId?.name,
      groupLeader: pilgrim.groupId?.leader?.name,
      groupLeaderPhone: pilgrim.groupId?.leader?.phone,
      alertType: type,
      message,
      severity,
      location: pilgrim.currentLocation,
      deviceInfo: pilgrim.deviceInfo,
      emergencyNumbers: pilgrim.groupId?.communicationChannels?.emergencyNumbers || [],
      timestamp: new Date().toISOString()
    };

    // Emit real-time emergency notification
    const io = req.app.get('io');
    io.emit('emergency-alert-triggered', emergencyData);

    // Auto-notify relevant parties
    await notifyEmergencyContacts(emergencyData);

    res.json({
      message: 'Emergency alert triggered successfully',
      alert: emergencyData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resolve emergency alert
router.post('/alerts/:alertId/resolve', [
  body('resolution').notEmpty().trim(),
  body('resolvedBy').notEmpty().trim(),
  body('actionsTaken').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { alertId } = req.params;
    const { resolution, resolvedBy, actionsTaken = [] } = req.body;

    // Find pilgrim with this alert
    const pilgrim = await Pilgrim.findOne({ 'alerts._id': alertId })
      .populate('groupId', 'name leader.name');

    if (!pilgrim) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    // Find and resolve the alert
    const alert = pilgrim.alerts.id(alertId);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    alert.resolved = true;
    alert.resolvedAt = new Date();
    alert.resolution = resolution;
    alert.resolvedBy = resolvedBy;
    alert.actionsTaken = actionsTaken;

    // Check if pilgrim has any other unresolved alerts
    const hasOtherAlerts = pilgrim.alerts.some(a => 
      !a.resolved && a._id.toString() !== alertId
    );

    // Update status if no other alerts
    if (!hasOtherAlerts && pilgrim.status === 'emergency') {
      pilgrim.status = 'active';
    }

    await pilgrim.save();

    // Emit real-time resolution notification
    const io = req.app.get('io');
    io.to('operations-center').emit('emergency-resolved', {
      alertId,
      pilgrimId: pilgrim._id,
      pilgrimName: pilgrim.name,
      groupName: pilgrim.groupId?.name,
      resolution,
      resolvedBy,
      resolvedAt: alert.resolvedAt
    });

    res.json({
      message: 'Emergency alert resolved successfully',
      alert: {
        id: alertId,
        pilgrimName: pilgrim.name,
        resolution,
        resolvedBy,
        resolvedAt: alert.resolvedAt,
        actionsTaken
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get emergency statistics
router.get('/statistics', async (req, res) => {
  try {
    const { period = '24h' } = req.query;

    // Calculate time range
    let startDate;
    switch (period) {
      case '1h':
        startDate = new Date(Date.now() - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    // Get alert statistics
    const alertStats = await Pilgrim.aggregate([
      { $unwind: '$alerts' },
      { $match: { 'alerts.createdAt': { $gte: startDate } } },
      {
        $group: {
          _id: '$alerts.type',
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: ['$alerts.resolved', 1, 0] }
          },
          averageResolutionTime: {
            $avg: {
              $cond: [
                '$alerts.resolved',
                {
                  $subtract: ['$alerts.resolvedAt', '$alerts.createdAt']
                },
                null
              ]
            }
          }
        }
      }
    ]);

    // Get response time statistics
    const responseStats = await Pilgrim.aggregate([
      { $unwind: '$alerts' },
      { $match: { 
        'alerts.createdAt': { $gte: startDate },
        'alerts.resolved': true 
      }},
      {
        $group: {
          _id: null,
          averageResponseTime: {
            $avg: {
              $subtract: ['$alerts.resolvedAt', '$alerts.createdAt']
            }
          },
          fastestResponse: {
            $min: {
              $subtract: ['$alerts.resolvedAt', '$alerts.createdAt']
            }
          },
          slowestResponse: {
            $max: {
              $subtract: ['$alerts.resolvedAt', '$alerts.createdAt']
            }
          }
        }
      }
    ]);

    const responseData = responseStats[0] || {
      averageResponseTime: 0,
      fastestResponse: 0,
      slowestResponse: 0
    };

    res.json({
      period,
      alertsByType: alertStats,
      responseMetrics: {
        averageResponseTime: Math.round(responseData.averageResponseTime / (1000 * 60)), // minutes
        fastestResponse: Math.round(responseData.fastestResponse / (1000 * 60)), // minutes
        slowestResponse: Math.round(responseData.slowestResponse / (1000 * 60)), // minutes
      },
      totalAlerts: alertStats.reduce((sum, stat) => sum + stat.count, 0),
      resolvedAlerts: alertStats.reduce((sum, stat) => sum + stat.resolved, 0),
      resolutionRate: alertStats.length > 0 
        ? Math.round((alertStats.reduce((sum, stat) => sum + stat.resolved, 0) / 
           alertStats.reduce((sum, stat) => sum + stat.count, 0)) * 100)
        : 0,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get emergency response protocols
router.get('/protocols', async (req, res) => {
  try {
    const protocols = {
      medical: {
        name: 'Medical Emergency',
        steps: [
          'Assess the situation and ensure scene safety',
          'Call local emergency services (997 for ambulance)',
          'Notify group leader and medical officer',
          'Provide first aid if trained',
          'Stay with pilgrim until help arrives',
          'Document incident details',
          'Follow up with family notification'
        ],
        contacts: [
          { name: 'Saudi Red Crescent', number: '997' },
          { name: 'Hajj Medical Services', number: '+966-12-542-0000' }
        ]
      },
      lost: {
        name: 'Lost Pilgrim',
        steps: [
          'Check last known location via GPS',
          'Contact pilgrim via all available channels',
          'Notify group leader and assistants',
          'Check common gathering points',
          'Coordinate with other group leaders',
          'Contact local authorities if needed',
          'Update family with status'
        ],
        contacts: [
          { name: 'Hajj Security', number: '+966-12-542-1000' },
          { name: 'Lost & Found Center', number: '+966-12-542-2000' }
        ]
      },
      crowd: {
        name: 'Crowd Control Emergency',
        steps: [
          'Stay calm and follow crowd flow',
          'Move to designated safe areas',
          'Avoid going against crowd movement',
          'Help elderly and disabled pilgrims',
          'Follow instructions from authorities',
          'Report to group leader when safe',
          'Document any injuries or incidents'
        ],
        contacts: [
          { name: 'Crowd Control Center', number: '+966-12-542-3000' },
          { name: 'Emergency Coordination', number: '911' }
        ]
      }
    };

    res.json(protocols);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
function getSeverityLevel(alertType, pilgrimStatus) {
  if (alertType === 'emergency' || pilgrimStatus === 'emergency') return 'critical';
  if (alertType === 'medical') return 'high';
  if (alertType === 'location') return 'medium';
  if (alertType === 'low_battery') return 'low';
  return 'medium';
}

function getTimeElapsed(createdAt) {
  const now = new Date();
  const elapsed = now - new Date(createdAt);
  const minutes = Math.floor(elapsed / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ago`;
  }
  return `${minutes}m ago`;
}

async function notifyEmergencyContacts(emergencyData) {
  // In production, this would send notifications via:
  // - SMS to group leader
  // - WhatsApp to group chat
  // - Email to emergency contacts
  // - Push notifications to admin app
  
  console.log('🚨 Emergency Notification Sent:', {
    pilgrim: emergencyData.pilgrimName,
    type: emergencyData.alertType,
    severity: emergencyData.severity,
    location: emergencyData.location?.address
  });
}

export default router;