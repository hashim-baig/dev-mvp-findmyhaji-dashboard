import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MapsTestInterface = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState(null);
  const [directionsResult, setDirectionsResult] = useState(null);
  const [placesResult, setPlacesResult] = useState(null);
  const [staticMapUrl, setStaticMapUrl] = useState('');

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    checkMapsStatus();
  }, []);

  const checkMapsStatus = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/maps/status`);
      if (response.data.success) {
        setStatus(response.data.data);
      }
    } catch (error) {
      console.error('Error checking Maps status:', error);
    }
  };

  const testGeocode = async () => {
    const address = prompt('Enter address to geocode:', '1600 Amphitheatre Parkway, Mountain View, CA');
    if (!address) return;

    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/maps/geocode`, {
        params: { address },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setGeocodeResult(response.data);
    } catch (error) {
      console.error('Error geocoding:', error);
      setGeocodeResult({
        success: false,
        message: error.response?.data?.message || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testDirections = async () => {
    const origin = prompt('Enter origin address:', 'New York, NY');
    const destination = prompt('Enter destination address:', 'Boston, MA');
    if (!origin || !destination) return;

    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/maps/directions`, {
        params: { origin, destination, mode: 'driving' },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDirectionsResult(response.data);
    } catch (error) {
      console.error('Error getting directions:', error);
      setDirectionsResult({
        success: false,
        message: error.response?.data?.message || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testPlacesSearch = async () => {
    const query = prompt('Enter search query:', 'restaurants near Mecca');
    if (!query) return;

    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/maps/places/search`, {
        params: { query, radius: 10000 },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPlacesResult(response.data);
    } catch (error) {
      console.error('Error searching places:', error);
      setPlacesResult({
        success: false,
        message: error.response?.data?.message || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testNearbyPlaces = async () => {
    const lat = prompt('Enter latitude:', '21.4225');  // Mecca coordinates
    const lng = prompt('Enter longitude:', '39.8262');
    const type = prompt('Enter place type (optional):', 'mosque');
    
    if (!lat || !lng) return;

    setLoading(true);
    try {
      const params = { lat: parseFloat(lat), lng: parseFloat(lng), radius: 10000 };
      if (type) params.type = type;

      const response = await axios.get(`${backendUrl}/api/maps/places/nearby`, {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPlacesResult(response.data);
    } catch (error) {
      console.error('Error finding nearby places:', error);
      setPlacesResult({
        success: false,
        message: error.response?.data?.message || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const generateStaticMap = async () => {
    const lat = prompt('Enter center latitude:', '21.4225');  // Mecca coordinates
    const lng = prompt('Enter center longitude:', '39.8262');
    const zoom = prompt('Enter zoom level (1-20):', '15');
    
    if (!lat || !lng) return;

    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/maps/static-map`, {
        params: {
          center_lat: parseFloat(lat),
          center_lng: parseFloat(lng),
          zoom: parseInt(zoom),
          size: '600x400',
          markers: JSON.stringify([{ lat: parseFloat(lat), lng: parseFloat(lng), color: 'red' }])
        },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data.success) {
        setStaticMapUrl(response.data.data.url);
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error generating static map:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🗺️ Google Maps Integration Testing</h2>
      
      {/* Maps Status */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Google Maps Service Status</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          {status ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Configuration Status</p>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  status.configured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {status.configured ? 'Configured' : 'Not Configured'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Initialization Status</p>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  status.initialized ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {status.initialized ? 'Initialized' : 'Not Initialized'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Loading status...</p>
          )}
          <button
            onClick={checkMapsStatus}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Refresh Status
          </button>
        </div>
      </div>

      {/* Test Controls */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Google Maps Feature Testing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={testGeocode}
            disabled={loading}
            className={`p-4 rounded-lg text-left transition-colors ${
              loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-blue-50 hover:bg-blue-100 border-2 border-blue-200'
            }`}
          >
            <div className="text-blue-600 text-2xl mb-2">📍</div>
            <h4 className="font-semibold text-gray-800">Geocoding</h4>
            <p className="text-sm text-gray-600">Convert address to coordinates</p>
          </button>

          <button
            onClick={testDirections}
            disabled={loading}
            className={`p-4 rounded-lg text-left transition-colors ${
              loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-green-50 hover:bg-green-100 border-2 border-green-200'
            }`}
          >
            <div className="text-green-600 text-2xl mb-2">🚗</div>
            <h4 className="font-semibold text-gray-800">Directions</h4>
            <p className="text-sm text-gray-600">Get directions between points</p>
          </button>

          <button
            onClick={testPlacesSearch}
            disabled={loading}
            className={`p-4 rounded-lg text-left transition-colors ${
              loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-purple-50 hover:bg-purple-100 border-2 border-purple-200'
            }`}
          >
            <div className="text-purple-600 text-2xl mb-2">🔍</div>
            <h4 className="font-semibold text-gray-800">Places Search</h4>
            <p className="text-sm text-gray-600">Search for places by text query</p>
          </button>

          <button
            onClick={testNearbyPlaces}
            disabled={loading}
            className={`p-4 rounded-lg text-left transition-colors ${
              loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-amber-50 hover:bg-amber-100 border-2 border-amber-200'
            }`}
          >
            <div className="text-amber-600 text-2xl mb-2">📍</div>
            <h4 className="font-semibold text-gray-800">Nearby Places</h4>
            <p className="text-sm text-gray-600">Find places near coordinates</p>
          </button>

          <button
            onClick={generateStaticMap}
            disabled={loading}
            className={`p-4 rounded-lg text-left transition-colors ${
              loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-red-50 hover:bg-red-100 border-2 border-red-200'
            }`}
          >
            <div className="text-red-600 text-2xl mb-2">🗺️</div>
            <h4 className="font-semibold text-gray-800">Static Map</h4>
            <p className="text-sm text-gray-600">Generate static map image</p>
          </button>
        </div>
      </div>

      {/* Static Map Display */}
      {staticMapUrl && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Generated Static Map</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <img 
              src={staticMapUrl} 
              alt="Generated Static Map" 
              className="max-w-full h-auto rounded-lg shadow-md mx-auto"
              style={{ maxHeight: '400px' }}
            />
            <p className="text-sm text-gray-600 mt-2 text-center">
              Static map generated successfully
            </p>
          </div>
        </div>
      )}

      {/* Results Display */}
      {(geocodeResult || directionsResult || placesResult) && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-700">Test Results</h3>
          
          {geocodeResult && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">📍 Geocoding Result</h4>
              <div className={`p-3 rounded ${
                geocodeResult.success ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {geocodeResult.success ? (
                  <div className="text-green-800">
                    <p className="text-sm font-semibold">✅ Address geocoded successfully:</p>
                    <p className="text-sm font-mono mt-1">Address: {geocodeResult.data.address}</p>
                    <p className="text-sm font-mono">Coordinates: {geocodeResult.data.location.lat}, {geocodeResult.data.location.lng}</p>
                    <p className="text-sm font-mono">Place ID: {geocodeResult.data.placeId}</p>
                  </div>
                ) : (
                  <p className="text-sm font-mono text-red-800">❌ {geocodeResult.message}</p>
                )}
              </div>
            </div>
          )}

          {directionsResult && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">🚗 Directions Result</h4>
              <div className={`p-3 rounded ${
                directionsResult.success ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {directionsResult.success ? (
                  <div className="text-green-800">
                    <p className="text-sm font-semibold">✅ Directions found:</p>
                    {directionsResult.data.map((route, index) => (
                      <div key={index} className="mt-2 text-sm font-mono">
                        <p>Route {index + 1}: {route.summary}</p>
                        <p>Distance: {(route.distance / 1000).toFixed(2)} km</p>
                        <p>Duration: {Math.round(route.duration / 60)} minutes</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-mono text-red-800">❌ {directionsResult.message}</p>
                )}
              </div>
            </div>
          )}

          {placesResult && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">🔍 Places Search Result</h4>
              <div className={`p-3 rounded ${
                placesResult.success ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {placesResult.success ? (
                  <div className="text-green-800">
                    <p className="text-sm font-semibold">✅ Found {placesResult.data.results.length} places:</p>
                    <div className="mt-2 max-h-60 overflow-y-auto">
                      {placesResult.data.results.slice(0, 5).map((place, index) => (
                        <div key={index} className="text-sm font-mono mt-1 p-2 bg-white rounded">
                          <p className="font-semibold">{place.name}</p>
                          <p>{place.formattedAddress || place.vicinity}</p>
                          {place.rating && <p>Rating: {place.rating} ⭐</p>}
                        </div>
                      ))}
                      {placesResult.data.results.length > 5 && (
                        <p className="text-sm mt-2">... and {placesResult.data.results.length - 5} more places</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-mono text-red-800">❌ {placesResult.message}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">📋 Testing Instructions</h4>
        <div className="text-sm text-blue-700 space-y-2">
          <p><strong>For Islamic pilgrimage context, try these test cases:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>Geocoding:</strong> "Masjid al-Haram, Mecca, Saudi Arabia"</li>
            <li><strong>Directions:</strong> From "Medina, Saudi Arabia" to "Mecca, Saudi Arabia"</li>
            <li><strong>Places Search:</strong> "mosques near Mecca" or "hotels in Medina"</li>
            <li><strong>Nearby Places:</strong> Use Mecca coordinates (21.4225, 39.8262) with type "mosque"</li>
            <li><strong>Static Map:</strong> Generate maps of holy sites for pilgrimage planning</li>
          </ul>
        </div>
      </div>

      {/* Configuration Status */}
      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">⚙️ Configuration Status</h4>
        <div className="text-sm text-yellow-700 space-y-2">
          <p>Current Google Maps API status: {status?.configured && status?.initialized ? '✅ Ready' : '❌ Requires Setup'}</p>
          {(!status?.configured || !status?.initialized) && (
            <p>
              Go to <strong>3rd Party Configurations → Map API</strong> to configure your Google Maps API key.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapsTestInterface;