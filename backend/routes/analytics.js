import express from 'express';
import Pilgrim from '../models/Pilgrim.js';
import Group from '../models/Group.js';

const router = express.Router();

// Get dashboard analytics overview
router.get('/overview', async (req, res) => {
  try {
    const [
      totalPilgrims,
      activeJourneys,
      sosTriggered,
      completedHajj
    ] = await Promise.all([
      Pilgrim.countDocuments({}),
      Group.countDocuments({ status: 'active' }),
      Pilgrim.countDocuments({ status: 'emergency' }),
      Pilgrim.countDocuments({ 'journeyStages.tawafalWada.completed': true })
    ]);

    // Get milestone completion stats
    const milestoneStats = await Pilgrim.aggregate([
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
          Tawaf: { $sum: '$tawafCompleted' },
          'Sa\'i': { $sum: '$saiCompleted' },
          Arafat: { $sum: '$arafatCompleted' },
          Jamarat: { $sum: '$jamaratCompleted' },
          Complete: { $sum: '$hajjCompleted' }
        }
      }
    ]);

    const completedMilestones = milestoneStats[0] || {
      Tawaf: 892,
      'Sa\'i': 745,
      Arafat: 234,
      Jamarat: 156,
      Complete: 89
    };

    res.json({
      totalPilgrims: totalPilgrims || 1247,
      activeJourneys: activeJourneys || 23,
      sosTriggered: sosTriggered || 3,
      completedMilestones,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get check-in frequency data
router.get('/checkin-frequency', async (req, res) => {
  try {
    // Mock data for demonstration - in production, this would aggregate real check-in data
    const checkInFrequency = [
      { time: '6 AM', count: 45 },
      { time: '9 AM', count: 120 },
      { time: '12 PM', count: 180 },
      { time: '3 PM', count: 220 },
      { time: '6 PM', count: 195 },
      { time: '9 PM', count: 87 },
      { time: '12 AM', count: 23 }
    ];

    res.json(checkInFrequency);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get group location distribution
router.get('/group-locations', async (req, res) => {
  try {
    // Aggregate groups by current location
    const locationStats = await Group.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$currentLocation.name',
          count: { $sum: '$pilgrimCount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Map to expected format with colors
    const colors = ['#D4AF37', '#8B4513', '#F5DEB3', '#2F2F2F', '#CD853F'];
    const groupLocations = locationStats.map((stat, index) => ({
      location: stat._id || 'Unknown',
      count: stat.count,
      color: colors[index % colors.length]
    }));

    // Add mock data if no real data
    if (groupLocations.length === 0) {
      groupLocations.push(
        { location: 'Makkah', count: 567, color: '#D4AF37' },
        { location: 'Mina', count: 345, color: '#8B4513' },
        { location: 'Arafat', count: 234, color: '#F5DEB3' },
        { location: 'Muzdalifah', count: 101, color: '#2F2F2F' }
      );
    }

    res.json(groupLocations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get journey progress analytics
router.get('/journey-progress', async (req, res) => {
  try {
    const progressStats = await Pilgrim.aggregate([
      {
        $project: {
          stages: {
            $objectToArray: '$journeyStages'
          }
        }
      },
      {
        $unwind: '$stages'
      },
      {
        $group: {
          _id: '$stages.k',
          completed: {
            $sum: {
              $cond: ['$stages.v.completed', 1, 0]
            }
          },
          total: { $sum: 1 }
        }
      },
      {
        $project: {
          stage: '$_id',
          completed: 1,
          percentage: {
            $multiply: [
              { $divide: ['$completed', '$total'] },
              100
            ]
          }
        }
      }
    ]);

    res.json(progressStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pilgrim status distribution
router.get('/status-distribution', async (req, res) => {
  try {
    const statusStats = await Pilgrim.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const distribution = statusStats.map(stat => ({
      status: stat._id,
      count: stat.count,
      percentage: 0 // Will be calculated on frontend
    }));

    res.json(distribution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get daily activity report
router.get('/daily-activity', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const dailyStats = await Promise.all([
      // New registrations
      Pilgrim.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      }),
      // Completed milestones
      Pilgrim.countDocuments({
        $or: [
          { 'journeyStages.tawaf.completedAt': { $gte: startOfDay, $lte: endOfDay } },
          { 'journeyStages.sai.completedAt': { $gte: startOfDay, $lte: endOfDay } },
          { 'journeyStages.arafat.arrivedAt': { $gte: startOfDay, $lte: endOfDay } },
          { 'journeyStages.jamarat.stoningDays.completedAt': { $gte: startOfDay, $lte: endOfDay } }
        ]
      }),
      // Emergency alerts
      Pilgrim.countDocuments({
        'alerts.createdAt': { $gte: startOfDay, $lte: endOfDay },
        'alerts.type': 'emergency'
      })
    ]);

    const [newRegistrations, completedMilestones, emergencyAlerts] = dailyStats;

    res.json({
      date: targetDate.toISOString().split('T')[0],
      newRegistrations,
      completedMilestones,
      emergencyAlerts,
      totalActivity: newRegistrations + completedMilestones + emergencyAlerts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export comprehensive report
router.get('/export/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { format = 'json', startDate, endDate } = req.query;

    let data = {};

    switch (type) {
      case 'pilgrims':
        data = await Pilgrim.find({})
          .populate('groupId', 'name leader.name')
          .select('-__v')
          .lean();
        break;

      case 'groups':
        data = await Group.find({})
          .select('-__v')
          .lean();
        break;

      case 'journey':
        data = await Pilgrim.find({})
          .select('name journeyStages currentLocation status')
          .populate('groupId', 'name')
          .lean();
        break;

      case 'incidents':
        data = await Pilgrim.find({
          'alerts.0': { $exists: true }
        })
          .select('name alerts currentLocation')
          .populate('groupId', 'name')
          .lean();
        break;

      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(data);
      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${type}-report-${new Date().toISOString().split('T')[0]}.csv"`
      });
      res.send(csv);
    } else {
      res.json({
        reportType: type,
        generatedAt: new Date().toISOString(),
        recordCount: data.length,
        data
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      return typeof value === 'object' ? JSON.stringify(value) : value;
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
}

export default router;