import React, { useState, useEffect } from 'react';
import { Key, Save, RefreshCw, Eye, EyeOff, Upload, Shield, CheckCircle, AlertCircle } from 'lucide-react';

const FirebaseAuthConfig = ({ onSave, loading, category }) => {
  const [config, setConfig] = useState({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: '',
    enabledProviders: ['email'],
    emailVerification: false,
    phoneVerification: true,
    anonymousAuth: false,
    enabled: false
  });
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const authProviders = [
    {
      id: 'email',
      name: 'Email/Password',
      description: 'Traditional email and password authentication',
      icon: '📧',
      required: true
    },
    {
      id: 'phone',
      name: 'Phone Number',
      description: 'SMS-based phone number verification',
      icon: '📱'
    },
    {
      id: 'google',
      name: 'Google Sign-In',
      description: 'Sign in with Google account',
      icon: '🔍'
    },
    {
      id: 'apple',
      name: 'Apple Sign-In',
      description: 'Sign in with Apple ID',
      icon: '🍎'
    },
    {
      id: 'facebook',
      name: 'Facebook Login',
      description: 'Sign in with Facebook account',
      icon: '📘'
    },
    {
      id: 'anonymous',
      name: 'Anonymous Auth',
      description: 'Allow users to use app without signing in',
      icon: '👤'
    }
  ];

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

  const handleProviderToggle = (providerId) => {
    const enabledProviders = config.enabledProviders || [];
    const isEnabled = enabledProviders.includes(providerId);
    
    if (providerId === 'email') {
      // Email is required, cannot be disabled
      return;
    }
    
    if (isEnabled) {
      setConfig(prev => ({
        ...prev,
        enabledProviders: enabledProviders.filter(p => p !== providerId)
      }));
    } else {
      setConfig(prev => ({
        ...prev,
        enabledProviders: [...enabledProviders, providerId]
      }));
    }
  };

  const isProviderEnabled = (providerId) => {
    return config.enabledProviders?.includes(providerId) || false;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Enable Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <Key className="w-5 h-5 text-teal-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Enable Firebase Authentication</h3>
            <p className="text-sm text-gray-600">Configure Firebase Auth for user authentication</p>
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

      {/* Firebase Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Firebase Configuration</h3>
          <button
            type="button"
            onClick={() => setShowSensitiveData(!showSensitiveData)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            {showSensitiveData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showSensitiveData ? 'Hide' : 'Show'} Sensitive Data
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Key *</label>
            <input
              type={showSensitiveData ? 'text' : 'password'}
              value={config.apiKey}
              onChange={(e) => handleInputChange('apiKey', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="AIza..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project ID *</label>
            <input
              type="text"
              value={config.projectId}
              onChange={(e) => handleInputChange('projectId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="your-project-id"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Auth Domain *</label>
            <input
              type="text"
              value={config.authDomain}
              onChange={(e) => handleInputChange('authDomain', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="your-project.firebaseapp.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Storage Bucket</label>
            <input
              type="text"
              value={config.storageBucket}
              onChange={(e) => handleInputChange('storageBucket', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="your-project.appspot.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Messaging Sender ID</label>
            <input
              type="text"
              value={config.messagingSenderId}
              onChange={(e) => handleInputChange('messagingSenderId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="123456789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">App ID</label>
            <input
              type="text"
              value={config.appId}
              onChange={(e) => handleInputChange('appId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="1:123456789:web:abcd1234"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Measurement ID (Analytics)</label>
            <input
              type="text"
              value={config.measurementId}
              onChange={(e) => handleInputChange('measurementId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="G-XXXXXXXXXX"
            />
          </div>
        </div>
      </div>

      {/* Authentication Providers */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication Providers</h3>
        <p className="text-sm text-gray-600 mb-6">Select which authentication methods to enable for your users</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {authProviders.map((provider) => {
            const isEnabled = isProviderEnabled(provider.id);
            return (
              <div
                key={provider.id}
                className={`border-2 rounded-lg p-4 transition-all ${
                  isEnabled
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 bg-white'
                } ${provider.required ? 'opacity-75' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{provider.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        {provider.name}
                        {provider.required && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Required</span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600">{provider.description}</p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => handleProviderToggle(provider.id)}
                    disabled={provider.required}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isEnabled ? 'bg-teal-600' : 'bg-gray-200'
                    } ${provider.required ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Authentication Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-semibold text-gray-900">Email Verification</h4>
                <p className="text-sm text-gray-600">Require users to verify their email addresses</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleInputChange('emailVerification', !config.emailVerification)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.emailVerification ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.emailVerification ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-semibold text-gray-900">Phone Verification</h4>
                <p className="text-sm text-gray-600">Enable SMS-based phone number verification</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleInputChange('phoneVerification', !config.phoneVerification)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.phoneVerification ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.phoneVerification ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-sm font-semibold text-blue-800 mb-3">Firebase Auth Setup Instructions</h4>
        <div className="space-y-3 text-sm text-blue-700">
          <div>
            <p className="font-semibold">1. Enable Authentication in Firebase Console:</p>
            <ul className="ml-4 mt-2 space-y-1 list-disc">
              <li>Go to Firebase Console → Authentication → Sign-in method</li>
              <li>Enable the providers you want to use</li>
              <li>Configure OAuth settings for social providers</li>
            </ul>
          </div>
          
          <div>
            <p className="font-semibold">2. Configure Authorized Domains:</p>
            <ul className="ml-4 mt-2 space-y-1 list-disc">
              <li>Add your domain to authorized domains list</li>
              <li>Include localhost for development</li>
              <li>Add any subdomains you'll use</li>
            </ul>
          </div>
          
          <div>
            <p className="font-semibold">3. Set up Email Templates (Optional):</p>
            <ul className="ml-4 mt-2 space-y-1 list-disc">
              <li>Customize email verification templates</li>
              <li>Configure password reset emails</li>
              <li>Set up email change notifications</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">Security Best Practices</h4>
            <div className="text-sm text-yellow-700 space-y-2">
              <p><strong>API Key Security:</strong> Restrict your API key to specific domains and IPs</p>
              <p><strong>Email Verification:</strong> Enable email verification for better security</p>
              <p><strong>Password Policy:</strong> Set strong password requirements in Firebase Console</p>
              <p><strong>Rate Limiting:</strong> Configure rate limiting to prevent abuse</p>
              <p><strong>Monitoring:</strong> Enable Firebase Security Rules and monitor authentication logs</p>
            </div>
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

export default FirebaseAuthConfig;