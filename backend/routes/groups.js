import express from 'express';
import Group from '../models/Group.js';
import Pilgrim from '../models/Pilgrim.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all groups with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      stage,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (stage) {
      query.currentStage = stage;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'leader.name': { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query
    const groups = await Group.find(query)
      .select('-__v')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Group.countDocuments(query);

    res.json({
      groups,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single group by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Get pilgrims in this group
    const pilgrims = await Pilgrim.find({ groupId: id })
      .select('name email phone status currentLocation journeyStages deviceInfo')
      .limit(100);

    res.json({
      ...group.toObject(),
      pilgrims
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new group
router.post('/', [
  body('name').notEmpty().trim().isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('leader.name').notEmpty().trim(),
  body('leader.phone').matches(/^\+?[\d\s\-\(\)]+$/),
  body('leader.email').optional().isEmail(),
  body('capacity').isInt({ min: 1, max: 500 }),
  body('schedule.startDate').isISO8601(),
  body('schedule.endDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const groupData = req.body;

    // Set default current location if not provided
    if (!groupData.currentLocation) {
      groupData.currentLocation = {
        name: 'Makkah',
        coordinates: [39.8262, 21.4225]
      };
    }

    // Create group
    const group = new Group(groupData);
    await group.save();

    res.status(201).json({
      message: 'Group created successfully',
      group
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Group name already exists'
      });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update group
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.__v;
    delete updates.createdAt;
    delete updates.updatedAt;
    delete updates.pilgrimCount; // This is calculated automatically

    const group = await Group.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({
      message: 'Group updated successfully',
      group
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete group
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if group has pilgrims
    const pilgrimCount = await Pilgrim.countDocuments({ groupId: id });
    if (pilgrimCount > 0) {
      return res.status(400).json({
        error: `Cannot delete group with ${pilgrimCount} pilgrims. Please reassign pilgrims first.`
      });
    }

    const group = await Group.findByIdAndDelete(id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({
      message: 'Group deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update group current stage
router.post('/:id/stage', [
  body('stage').isIn(['preparation', 'travel', 'ihram', 'tawaf', 'sai', 'arafat', 'muzdalifah', 'jamarat', 'completed']),
  body('location').optional().notEmpty()
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
    const { stage, location, coordinates } = req.body;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Update current stage
    group.currentStage = stage;
    
    // Update location if provided
    if (location) {
      group.currentLocation.name = location;
      group.currentLocation.lastUpdated = new Date();
      
      if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
        group.currentLocation.coordinates = coordinates;
      }
    }

    await group.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to('operations-center').emit('group-stage-update', {
      groupId: group._id,
      groupName: group.name,
      stage,
      location: group.currentLocation,
      timestamp: new Date()
    });

    res.json({
      message: 'Group stage updated successfully',
      group: {
        id: group._id,
        name: group.name,
        currentStage: group.currentStage,
        currentLocation: group.currentLocation
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add milestone to group
router.post('/:id/milestones', [
  body('name').notEmpty().trim(),
  body('description').optional().trim(),
  body('scheduledTime').optional().isISO8601(),
  body('location.name').optional().notEmpty(),
  body('location.coordinates').optional().isArray()
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
    const milestoneData = req.body;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    await group.addMilestone(milestoneData);

    res.json({
      message: 'Milestone added successfully',
      milestone: group.milestones[group.milestones.length - 1]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete milestone
router.post('/:id/milestones/:milestoneId/complete', async (req, res) => {
  try {
    const { id, milestoneId } = req.params;
    const { notes } = req.body;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    await group.completeMilestone(milestoneId);
    
    // Add notes if provided
    if (notes) {
      const milestone = group.milestones.id(milestoneId);
      if (milestone) {
        milestone.notes = notes;
        await group.save();
      }
    }

    res.json({
      message: 'Milestone completed successfully',
      milestone: group.milestones.id(milestoneId)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send alert to group
router.post('/:id/alerts', [
  body('type').isIn(['general', 'emergency', 'weather', 'schedule', 'location', 'medical']),
  body('title').notEmpty().trim(),
  body('message').notEmpty().trim(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical'])
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
    const alertData = req.body;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    await group.sendAlert(alertData);

    // Emit real-time alert to all connected clients
    const io = req.app.get('io');
    io.to('operations-center').emit('group-alert', {
      groupId: group._id,
      groupName: group.name,
      ...alertData,
      timestamp: new Date()
    });

    res.json({
      message: 'Alert sent to group successfully',
      alert: group.alerts[group.alerts.length - 1]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get group statistics
router.get('/:id/statistics', async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Get pilgrim statistics for this group
    const pilgrimStats = await Promise.all([
      Pilgrim.countDocuments({ groupId: id }),
      Pilgrim.countDocuments({ groupId: id, status: 'active' }),
      Pilgrim.countDocuments({ groupId: id, status: 'emergency' }),
      Pilgrim.countDocuments({ groupId: id, status: 'completed' }),
      Pilgrim.countDocuments({ groupId: id, 'deviceInfo.batteryLevel': { $lt: 20 } })
    ]);

    const [total, active, emergency, completed, lowBattery] = pilgrimStats;

    // Get journey stage statistics
    const stageStats = await Pilgrim.aggregate([
      { $match: { groupId: group._id } },
      {
        $project: {
          tawafCompleted: { $cond: ['$journeyStages.tawaf.completed', 1, 0] },
          saiCompleted: { $cond: ['$journeyStages.sai.completed', 1, 0] },
          arafatCompleted: { $cond: ['$journeyStages.arafat.completed', 1, 0] },
          jamaratCompleted: { $cond: ['$journeyStages.jamarat.completed', 1, 0] },
          hajjCompleted: { $cond: ['$journeyStages.tawafalWada.completed', 1, 0] }
        }
      },
      {
        $group: {
          _id: null,
          tawaf: { $sum: '$tawafCompleted' },
          sai: { $sum: '$saiCompleted' },
          arafat: { $sum: '$arafatCompleted' },
          jamarat: { $sum: '$jamaratCompleted' },
          hajjComplete: { $sum: '$hajjCompleted' }
        }
      }
    ]);

    const journeyProgress = stageStats[0] || {
      tawaf: 0,
      sai: 0,
      arafat: 0,
      jamarat: 0,
      hajjComplete: 0
    };

    res.json({
      group: {
        id: group._id,
        name: group.name,
        currentStage: group.currentStage,
        occupancyRate: group.occupancyRate,
        daysUntilStart: group.daysUntilStart,
        journeyDuration: group.journeyDuration
      },
      pilgrims: {
        total,
        active,
        emergency,
        completed,
        lowBattery
      },
      journeyProgress,
      milestones: {
        total: group.milestones.length,
        completed: group.milestones.filter(m => m.completed).length,
        pending: group.milestones.filter(m => !m.completed).length
      },
      alerts: {
        total: group.alerts.length,
        recent: group.alerts.filter(a => 
          new Date() - new Date(a.createdAt) < 24 * 60 * 60 * 1000
        ).length
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get groups overview statistics
router.get('/statistics/overview', async (req, res) => {
  try {
    const stats = await Promise.all([
      Group.countDocuments(),
      Group.countDocuments({ status: 'active' }),
      Group.countDocuments({ status: 'completed' }),
      Group.countDocuments({ status: 'emergency' })
    ]);

    const [total, active, completed, emergency] = stats;

    // Get stage distribution
    const stageStats = await Group.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$currentStage', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get capacity utilization
    const capacityStats = await Group.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          totalCapacity: { $sum: '$capacity' },
          totalPilgrims: { $sum: '$pilgrimCount' }
        }
      }
    ]);

    const utilization = capacityStats[0] || { totalCapacity: 0, totalPilgrims: 0 };

    res.json({
      overview: {
        total,
        active,
        completed,
        emergency
      },
      stageDistribution: stageStats,
      capacityUtilization: {
        totalCapacity: utilization.totalCapacity,
        totalPilgrims: utilization.totalPilgrims,
        utilizationRate: utilization.totalCapacity > 0 
          ? Math.round((utilization.totalPilgrims / utilization.totalCapacity) * 100)
          : 0
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;