import React, { useState, useEffect } from 'react';
import { Smartphone, Save, RefreshCw, Eye, EyeOff, Upload, Download, AlertCircle } from 'lucide-react';

const AppleLoginConfig = ({ onSave, loading, category }) => {
  const [config, setConfig] = useState({
    teamId: '',
    keyId: '',
    bundleId: '',
    privateKey: '',
    enabled: false
  });
  const [showPrivateKey, setShowPrivateKey] = useState(false);

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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.p8')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setConfig(prev => ({
          ...prev,
          privateKey: event.target.result
        }));
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid .p8 private key file.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Enable Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <Smartphone className="w-5 h-5 text-gray-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Enable Apple Sign-In</h3>
            <p className="text-sm text-gray-600">Allow users to sign in with their Apple ID</p>
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

      {/* Configuration Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Team ID *
          </label>
          <input
            type="text"
            value={config.teamId}
            onChange={(e) => handleInputChange('teamId', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            placeholder="10-character Team ID"
            maxLength={10}
            required
          />
          <p className="text-xs text-gray-500">Found in Apple Developer Account → Membership</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Key ID *
          </label>
          <input
            type="text"
            value={config.keyId}
            onChange={(e) => handleInputChange('keyId', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            placeholder="10-character Key ID"
            maxLength={10}
            required
          />
          <p className="text-xs text-gray-500">From your Sign in with Apple private key</p>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Bundle ID *
          </label>
          <input
            type="text"
            value={config.bundleId}
            onChange={(e) => handleInputChange('bundleId', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            placeholder="com.findmyhaji.app"
            required
          />
          <p className="text-xs text-gray-500">Your app's bundle identifier from App Store Connect</p>
        </div>
      </div>

      {/* Private Key Upload */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Private Key (.p8 file) *
        </label>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Upload your Sign in with Apple private key (.p8 file)
              </p>
              <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                <input
                  type="file"
                  accept=".p8"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="w-4 h-4 mr-2" />
                Choose .p8 File
              </label>
            </div>
          </div>
        </div>

        {/* Private Key Text Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Private Key Content
            </label>
            <button
              type="button"
              onClick={() => setShowPrivateKey(!showPrivateKey)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
            >
              {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPrivateKey ? 'Hide' : 'Show'} Key
            </button>
          </div>
          <textarea
            value={config.privateKey}
            onChange={(e) => handleInputChange('privateKey', e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent font-mono text-sm resize-none"
            placeholder="-----BEGIN PRIVATE KEY-----&#10;[Private key content]&#10;-----END PRIVATE KEY-----"
            style={{ display: showPrivateKey ? 'block' : 'none' }}
          />
          {!showPrivateKey && config.privateKey && (
            <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-500">
              Private key is configured (hidden for security)
            </div>
          )}
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Setup Instructions</h4>
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <p className="font-semibold text-gray-800">1. Create App ID in Apple Developer Console:</p>
            <ul className="ml-4 mt-2 space-y-1 list-disc">
              <li>Go to Apple Developer → Certificates, Identifiers & Profiles</li>
              <li>Create new App ID with your bundle identifier</li>
              <li>Enable "Sign In with Apple" capability</li>
            </ul>
          </div>
          
          <div>
            <p className="font-semibold text-gray-800">2. Create Sign in with Apple Key:</p>
            <ul className="ml-4 mt-2 space-y-1 list-disc">
              <li>Go to Keys section in Apple Developer Console</li>
              <li>Create new key and enable "Sign In with Apple"</li>
              <li>Download the .p8 file (you can only download it once)</li>
              <li>Note the Key ID (10-character identifier)</li>
            </ul>
          </div>
          
          <div>
            <p className="font-semibold text-gray-800">3. Configure Your App:</p>
            <ul className="ml-4 mt-2 space-y-1 list-disc">
              <li>Add your domain to "Sign In with Apple" configuration</li>
              <li>Set up return URLs for web authentication</li>
              <li>Test the integration in sandbox mode first</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-red-800 mb-2">Security Notice</h4>
            <div className="text-sm text-red-700 space-y-2">
              <p><strong>Private Key Security:</strong> Keep your .p8 private key secure and never share it publicly.</p>
              <p><strong>Key Rotation:</strong> Apple recommends rotating keys periodically.</p>
              <p><strong>Backup:</strong> Store a secure backup of your private key - you can only download it once.</p>
              <p><strong>Environment:</strong> Use different keys for development and production.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Apple Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-3">Apple Sign-In Requirements</h4>
        <div className="text-sm text-blue-700 space-y-2">
          <p><strong>App Store Guidelines:</strong> If you offer other social login options, you must also offer Apple Sign-In.</p>
          <p><strong>Privacy:</strong> Apple Sign-In provides enhanced user privacy with email relay options.</p>
          <p><strong>User Experience:</strong> Design should follow Apple's Human Interface Guidelines.</p>
          <p><strong>Testing:</strong> Test with both real Apple IDs and sandbox accounts.</p>
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

export default AppleLoginConfig;