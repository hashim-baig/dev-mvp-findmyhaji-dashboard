import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Globe, Smartphone, Clock, Shield, Upload } from 'lucide-react';

const AppSettings = ({ onSave, loading, category }) => {
  const [config, setConfig] = useState({
    appName: 'FindMyHaji',
    appVersion: '1.0.0',
    appDescription: 'Your Pilgrimage. Connected.',
    supportEmail: 'support@findmyhaji.com',
    supportPhone: '',
    appLogo: '',
    appIcon: '',
    primaryColor: '#0f4c3a',
    secondaryColor: '#d4af37',
    timezone: 'Asia/Riyadh',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    defaultLanguage: 'en',
    enabledLanguages: ['en', 'ar'],
    maintenanceMode: false,
    maintenanceMessage: 'We are currently performing scheduled maintenance. Please check back soon.',
    forceUpdate: false,
    minAppVersion: '1.0.0',
    privacyPolicyUrl: '',
    termsOfServiceUrl: '',
    aboutUrl: '',
    faqUrl: ''
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const timezones = [
    'Asia/Riyadh', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Karachi',
    'Europe/London', 'America/New_York', 'America/Los_Angeles',
    'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney'
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'Arabic - العربية' },
    { code: 'ur', name: 'Urdu - اُردُو' },
    { code: 'bn', name: 'Bengali - বাংলা' },
    { code: 'hi', name: 'Hindi - हिंदी' }
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

  const handleLanguageToggle = (languageCode) => {
    const enabledLanguages = config.enabledLanguages || [];
    const isEnabled = enabledLanguages.includes(languageCode);
    
    if (isEnabled) {
      // Don't allow removing the default language
      if (languageCode === config.defaultLanguage) {
        alert('Cannot disable the default language. Please change the default language first.');
        return;
      }
      setConfig(prev => ({
        ...prev,
        enabledLanguages: enabledLanguages.filter(lang => lang !== languageCode)
      }));
    } else {
      setConfig(prev => ({
        ...prev,
        enabledLanguages: [...enabledLanguages, languageCode]
      }));
    }
  };

  const handleFileUpload = (field, e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setConfig(prev => ({
          ...prev,
          [field]: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a valid image file.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic App Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-blue-600" />
          Basic App Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">App Name</label>
            <input
              type="text"
              value={config.appName}
              onChange={(e) => handleInputChange('appName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">App Version</label>
            <input
              type="text"
              value={config.appVersion}
              onChange={(e) => handleInputChange('appVersion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="1.0.0"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">App Description</label>
            <textarea
              value={config.appDescription}
              onChange={(e) => handleInputChange('appDescription', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="Brief description of your app"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
            <input
              type="email"
              value={config.supportEmail}
              onChange={(e) => handleInputChange('supportEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Support Phone</label>
            <input
              type="tel"
              value={config.supportPhone}
              onChange={(e) => handleInputChange('supportPhone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="+966 XXX XXX XXX"
            />
          </div>
        </div>
      </div>

      {/* App Branding */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">App Branding</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">App Logo</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {config.appLogo ? (
                <div className="space-y-2">
                  <img src={config.appLogo} alt="App Logo" className="max-h-20 mx-auto" />
                  <p className="text-sm text-green-600">✓ Logo uploaded</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-500">Upload app logo (recommended: 200x50px)</p>
                </div>
              )}
              <label className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('appLogo', e)}
                  className="hidden"
                />
                Choose Logo
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">App Icon</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {config.appIcon ? (
                <div className="space-y-2">
                  <img src={config.appIcon} alt="App Icon" className="w-16 h-16 mx-auto rounded-lg" />
                  <p className="text-sm text-green-600">✓ Icon uploaded</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-500">Upload app icon (recommended: 512x512px)</p>
                </div>
              )}
              <label className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('appIcon', e)}
                  className="hidden"
                />
                Choose Icon
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={config.primaryColor}
                onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={config.primaryColor}
                onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="#0f4c3a"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={config.secondaryColor}
                onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={config.secondaryColor}
                onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="#d4af37"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Localization Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          Localization Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={config.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {timezones.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
            <select
              value={config.dateFormat}
              onChange={(e) => handleInputChange('dateFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
            <select
              value={config.timeFormat}
              onChange={(e) => handleInputChange('timeFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="12h">12-hour (AM/PM)</option>
              <option value="24h">24-hour</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Language</label>
            <select
              value={config.defaultLanguage}
              onChange={(e) => handleInputChange('defaultLanguage', e.target.value)}
              className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Enabled Languages</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {languages.map(lang => {
                const isEnabled = config.enabledLanguages?.includes(lang.code) || lang.code === config.defaultLanguage;
                return (
                  <label key={lang.code} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => handleLanguageToggle(lang.code)}
                      disabled={lang.code === config.defaultLanguage}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{lang.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-orange-600" />
          System Settings
        </h3>
        
        <div className="space-y-6">
          {/* Maintenance Mode */}
          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-orange-600" />
              <div>
                <h4 className="font-semibold text-gray-900">Maintenance Mode</h4>
                <p className="text-sm text-gray-600">Temporarily disable app access for maintenance</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleInputChange('maintenanceMode', !config.maintenanceMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.maintenanceMode ? 'bg-orange-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          
          {config.maintenanceMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Message</label>
              <textarea
                value={config.maintenanceMessage}
                onChange={(e) => handleInputChange('maintenanceMessage', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                placeholder="Enter the message users will see during maintenance"
              />
            </div>
          )}
          
          {/* Force Update */}
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-red-600" />
              <div>
                <h4 className="font-semibold text-gray-900">Force App Update</h4>
                <p className="text-sm text-gray-600">Require users to update to continue using the app</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleInputChange('forceUpdate', !config.forceUpdate)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.forceUpdate ? 'bg-red-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.forceUpdate ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          
          {config.forceUpdate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum App Version</label>
              <input
                type="text"
                value={config.minAppVersion}
                onChange={(e) => handleInputChange('minAppVersion', e.target.value)}
                className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="1.0.0"
              />
            </div>
          )}
        </div>
      </div>

      {/* Legal Links */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal & Support Links</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Privacy Policy URL</label>
            <input
              type="url"
              value={config.privacyPolicyUrl}
              onChange={(e) => handleInputChange('privacyPolicyUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="https://findmyhaji.com/privacy"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Terms of Service URL</label>
            <input
              type="url"
              value={config.termsOfServiceUrl}
              onChange={(e) => handleInputChange('termsOfServiceUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="https://findmyhaji.com/terms"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">About URL</label>
            <input
              type="url"
              value={config.aboutUrl}
              onChange={(e) => handleInputChange('aboutUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="https://findmyhaji.com/about"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">FAQ URL</label>
            <input
              type="url"
              value={config.faqUrl}
              onChange={(e) => handleInputChange('faqUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="https://findmyhaji.com/faq"
            />
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
          {loading ? 'Saving...' : 'Update App Settings'}
        </button>
      </div>
    </form>
  );
};

export default AppSettings;