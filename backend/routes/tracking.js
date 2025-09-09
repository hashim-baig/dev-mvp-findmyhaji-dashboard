import express from 'express';
import Pilgrim from '../models/Pilgrim.js';
import Group from '../models/Group.js';

const router = express.Router();

// Get real-time tracking overview
router.get('/overview', async (req, res) => {
  try {
    const totalActivePilgrims = await Pilgrim.countDocuments({ status: 'active' });
    const activeGroups = await Group.countDocuments({ status: 'active' });
    const emergencyAlerts = await Pilgrim.countDocuments({ status: 'emergency' });
    
    res.json({
      totalActivePilgrims,
      activeGroups,
      emergencyAlerts,
      lastUpdate: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get live pilgrim locations
router.get('/pilgrims/locations', async (req, res) => {
  try {
    const { group, stage, status } = req.query;
    
    let query = {};
    
    if (group && group !== 'all') {
      const groupDoc = await Group.findOne({ name: group });
      if (groupDoc) {
        query.groupId = groupDoc._id;
      }
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const pilgrims = await Pilgrim.find(query)
      .populate('groupId', 'name leader.name')
      .select('name currentLocation deviceInfo status journeyStages')
      .limit(100); // Limit for performance
    
    const formattedPilgrims = pilgrims.map(pilgrim => ({
      id: pilgrim._id,
      name: pilgrim.name,
      group: pilgrim.groupId?.name || 'Unassigned',
      lat: pilgrim.currentLocation.coordinates[1],
      lng: pilgrim.currentLocation.coordinates[0],
      location: pilgrim.currentLocation.address || 'Unknown',
      stage: getCurrentStage(pilgrim.journeyStages),
      batteryLevel: pilgrim.deviceInfo.batteryLevel,
      signalStrength: pilgrim.deviceInfo.signalStrength,
      lastSeen: getTimeAgo(pilgrim.deviceInfo.lastSeen),
      status: pilgrim.status
    }));
    
    res.json(formattedPilgrims);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update pilgrim location
router.post('/pilgrims/:id/location', async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, address, batteryLevel, signalStrength } = req.body;
    
    const pilgrim = await Pilgrim.findById(id);
    if (!pilgrim) {
      return res.status(404).json({ error: 'Pilgrim not found' });
    }
    
    // Update location
    pilgrim.currentLocation = {
      type: 'Point',
      coordinates: [longitude, latitude],
      address: address || pilgrim.currentLocation.address,
      lastUpdated: new Date()
    };
    
    // Update device info
    if (batteryLevel !== undefined) {
      pilgrim.deviceInfo.batteryLevel = batteryLevel;
    }
    if (signalStrength !== undefined) {
      pilgrim.deviceInfo.signalStrength = signalStrength;
    }
    
    pilgrim.deviceInfo.lastSeen = new Date();
    pilgrim.deviceInfo.isOnline = true;
    
    // Check for low battery alert
    if (batteryLevel && batteryLevel < 20 && pilgrim.status !== 'low_battery') {
      pilgrim.status = 'low_battery';
      pilgrim.alerts.push({
        type: 'low_battery',
        message: `Low battery alert: ${batteryLevel}%`,
        createdAt: new Date()
      });
    }
    
    await pilgrim.save();
    
    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    io.to('operations-center').emit('live-location-update', {
      pilgrimId: pilgrim._id,
      name: pilgrim.name,
      location: {
        lat: latitude,
        lng: longitude,
        address
      },
      batteryLevel,
      signalStrength,
      timestamp: new Date()
    });
    
    res.json({
      message: 'Location updated successfully',
      pilgrim: {
        id: pilgrim._id,
        name: pilgrim.name,
        location: pilgrim.currentLocation,
        deviceInfo: pilgrim.deviceInfo
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get nearby pilgrims
router.get('/pilgrims/nearby', async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 1000 } = req.query;
    
    if (!longitude || !latitude) {
      return res.status(400).json({ error: 'Longitude and latitude are required' });
    }
    
    const nearbyPilgrims = await Pilgrim.findNearby(
      parseFloat(longitude),
      parseFloat(latitude),
      parseInt(maxDistance)
    ).populate('groupId', 'name leader.name');
    
    res.json(nearbyPilgrims.map(pilgrim => ({
      id: pilgrim._id,
      name: pilgrim.name,
      group: pilgrim.groupId?.name,
      distance: calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        pilgrim.currentLocation.coordinates[1],
        pilgrim.currentLocation.coordinates[0]
      ),
      location: pilgrim.currentLocation,
      status: pilgrim.status
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Emergency alert endpoint
router.post('/pilgrims/:id/emergency', async (req, res) => {
  try {
    const { id } = req.params;
    const { message, type = 'emergency' } = req.body;
    
    const pilgrim = await Pilgrim.findById(id).populate('groupId', 'name leader');
    if (!pilgrim) {
      return res.status(404).json({ error: 'Pilgrim not found' });
    }
    
    // Send emergency alert
    await pilgrim.sendEmergencyAlert(message);
    
    // Emit real-time emergency notification
    const io = req.app.get('io');
    io.to('operations-center').emit('emergency-notification', {
      pilgrimId: pilgrim._id,
      pilgrimName: pilgrim.name,
      groupName: pilgrim.groupId?.name,
      location: pilgrim.currentLocation,
      message: message || 'Emergency alert triggered',
      timestamp: new Date(),
      type
    });
    
    res.json({
      message: 'Emergency alert sent successfully',
      alert: {
        pilgrimName: pilgrim.name,
        groupName: pilgrim.groupId?.name,
        location: pilgrim.currentLocation,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tracking statistics
router.get('/statistics', async (req, res) => {
  try {
    const stats = await Promise.all([
      Pilgrim.countDocuments({ status: 'active' }),
      Pilgrim.countDocuments({ status: 'emergency' }),
      Pilgrim.countDocuments({ status: 'low_battery' }),
      Pilgrim.countDocuments({ 'deviceInfo.isOnline': false }),
      Group.countDocuments({ status: 'active' })
    ]);
    
    const [activePilgrims, emergencyAlerts, lowBattery, offline, activeGroups] = stats;
    
    // Get journey stage statistics
    const stageStats = await Pilgrim.aggregate([
      { $match: { status: { $in: ['active', 'completed'] } } },
      {
        $project: {
          completedStages: {
            $sum: [
              { $cond: ['$journeyStages.tawaf.completed', 1, 0] },
              { $cond: ['$journeyStages.sai.completed', 1, 0] },
              { $cond: ['$journeyStages.arafat.completed', 1, 0] },
              { $cond: ['$journeyStages.jamarat.completed', 1, 0] }
            ]
          },
          tawafCompleted: { $cond: ['$journeyStages.tawaf.completed', 1, 0] },
          saiCompleted: { $cond: ['$journeyStages.sai.completed', 1, 0] },
          arafatCompleted: { $cond: ['$journeyStages.arafat.completed', 1, 0] },
          jamaratCompleted: { $cond: ['$journeyStages.jamarat.completed', 1, 0] }
        }
      },
      {
        $group: {
          _id: null,
          tawafTotal: { $sum: '$tawafCompleted' },
          saiTotal: { $sum: '$saiCompleted' },
          arafatTotal: { $sum: '$arafatCompleted' },
          jamaratTotal: { $sum: '$jamaratCompleted' }
        }
      }
    ]);
    
    res.json({
      activePilgrims,
      activeGroups,
      emergencyAlerts,
      lowBattery,
      offline,
      journeyProgress: stageStats[0] || {
        tawafTotal: 0,
        saiTotal: 0,
        arafatTotal: 0,
        jamaratTotal: 0
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
function getCurrentStage(journeyStages) {
  if (journeyStages.tawafalWada?.completed) return 'Complete';
  if (journeyStages.jamarat?.completed) return 'Jamarat';
  if (journeyStages.arafat?.completed) return 'Muzdalifah';
  if (journeyStages.sai?.completed) return 'Arafat';
  if (journeyStages.tawaf?.completed) return 'Sa\'i';
  if (journeyStages.ihram?.completed) return 'Tawaf';
  return 'Preparation';
}

function getTimeAgo(date) {
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in kilometers
  return Math.round(d * 1000); // Return distance in meters
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

export default router;