import express from 'express';
import Pilgrim from '../models/Pilgrim.js';
import Group from '../models/Group.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all pilgrims with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      status,
      groupId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (groupId) {
      query.groupId = groupId;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { passportNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query
    const pilgrims = await Pilgrim.find(query)
      .populate('groupId', 'name leader.name currentStage')
      .select('-__v')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Pilgrim.countDocuments(query);

    res.json({
      pilgrims,
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

// Get single pilgrim by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const pilgrim = await Pilgrim.findById(id)
      .populate('groupId', 'name leader currentStage accommodation')
      .populate('createdBy', 'name email');

    if (!pilgrim) {
      return res.status(404).json({ error: 'Pilgrim not found' });
    }

    res.json(pilgrim);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new pilgrim
router.post('/', [
  body('name').notEmpty().trim().isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('phone').matches(/^\+?[\d\s\-\(\)]+$/),
  body('passportNumber').notEmpty().trim().toUpperCase(),
  body('nationality').notEmpty().trim(),
  body('dateOfBirth').isISO8601(),
  body('gender').isIn(['male', 'female']),
  body('groupId').isMongoId(),
  body('arrivalDate').isISO8601(),
  body('departureDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const pilgrimData = req.body;

    // Validate group exists
    const group = await Group.findById(pilgrimData.groupId);
    if (!group) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    // Check group capacity
    if (group.pilgrimCount >= group.capacity) {
      return res.status(400).json({ error: 'Group is at full capacity' });
    }

    // Set default location (Makkah)
    if (!pilgrimData.currentLocation) {
      pilgrimData.currentLocation = {
        type: 'Point',
        coordinates: [39.8262, 21.4225], // Makkah coordinates
        address: 'Makkah, Saudi Arabia'
      };
    }

    // Create pilgrim
    const pilgrim = new Pilgrim(pilgrimData);
    await pilgrim.save();

    // Update group pilgrim count
    await group.updatePilgrimCount();

    res.status(201).json({
      message: 'Pilgrim created successfully',
      pilgrim: await Pilgrim.findById(pilgrim._id).populate('groupId', 'name leader.name')
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        error: `${field} already exists`
      });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update pilgrim
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.__v;
    delete updates.createdAt;
    delete updates.updatedAt;

    const pilgrim = await Pilgrim.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('groupId', 'name leader.name');

    if (!pilgrim) {
      return res.status(404).json({ error: 'Pilgrim not found' });
    }

    res.json({
      message: 'Pilgrim updated successfully',
      pilgrim
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete pilgrim
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const pilgrim = await Pilgrim.findById(id);
    if (!pilgrim) {
      return res.status(404).json({ error: 'Pilgrim not found' });
    }

    await Pilgrim.findByIdAndDelete(id);

    // Update group pilgrim count
    if (pilgrim.groupId) {
      const group = await Group.findById(pilgrim.groupId);
      if (group) {
        await group.updatePilgrimCount();
      }
    }

    res.json({
      message: 'Pilgrim deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update pilgrim journey stage
router.post('/:id/journey/:stage', async (req, res) => {
  try {
    const { id, stage } = req.params;
    const { additionalData = {} } = req.body;

    const pilgrim = await Pilgrim.findById(id).populate('groupId', 'name');
    if (!pilgrim) {
      return res.status(404).json({ error: 'Pilgrim not found' });
    }

    await pilgrim.completeStage(stage, additionalData);

    // Send auto-notification to family
    const io = req.app.get('io');
    io.to('operations-center').emit('journey-milestone-completed', {
      pilgrimId: pilgrim._id,
      pilgrimName: pilgrim.name,
      groupName: pilgrim.groupId?.name,
      stage,
      completedAt: new Date(),
      location: pilgrim.currentLocation
    });

    res.json({
      message: `${stage} stage completed successfully`,
      pilgrim: {
        id: pilgrim._id,
        name: pilgrim.name,
        stage,
        completedAt: new Date(),
        journeyCompletion: pilgrim.journeyCompletion
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pilgrim journey progress
router.get('/:id/journey', async (req, res) => {
  try {
    const { id } = req.params;

    const pilgrim = await Pilgrim.findById(id)
      .select('name journeyStages currentLocation')
      .populate('groupId', 'name currentStage');

    if (!pilgrim) {
      return res.status(404).json({ error: 'Pilgrim not found' });
    }

    const journeyProgress = {
      pilgrimName: pilgrim.name,
      groupName: pilgrim.groupId?.name,
      currentLocation: pilgrim.currentLocation,
      completionPercentage: pilgrim.journeyCompletion,
      stages: pilgrim.journeyStages,
      timeline: generateJourneyTimeline(pilgrim.journeyStages)
    };

    res.json(journeyProgress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add alert for pilgrim
router.post('/:id/alerts', [
  body('type').isIn(['emergency', 'low_battery', 'missed_checkin', 'medical', 'location']),
  body('message').notEmpty().trim()
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
    const { type, message } = req.body;

    const pilgrim = await Pilgrim.findById(id);
    if (!pilgrim) {
      return res.status(404).json({ error: 'Pilgrim not found' });
    }

    pilgrim.alerts.push({
      type,
      message,
      createdAt: new Date()
    });

    // Update status if emergency
    if (type === 'emergency') {
      pilgrim.status = 'emergency';
    }

    await pilgrim.save();

    // Emit real-time alert
    const io = req.app.get('io');
    io.to('operations-center').emit('pilgrim-alert', {
      pilgrimId: pilgrim._id,
      pilgrimName: pilgrim.name,
      alertType: type,
      message,
      location: pilgrim.currentLocation,
      timestamp: new Date()
    });

    res.json({
      message: 'Alert added successfully',
      alert: pilgrim.alerts[pilgrim.alerts.length - 1]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pilgrim statistics
router.get('/statistics/overview', async (req, res) => {
  try {
    const stats = await Promise.all([
      Pilgrim.countDocuments(),
      Pilgrim.countDocuments({ status: 'active' }),
      Pilgrim.countDocuments({ status: 'emergency' }),
      Pilgrim.countDocuments({ status: 'completed' }),
      Pilgrim.countDocuments({ 'deviceInfo.batteryLevel': { $lt: 20 } })
    ]);

    const [total, active, emergency, completed, lowBattery] = stats;

    // Get nationality distribution
    const nationalityStats = await Pilgrim.aggregate([
      { $group: { _id: '$nationality', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get age distribution
    const currentYear = new Date().getFullYear();
    const ageStats = await Pilgrim.aggregate([
      {
        $project: {
          ageGroup: {
            $switch: {
              branches: [
                { case: { $lt: [{ $subtract: [currentYear, { $year: '$dateOfBirth' }] }, 30] }, then: '18-29' },
                { case: { $lt: [{ $subtract: [currentYear, { $year: '$dateOfBirth' }] }, 40] }, then: '30-39' },
                { case: { $lt: [{ $subtract: [currentYear, { $year: '$dateOfBirth' }] }, 50] }, then: '40-49' },
                { case: { $lt: [{ $subtract: [currentYear, { $year: '$dateOfBirth' }] }, 60] }, then: '50-59' },
                { case: { $gte: [{ $subtract: [currentYear, { $year: '$dateOfBirth' }] }, 60] }, then: '60+' }
              ],
              default: 'Unknown'
            }
          }
        }
      },
      { $group: { _id: '$ageGroup', count: { $sum: 1 } } }
    ]);

    res.json({
      overview: {
        total,
        active,
        emergency,
        completed,
        lowBattery
      },
      demographics: {
        nationality: nationalityStats,
        ageGroups: ageStats
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to generate journey timeline
function generateJourneyTimeline(journeyStages) {
  const timeline = [];
  
  Object.entries(journeyStages).forEach(([stage, data]) => {
    if (data.completed && data.completedAt) {
      timeline.push({
        stage,
        completedAt: data.completedAt,
        location: data.location || 'Not specified'
      });
    }
  });
  
  return timeline.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
}

export default router;