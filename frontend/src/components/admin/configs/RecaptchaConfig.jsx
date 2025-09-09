import React, { useState, useEffect } from 'react';
import { Shield, Save, RefreshCw, Info, Eye, EyeOff, ExternalLink } from 'lucide-react';

const RecaptchaConfig = ({ onSave, loading, category }) => {
  const [config, setConfig] = useState({
    siteKey: '',
    secretKey: '',
    enabled: false,
    version: 'v3'
  });
  const [showSecretKey, setShowSecretKey] = useState(false);

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
      {/* Enable Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-green-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Enable reCAPTCHA</h3>
            <p className="text-sm text-gray-600">Protect your forms from spam and abuse</p>
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

      {/* Version Selection */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">reCAPTCHA Version</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="v2"
              checked={config.version === 'v2'}
              onChange={(e) => handleInputChange('version', e.target.value)}
              className="mr-2 text-green-600 focus:ring-green-500"
            />
            reCAPTCHA v2
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="v3"
              checked={config.version === 'v3'}
              onChange={(e) => handleInputChange('version', e.target.value)}
              className="mr-2 text-green-600 focus:ring-green-500"
            />
            reCAPTCHA v3 (Recommended)
          </label>
        </div>
      </div>

      {/* Configuration Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Site Key */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Site Key *
          </label>
          <input
            type="text"
            value={config.siteKey}
            onChange={(e) => handleInputChange('siteKey', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="6Lc..."
            required
          />
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Info className="w-3 h-3" />
            <span>Public key used in your website frontend</span>
          </div>
        </div>

        {/* Secret Key */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Secret Key *
          </label>
          <div className="relative">
            <input
              type={showSecretKey ? 'text' : 'password'}
              value={config.secretKey}
              onChange={(e) => handleInputChange('secretKey', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12"
              placeholder="6Lc..."
              required
            />
            <button
              type="button"
              onClick={() => setShowSecretKey(!showSecretKey)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showSecretKey ? (
                <EyeOff className="w-4 h-4 text-gray-400" />
              ) : (
                <Eye className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Info className="w-3 h-3" />
            <span>Private key used for server-side verification</span>
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-1" />
          <div>
            <h4 className="text-sm font-semibold text-blue-800 mb-3">reCAPTCHA v3 Setup Instructions</h4>
            <div className="space-y-3 text-sm text-blue-700">
              <div>
                <p className="font-semibold">1. Create reCAPTCHA Keys:</p>
                <p className="ml-4">
                  • Go to{' '}
                  <a
                    href="https://www.google.com/recaptcha/admin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
                  >
                    Google reCAPTCHA Console
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
                <p className="ml-4">• Click "+" to create a new site</p>
                <p className="ml-4">• Choose reCAPTCHA v3</p>
                <p className="ml-4">• Add your domain(s)</p>
              </div>
              
              <div>
                <p className="font-semibold">2. Configure Domains:</p>
                <p className="ml-4">• Add your production domain</p>
                <p className="ml-4">• Add localhost for testing</p>
                <p className="ml-4">• Include all subdomains if needed</p>
              </div>
              
              <div>
                <p className="font-semibold">3. Implementation:</p>
                <p className="ml-4">• Site Key: Used in frontend forms</p>
                <p className="ml-4">• Secret Key: Used for backend verification</p>
                <p className="ml-4">• Score threshold: 0.5 (recommended)</p>
              </div>

              <div>
                <p className="font-semibold">4. Testing:</p>
                <p className="ml-4">• Test on both localhost and production</p>
                <p className="ml-4">• Monitor reCAPTCHA admin console for analytics</p>
                <p className="ml-4">• Adjust score threshold based on traffic</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Version Differences */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">reCAPTCHA Version Comparison</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-semibold text-gray-700 mb-2">reCAPTCHA v2</h5>
            <ul className="space-y-1 text-gray-600">
              <li>• Requires user interaction</li>
              <li>• "I'm not a robot" checkbox</li>
              <li>• Image challenges for suspicious users</li>
              <li>• More disruptive to user experience</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-gray-700 mb-2">reCAPTCHA v3 (Recommended)</h5>
            <ul className="space-y-1 text-gray-600">
              <li>• No user interaction required</li>
              <li>• Returns a score (0.0-1.0)</li>
              <li>• Seamless user experience</li>
              <li>• Better for forms and login pages</li>
            </ul>
          </div>
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

export default RecaptchaConfig;