import axios from 'axios';
import ConfigurationSettings from '../models/ConfigurationSettings.js';

class GoogleMapsService {
  constructor() {
    this.apiKey = null;
    this.baseURL = 'https://maps.googleapis.com/maps/api';
    this.initialized = false;
  }

  async initialize() {
    try {
      // Get Google Maps configuration from database
      const mapsConfig = await ConfigurationSettings.getByCategory('map-api');
      
      if (!mapsConfig || !mapsConfig.apiKey) {
        console.warn('Google Maps API key not found in database');
        return false;
      }

      this.apiKey = mapsConfig.apiKey;
      this.initialized = true;
      console.log('✅ Google Maps service initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize Google Maps service:', error);
      return false;
    }
  }

  // Geocoding - Convert address to coordinates
  async geocode(address) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    try {
      const response = await axios.get(`${this.baseURL}/geocode/json`, {
        params: {
          address,
          key: this.apiKey
        }
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Geocoding failed: ${response.data.status}`);
      }

      const result = response.data.results[0];
      return {
        address: result.formatted_address,
        location: result.geometry.location,
        placeId: result.place_id,
        types: result.types,
        bounds: result.geometry.bounds,
        viewport: result.geometry.viewport
      };

    } catch (error) {
      console.error('Error in geocoding:', error);
      throw error;
    }
  }

  // Reverse Geocoding - Convert coordinates to address
  async reverseGeocode(lat, lng) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    try {
      const response = await axios.get(`${this.baseURL}/geocode/json`, {
        params: {
          latlng: `${lat},${lng}`,
          key: this.apiKey
        }
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Reverse geocoding failed: ${response.data.status}`);
      }

      return response.data.results.map(result => ({
        address: result.formatted_address,
        location: result.geometry.location,
        placeId: result.place_id,
        types: result.types,
        addressComponents: result.address_components
      }));

    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      throw error;
    }
  }

  // Calculate distance and duration between two points
  async getDistanceMatrix(origins, destinations, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    try {
      const params = {
        origins: Array.isArray(origins) ? origins.join('|') : origins,
        destinations: Array.isArray(destinations) ? destinations.join('|') : destinations,
        key: this.apiKey,
        units: options.units || 'metric',
        mode: options.mode || 'driving',
        avoid: options.avoid,
        language: options.language || 'en',
        region: options.region
      };

      const response = await axios.get(`${this.baseURL}/distancematrix/json`, { params });

      if (response.data.status !== 'OK') {
        throw new Error(`Distance matrix failed: ${response.data.status}`);
      }

      return {
        originAddresses: response.data.origin_addresses,
        destinationAddresses: response.data.destination_addresses,
        rows: response.data.rows.map(row => ({
          elements: row.elements.map(element => ({
            status: element.status,
            distance: element.distance,
            duration: element.duration,
            durationInTraffic: element.duration_in_traffic
          }))
        }))
      };

    } catch (error) {
      console.error('Error in distance matrix:', error);
      throw error;
    }
  }

  // Get directions between points
  async getDirections(origin, destination, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    try {
      const params = {
        origin,
        destination,
        key: this.apiKey,
        mode: options.mode || 'driving',
        waypoints: options.waypoints,
        avoid: options.avoid,
        language: options.language || 'en',
        region: options.region,
        units: options.units || 'metric',
        alternatives: options.alternatives || false
      };

      const response = await axios.get(`${this.baseURL}/directions/json`, { params });

      if (response.data.status !== 'OK') {
        throw new Error(`Directions failed: ${response.data.status}`);
      }

      return response.data.routes.map(route => ({
        summary: route.summary,
        bounds: route.bounds,
        distance: route.legs.reduce((total, leg) => total + leg.distance.value, 0),
        duration: route.legs.reduce((total, leg) => total + leg.duration.value, 0),
        startLocation: route.legs[0].start_location,
        endLocation: route.legs[route.legs.length - 1].end_location,
        polyline: route.overview_polyline.points,
        legs: route.legs.map(leg => ({
          distance: leg.distance,
          duration: leg.duration,
          startAddress: leg.start_address,
          endAddress: leg.end_address,
          startLocation: leg.start_location,
          endLocation: leg.end_location,
          steps: leg.steps.map(step => ({
            distance: step.distance,
            duration: step.duration,
            htmlInstructions: step.html_instructions,
            startLocation: step.start_location,
            endLocation: step.end_location,
            polyline: step.polyline.points,
            travelMode: step.travel_mode
          }))
        }))
      }));

    } catch (error) {
      console.error('Error getting directions:', error);
      throw error;
    }
  }

  // Places search
  async searchPlaces(query, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    try {
      const params = {
        query,
        key: this.apiKey,
        location: options.location,
        radius: options.radius || 5000,
        language: options.language || 'en',
        region: options.region,
        type: options.type
      };

      const response = await axios.get(`${this.baseURL}/place/textsearch/json`, { params });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new Error(`Places search failed: ${response.data.status}`);
      }

      return {
        status: response.data.status,
        results: response.data.results.map(place => ({
          placeId: place.place_id,
          name: place.name,
          formattedAddress: place.formatted_address,
          geometry: place.geometry,
          rating: place.rating,
          userRatingsTotal: place.user_ratings_total,
          priceLevel: place.price_level,
          types: place.types,
          photos: place.photos,
          openingHours: place.opening_hours
        })),
        nextPageToken: response.data.next_page_token
      };

    } catch (error) {
      console.error('Error searching places:', error);
      throw error;
    }
  }

  // Get place details
  async getPlaceDetails(placeId, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    try {
      const params = {
        place_id: placeId,
        key: this.apiKey,
        fields: options.fields || 'place_id,name,formatted_address,geometry,rating,formatted_phone_number,website,opening_hours,photos,reviews',
        language: options.language || 'en',
        region: options.region
      };

      const response = await axios.get(`${this.baseURL}/place/details/json`, { params });

      if (response.data.status !== 'OK') {
        throw new Error(`Place details failed: ${response.data.status}`);
      }

      const result = response.data.result;
      return {
        placeId: result.place_id,
        name: result.name,
        formattedAddress: result.formatted_address,
        geometry: result.geometry,
        rating: result.rating,
        userRatingsTotal: result.user_ratings_total,
        formattedPhoneNumber: result.formatted_phone_number,
        internationalPhoneNumber: result.international_phone_number,
        website: result.website,
        openingHours: result.opening_hours,
        photos: result.photos,
        reviews: result.reviews,
        types: result.types,
        addressComponents: result.address_components
      };

    } catch (error) {
      console.error('Error getting place details:', error);
      throw error;
    }
  }

  // Find places nearby
  async findNearbyPlaces(location, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    try {
      const params = {
        location: `${location.lat},${location.lng}`,
        radius: options.radius || 5000,
        key: this.apiKey,
        type: options.type,
        keyword: options.keyword,
        language: options.language || 'en',
        minprice: options.minPrice,
        maxprice: options.maxPrice,
        opennow: options.openNow
      };

      const response = await axios.get(`${this.baseURL}/place/nearbysearch/json`, { params });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new Error(`Nearby search failed: ${response.data.status}`);
      }

      return {
        status: response.data.status,
        results: response.data.results.map(place => ({
          placeId: place.place_id,
          name: place.name,
          vicinity: place.vicinity,
          geometry: place.geometry,
          rating: place.rating,
          userRatingsTotal: place.user_ratings_total,
          priceLevel: place.price_level,
          types: place.types,
          photos: place.photos,
          openingHours: place.opening_hours,
          businessStatus: place.business_status
        })),
        nextPageToken: response.data.next_page_token
      };

    } catch (error) {
      console.error('Error finding nearby places:', error);
      throw error;
    }
  }

  // Calculate travel time between multiple points (optimized route)
  async optimizeRoute(waypoints, origin, destination, options = {}) {
    try {
      const directions = await this.getDirections(origin, destination, {
        waypoints: waypoints.join('|'),
        optimize: true,
        ...options
      });

      return {
        optimizedRoute: directions[0],
        totalDistance: directions[0].distance,
        totalDuration: directions[0].duration,
        waypointOrder: directions[0].waypoint_order
      };

    } catch (error) {
      console.error('Error optimizing route:', error);
      throw error;
    }
  }

  // Check if service is properly configured
  isConfigured() {
    return this.initialized && this.apiKey !== null;
  }

  // Get static map URL
  getStaticMapURL(options = {}) {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const params = new URLSearchParams({
      key: this.apiKey,
      size: options.size || '400x400',
      zoom: options.zoom || 13,
      maptype: options.maptype || 'roadmap',
      format: options.format || 'png'
    });

    if (options.center) {
      params.append('center', `${options.center.lat},${options.center.lng}`);
    }

    if (options.markers) {
      options.markers.forEach(marker => {
        params.append('markers', `${marker.color || 'red'}|${marker.lat},${marker.lng}`);
      });
    }

    if (options.path) {
      params.append('path', `color:${options.path.color || 'blue'}|weight:${options.path.weight || 3}|${options.path.points.map(p => `${p.lat},${p.lng}`).join('|')}`);
    }

    return `${this.baseURL}/staticmap?${params.toString()}`;
  }
}

// Export singleton instance
const googleMapsService = new GoogleMapsService();
export default googleMapsService;