import express from 'express';
import googleMapsService from '../services/maps.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// ===== GEOCODING ROUTES =====

// GET /api/maps/geocode - Convert address to coordinates
router.get('/geocode', authenticate, async (req, res) => {
  try {
    const { address } = req.query;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }
    
    const result = await googleMapsService.geocode(address);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Error in geocoding:', error);
    res.status(500).json({
      success: false,
      message: 'Geocoding failed',
      error: error.message
    });
  }
});

// GET /api/maps/reverse-geocode - Convert coordinates to address
router.get('/reverse-geocode', authenticate, async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    const results = await googleMapsService.reverseGeocode(parseFloat(lat), parseFloat(lng));
    
    res.json({
      success: true,
      data: results
    });
    
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    res.status(500).json({
      success: false,
      message: 'Reverse geocoding failed',
      error: error.message
    });
  }
});

// ===== DISTANCE & DIRECTIONS ROUTES =====

// GET /api/maps/distance-matrix - Calculate distances between points
router.get('/distance-matrix', authenticate, async (req, res) => {
  try {
    const { origins, destinations, mode, units, avoid, language } = req.query;
    
    if (!origins || !destinations) {
      return res.status(400).json({
        success: false,
        message: 'Origins and destinations are required'
      });
    }
    
    const originsArray = origins.split('|');
    const destinationsArray = destinations.split('|');
    
    const options = {
      mode: mode || 'driving',
      units: units || 'metric',
      avoid,
      language: language || 'en'
    };
    
    const result = await googleMapsService.getDistanceMatrix(originsArray, destinationsArray, options);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Error in distance matrix:', error);
    res.status(500).json({
      success: false,
      message: 'Distance matrix calculation failed',
      error: error.message
    });
  }
});

// GET /api/maps/directions - Get directions between points
router.get('/directions', authenticate, async (req, res) => {
  try {
    const { origin, destination, mode, waypoints, avoid, language, units, alternatives } = req.query;
    
    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Origin and destination are required'
      });
    }
    
    const options = {
      mode: mode || 'driving',
      waypoints,
      avoid,
      language: language || 'en',
      units: units || 'metric',
      alternatives: alternatives === 'true'
    };
    
    const result = await googleMapsService.getDirections(origin, destination, options);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Error getting directions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get directions',
      error: error.message
    });
  }
});

// POST /api/maps/optimize-route - Optimize route with multiple waypoints
router.post('/optimize-route', authenticate, async (req, res) => {
  try {
    const { origin, destination, waypoints, mode, avoid, language } = req.body;
    
    if (!origin || !destination || !waypoints || !Array.isArray(waypoints)) {
      return res.status(400).json({
        success: false,
        message: 'Origin, destination, and waypoints array are required'
      });
    }
    
    const options = {
      mode: mode || 'driving',
      avoid,
      language: language || 'en'
    };
    
    const result = await googleMapsService.optimizeRoute(waypoints, origin, destination, options);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Error optimizing route:', error);
    res.status(500).json({
      success: false,
      message: 'Route optimization failed',
      error: error.message
    });
  }
});

// ===== PLACES ROUTES =====

// GET /api/maps/places/search - Search for places
router.get('/places/search', authenticate, async (req, res) => {
  try {
    const { query, location, radius, type, language } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const options = {
      location,
      radius: radius ? parseInt(radius) : 5000,
      type,
      language: language || 'en'
    };
    
    const result = await googleMapsService.searchPlaces(query, options);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Error searching places:', error);
    res.status(500).json({
      success: false,
      message: 'Places search failed',
      error: error.message
    });
  }
});

// GET /api/maps/places/nearby - Find nearby places
router.get('/places/nearby', authenticate, async (req, res) => {
  try {
    const { lat, lng, radius, type, keyword, language, minPrice, maxPrice, openNow } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    const location = {
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    };
    
    const options = {
      radius: radius ? parseInt(radius) : 5000,
      type,
      keyword,
      language: language || 'en',
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      openNow: openNow === 'true'
    };
    
    const result = await googleMapsService.findNearbyPlaces(location, options);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Error finding nearby places:', error);
    res.status(500).json({
      success: false,
      message: 'Nearby places search failed',
      error: error.message
    });
  }
});

// GET /api/maps/places/details/:placeId - Get place details
router.get('/places/details/:placeId', authenticate, async (req, res) => {
  try {
    const { placeId } = req.params;
    const { fields, language } = req.query;
    
    const options = {
      fields,
      language: language || 'en'
    };
    
    const result = await googleMapsService.getPlaceDetails(placeId, options);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Error getting place details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get place details',
      error: error.message
    });
  }
});

// ===== STATIC MAP ROUTES =====

// GET /api/maps/static-map - Generate static map URL
router.get('/static-map', authenticate, async (req, res) => {
  try {
    const { 
      center_lat, 
      center_lng, 
      zoom, 
      size, 
      maptype, 
      format,
      markers,
      path_points,
      path_color,
      path_weight
    } = req.query;
    
    const options = {
      zoom: zoom ? parseInt(zoom) : 13,
      size: size || '400x400',
      maptype: maptype || 'roadmap',
      format: format || 'png'
    };
    
    if (center_lat && center_lng) {
      options.center = {
        lat: parseFloat(center_lat),
        lng: parseFloat(center_lng)
      };
    }
    
    if (markers) {
      try {
        options.markers = JSON.parse(markers);
      } catch (e) {
        // Handle simple marker format
        const markerParts = markers.split('|');
        options.markers = markerParts.map(marker => {
          const [lat, lng] = marker.split(',');
          return { lat: parseFloat(lat), lng: parseFloat(lng) };
        });
      }
    }
    
    if (path_points) {
      const points = path_points.split('|').map(point => {
        const [lat, lng] = point.split(',');
        return { lat: parseFloat(lat), lng: parseFloat(lng) };
      });
      
      options.path = {
        points,
        color: path_color || 'blue',
        weight: path_weight ? parseInt(path_weight) : 3
      };
    }
    
    const staticMapURL = googleMapsService.getStaticMapURL(options);
    
    res.json({
      success: true,
      data: {
        url: staticMapURL,
        options
      }
    });
    
  } catch (error) {
    console.error('Error generating static map:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate static map',
      error: error.message
    });
  }
});

// ===== UTILITY ROUTES =====

// GET /api/maps/status - Check Google Maps service status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      configured: googleMapsService.isConfigured(),
      initialized: googleMapsService.initialized
    }
  });
});

// POST /api/maps/batch-geocode - Batch geocode multiple addresses
router.post('/batch-geocode', authenticate, async (req, res) => {
  try {
    const { addresses } = req.body;
    
    if (!addresses || !Array.isArray(addresses)) {
      return res.status(400).json({
        success: false,
        message: 'Addresses array is required'
      });
    }
    
    const results = [];
    const errors = [];
    
    for (let i = 0; i < addresses.length; i++) {
      try {
        const result = await googleMapsService.geocode(addresses[i]);
        results.push({
          index: i,
          address: addresses[i],
          result
        });
      } catch (error) {
        errors.push({
          index: i,
          address: addresses[i],
          error: error.message
        });
      }
      
      // Add small delay to respect API rate limits
      if (i < addresses.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    res.json({
      success: true,
      data: {
        results,
        errors,
        totalProcessed: addresses.length,
        successCount: results.length,
        errorCount: errors.length
      }
    });
    
  } catch (error) {
    console.error('Error in batch geocoding:', error);
    res.status(500).json({
      success: false,
      message: 'Batch geocoding failed',
      error: error.message
    });
  }
});

export default router;