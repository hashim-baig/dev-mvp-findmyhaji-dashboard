import React, { useState, useEffect } from 'react';
import { Map, AlertTriangle, Save, RefreshCw, Info, Eye, EyeOff } from 'lucide-react';

const MapAPIConfig = ({ onSave, loading, category }) => {
  const [config, setConfig] = useState({
    serverKey: '',
    clientKey: '',
    enabled: false
  });
  const [showServerKey, setShowServerKey] = useState(false);
  const [showClientKey, setShowClientKey] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('findmyhaji_token');
      const response = await fetch(`${BACKEND_URL}/api/configurations/${category}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setConfig(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(config);
  };

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Warning Notice */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-red-800 mb-2">Important Configuration Notice</h4>
            <p className="text-sm text-red-700">
              <strong>Client Key</strong> should have Map JavaScript API enabled and restricted by HTTP referer.<br />
              <strong>Server Key</strong> should have Places API enabled and restricted by IP address.
            </p>
          </div>
        </div>
      </div>

      {/* Enable Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <Map className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Enable Map API</h3>
            <p className="text-sm text-gray-600">Activate Google Maps integration</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleInputChange('enabled', !config.enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            config.enabled ? 'bg-green-600' : 'bg-gray-200'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            config.enabled ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>

      {/* API Keys */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Server Key */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Map API Key Server *
          </label>
          <div className="relative">
            <input
              type={showServerKey ? 'text' : 'password'}
              value={config.serverKey}
              onChange={(e) => handleInputChange('serverKey', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12"
              placeholder="Enter server API key"
              required
            />
            <button
              type="button"
              onClick={() => setShowServerKey(!showServerKey)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showServerKey ? (
                <EyeOff className="w-4 h-4 text-gray-400" />
              ) : (
                <Eye className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Info className="w-3 h-3" />
            <span>Used for server-side API calls (Places API)</span>
          </div>
        </div>

        {/* Client Key */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Map API Key Client *
          </label>
          <div className="relative">
            <input
              type={showClientKey ? 'text' : 'password'}
              value={config.clientKey}
              onChange={(e) => handleInputChange('clientKey', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12"
              placeholder="Enter client API key"
              required
            />
            <button
              type="button"
              onClick={() => setShowClientKey(!showClientKey)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showClientKey ? (
                <EyeOff className="w-4 h-4 text-gray-400" />
              ) : (
                <Eye className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Info className="w-3 h-3" />
            <span>Used for frontend map display (JavaScript API)</span>
          </div>
        </div>
      </div>

      {/* API Setup Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-3">Setup Instructions</h4>
        <div className="space-y-2 text-sm text-blue-700">
          <p><strong>1.</strong> Go to Google Cloud Console → APIs & Services → Credentials</p>
          <p><strong>2.</strong> Create two API keys:</p>
          <div className="ml-4 space-y-1">
            <p>• <strong>Server Key:</strong> Enable Places API, restrict by IP addresses</p>
            <p>• <strong>Client Key:</strong> Enable Maps JavaScript API, restrict by HTTP referrers</p>
          </div>
          <p><strong>3.</strong> Add your domain(s) to HTTP referrer restrictions</p>
          <p><strong>4.</strong> Add your server IP(s) to IP address restrictions</p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {loading ? 'Saving...' : 'Update Configuration'}
        </button>
      </div>
    </form>
  );
};

export default MapAPIConfig;