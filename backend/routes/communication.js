import express from 'express';
import Group from '../models/Group.js';
import Pilgrim from '../models/Pilgrim.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Mock communication data
const mockCommunications = [
  {
    id: '1',
    type: 'admin_message',
    from: 'Admin Control',
    to: 'All Group Leaders',
    message: 'Weather alert: Light rain expected in Mina area. Please ensure pilgrims have appropriate clothing.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    priority: 'high',
    status: 'sent'
  },
  {
    id: '2',
    type: 'group_chat',
    from: 'Imam Abdullah',
    to: 'Group Alpha',
    message: 'Group meeting at 3 PM near Gate 1. Please gather all members.',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    status: 'delivered'
  },
  {
    id: '3',
    type: 'emergency',
    from: 'Medical Team',
    to: 'Admin Control',
    message: 'Minor injury reported for pilgrim Omar Ibn Khattab. First aid provided, no further action needed.',
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    priority: 'high',
    status: 'acknowledged'
  }
];

// Get communication dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    // Mock statistics
    const stats = {
      totalMessages: 1247,
      messagesSentToday: 89,
      emergencyMessages: 12,
      broadcastMessages: 34,
      groupMessages: 567,
      individualMessages: 634
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent communications
router.get('/recent', async (req, res) => {
  try {
    const { limit = 20, type, priority } = req.query;

    let communications = [...mockCommunications];

    // Filter by type
    if (type) {
      communications = communications.filter(comm => comm.type === type);
    }

    // Filter by priority
    if (priority) {
      communications = communications.filter(comm => comm.priority === priority);
    }

    // Sort by timestamp (newest first)
    communications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(communications.slice(0, parseInt(limit)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message to group
router.post('/groups/:id/message', [
  body('message').notEmpty().trim().isLength({ max: 1000 }),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('type').optional().isIn(['general', 'emergency', 'weather', 'schedule', 'medical'])
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
    const { message, priority = 'medium', type = 'general', sender = 'Admin Control' } = req.body;

    // Validate group exists
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Create message record
    const messageData = {
      id: new Date().getTime().toString(),
      type: 'group_message',
      from: sender,
      to: group.name,
      message,
      priority,
      category: type,
      timestamp: new Date().toISOString(),
      status: 'sent',
      groupId: group._id,
      recipientCount: group.pilgrimCount
    };

    // In production, send actual messages via WhatsApp/Telegram API
    // For now, simulate successful sending

    // Emit real-time notification
    const io = req.app.get('io');
    io.to('operations-center').emit('group-message-sent', messageData);

    res.json({
      message: 'Message sent to group successfully',
      data: messageData,
      recipients: group.pilgrimCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message to individual pilgrim
router.post('/pilgrims/:id/message', [
  body('message').notEmpty().trim().isLength({ max: 1000 }),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('channel').optional().isIn(['sms', 'email', 'app', 'whatsapp'])
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
    const { message, priority = 'medium', channel = 'app', sender = 'Admin Control' } = req.body;

    // Validate pilgrim exists
    const pilgrim = await Pilgrim.findById(id).populate('groupId', 'name');
    if (!pilgrim) {
      return res.status(404).json({ error: 'Pilgrim not found' });
    }

    // Create message record
    const messageData = {
      id: new Date().getTime().toString(),
      type: 'individual_message',
      from: sender,
      to: pilgrim.name,
      message,
      priority,
      channel,
      timestamp: new Date().toISOString(),
      status: 'sent',
      pilgrimId: pilgrim._id,
      groupName: pilgrim.groupId?.name
    };

    // Emit real-time notification
    const io = req.app.get('io');
    io.to('operations-center').emit('individual-message-sent', messageData);

    res.json({
      message: 'Message sent to pilgrim successfully',
      data: messageData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send broadcast message to all groups
router.post('/broadcast', [
  body('message').notEmpty().trim().isLength({ max: 1000 }),
  body('priority').isIn(['low', 'medium', 'high', 'critical']),
  body('type').isIn(['general', 'emergency', 'weather', 'schedule', 'medical']),
  body('targetGroups').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { message, priority, type, targetGroups, sender = 'Operations Center' } = req.body;

    // Build query for target groups
    let query = { status: 'active' };
    if (targetGroups && targetGroups.length > 0) {
      query._id = { $in: targetGroups };
    }

    // Get target groups
    const groups = await Group.find(query).select('name pilgrimCount');
    
    if (groups.length === 0) {
      return res.status(400).json({ error: 'No active groups found' });
    }

    const totalRecipients = groups.reduce((sum, group) => sum + group.pilgrimCount, 0);

    // Create broadcast record
    const broadcastData = {
      id: new Date().getTime().toString(),
      type: 'broadcast',
      from: sender,
      to: 'All Groups',
      message,
      priority,
      category: type,
      timestamp: new Date().toISOString(),
      status: 'sent',
      targetGroups: groups.map(g => ({ id: g._id, name: g.name, pilgrimCount: g.pilgrimCount })),
      totalRecipients
    };

    // In production, send to all groups via messaging APIs
    // For now, simulate successful sending

    // Emit real-time notification
    const io = req.app.get('io');
    io.to('operations-center').emit('broadcast-message-sent', broadcastData);

    res.json({
      message: 'Broadcast message sent successfully',
      data: broadcastData,
      groupsTargeted: groups.length,
      totalRecipients
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send emergency notification
router.post('/emergency', [
  body('message').notEmpty().trim().isLength({ max: 1000 }),
  body('location').optional().notEmpty(),
  body('targetGroups').optional().isArray(),
  body('severity').isIn(['minor', 'major', 'critical'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { message, location, targetGroups, severity, sender = 'Emergency Control' } = req.body;

    // Build query for target groups (all if not specified)
    let query = { status: 'active' };
    if (targetGroups && targetGroups.length > 0) {
      query._id = { $in: targetGroups };
    }

    const groups = await Group.find(query).select('name pilgrimCount currentLocation');
    const totalRecipients = groups.reduce((sum, group) => sum + group.pilgrimCount, 0);

    // Create emergency notification
    const emergencyData = {
      id: new Date().getTime().toString(),
      type: 'emergency',
      from: sender,
      to: targetGroups ? 'Selected Groups' : 'All Groups',
      message,
      location,
      severity,
      timestamp: new Date().toISOString(),
      status: 'sent',
      targetGroups: groups.map(g => ({ 
        id: g._id, 
        name: g.name, 
        pilgrimCount: g.pilgrimCount,
        location: g.currentLocation 
      })),
      totalRecipients
    };

    // Emit real-time emergency notification to all connected clients
    const io = req.app.get('io');
    io.emit('emergency-broadcast', emergencyData);

    res.json({
      message: 'Emergency notification sent successfully',
      data: emergencyData,
      groupsNotified: groups.length,
      totalRecipients
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get group communication history
router.get('/groups/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, page = 1 } = req.query;

    // Validate group exists
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Mock communication history for the group
    const groupHistory = mockCommunications
      .filter(comm => comm.to === group.name || comm.to === 'All Groups')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice((page - 1) * limit, page * limit);

    res.json({
      groupName: group.name,
      communications: groupHistory,
      pagination: {
        currentPage: parseInt(page),
        totalRecords: groupHistory.length,
        hasNext: groupHistory.length === parseInt(limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get communication statistics
router.get('/statistics', async (req, res) => {
  try {
    const { period = '24h' } = req.query;

    // Mock statistics
    const stats = {
      totalMessages: 1247,
      messagesByType: {
        group_message: 567,
        individual_message: 634,
        broadcast: 34,
        emergency: 12
      },
      messagesByPriority: {
        low: 234,
        medium: 789,
        high: 198,
        critical: 26
      },
      messagesByChannel: {
        app: 456,
        sms: 234,
        email: 123,
        whatsapp: 434
      },
      deliveryStats: {
        sent: 1200,
        delivered: 1156,
        failed: 44,
        pending: 47
      },
      responseRate: 78.5,
      averageResponseTime: '4.2 minutes'
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send prayer time reminder
router.post('/prayer-reminder', [
  body('prayerName').isIn(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']),
  body('prayerTime').notEmpty(),
  body('location').optional().notEmpty(),
  body('targetGroups').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { prayerName, prayerTime, location = 'Makkah', targetGroups } = req.body;

    // Build query for target groups
    let query = { status: 'active' };
    if (targetGroups && targetGroups.length > 0) {
      query._id = { $in: targetGroups };
    }

    const groups = await Group.find(query).select('name pilgrimCount');
    const totalRecipients = groups.reduce((sum, group) => sum + group.pilgrimCount, 0);

    const prayerMessage = `🕌 Prayer Time Reminder\n\n${prayerName} prayer time in ${location}: ${prayerTime}\n\nMay Allah accept your prayers. Please proceed to the nearest mosque.`;

    const reminderData = {
      id: new Date().getTime().toString(),
      type: 'prayer_reminder',
      from: 'Operations Center',
      to: targetGroups ? 'Selected Groups' : 'All Groups',
      message: prayerMessage,
      prayerName,
      prayerTime,
      location,
      timestamp: new Date().toISOString(),
      status: 'sent',
      totalRecipients
    };

    // Emit real-time notification
    const io = req.app.get('io');
    io.to('operations-center').emit('prayer-reminder-sent', reminderData);

    res.json({
      message: 'Prayer reminder sent successfully',
      data: reminderData,
      groupsNotified: groups.length,
      totalRecipients
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;