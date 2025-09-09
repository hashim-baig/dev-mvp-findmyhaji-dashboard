import React, { useState, useEffect } from 'react';
import { MessageSquare, Save, RefreshCw, Eye, EyeOff, Phone } from 'lucide-react';

const SMSConfig = ({ onSave, loading, category }) => {
  const [configs, setConfigs] = useState({});
  const [showSensitiveData, setShowSensitiveData] = useState({});

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const smsProviders = [
    {
      id: 'twilio',
      name: 'Twilio',
      description: 'Global SMS service with reliable delivery',
      color: 'red',
      fields: [
        { key: 'accountSid', label: 'Account SID', type: 'text', required: true },
        { key: 'authToken', label: 'Auth Token', type: 'password', required: true },
        { key: 'fromNumber', label: 'From Number', type: 'tel', required: true, placeholder: '+1234567890' }
      ]
    },
    {
      id: 'twofactor',
      name: '2Factor',
      description: 'Indian SMS service with OTP specialization',
      color: 'blue',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
        { key: 'senderId', label: 'Sender ID', type: 'text', required: true, placeholder: 'FNDMYH' }
      ]
    },
    {
      id: 'msg91',
      name: 'Msg91',
      description: 'Enterprise SMS platform for India',
      color: 'green',
      fields: [
        { key: 'authKey', label: 'Auth Key', type: 'password', required: true },
        { key: 'senderId', label: 'Sender ID', type: 'text', required: true },
        { key: 'route', label: 'Route', type: 'select', required: true, options: ['4', '1'], default: '4' }
      ]
    },
    {
      id: 'nexmo',
      name: 'Vonage (Nexmo)',
      description: 'Global communications platform',
      color: 'purple',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'text', required: true },
        { key: 'apiSecret', label: 'API Secret', type: 'password', required: true },
        { key: 'fromName', label: 'From Name', type: 'text', required: true, placeholder: 'FindMyHaji' }
      ]
    },
    {
      id: 'releans',
      name: 'Releans',
      description: 'Middle East focused SMS service',
      color: 'orange',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
        { key: 'senderId', label: 'Sender ID', type: 'text', required: true },
        { key: 'channel', label: 'Channel', type: 'select', required: true, options: ['sms', 'whatsapp'], default: 'sms' }
      ]
    }
  ];

  const colorClasses = {
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', button: 'bg-red-600 hover:bg-red-700' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', button: 'bg-blue-600 hover:bg-blue-700' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', button: 'bg-green-600 hover:bg-green-700' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', button: 'bg-purple-600 hover:bg-purple-700' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', button: 'bg-orange-600 hover:bg-orange-700' }
  };

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
          setConfigs(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(configs);
  };

  const handleProviderToggle = (providerId) => {
    setConfigs(prev => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        enabled: !prev[providerId]?.enabled
      }
    }));
  };

  const handleFieldChange = (providerId, fieldKey, value) => {
    setConfigs(prev => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        [fieldKey]: value
      }
    }));
  };

  const toggleSensitiveData = (providerId, fieldKey) => {
    const key = `${providerId}_${fieldKey}`;
    setShowSensitiveData(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getProviderConfig = (providerId) => {
    return configs[providerId] || { enabled: false };
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-800 mb-2">SMS Service Configuration</h4>
            <p className="text-sm text-blue-700">
              Configure SMS providers for OTP verification, notifications, and alerts. You can enable multiple providers for redundancy.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {smsProviders.map((provider) => {
          const config = getProviderConfig(provider.id);
          const colors = colorClasses[provider.color];

          return (
            <div
              key={provider.id}
              className={`border-2 rounded-xl transition-all ${
                config.enabled
                  ? `${colors.border} ${colors.bg}`
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* Provider Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colors.bg}`}>
                      <Phone className={`w-5 h-5 ${colors.text.replace('text-', 'text-')}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                      <p className="text-sm text-gray-600">{provider.description}</p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => handleProviderToggle(provider.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.enabled ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Provider Configuration */}
              {config.enabled && (
                <div className="p-4 space-y-4">
                  {provider.fields.map((field) => {
                    const fieldValue = config[field.key] || field.default || '';
                    const isPassword = field.type === 'password';
                    const showPassword = showSensitiveData[`${provider.id}_${field.key}`];

                    return (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        
                        {field.type === 'select' ? (
                          <select
                            value={fieldValue}
                            onChange={(e) => handleFieldChange(provider.id, field.key, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required={field.required}
                          >
                            <option value="">Select {field.label}</option>
                            {field.options?.map(option => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="relative">
                            <input
                              type={isPassword && !showPassword ? 'password' : field.type}
                              value={fieldValue}
                              onChange={(e) => handleFieldChange(provider.id, field.key, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder={field.placeholder}
                              required={field.required}
                            />
                            
                            {isPassword && (
                              <button
                                type="button"
                                onClick={() => toggleSensitiveData(provider.id, field.key)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showPassword ? (
                                  <EyeOff className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <Eye className="w-4 h-4 text-gray-400" />
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Provider Specific Instructions */}
                  <div className={`${colors.bg} border ${colors.border} rounded-lg p-3`}>
                    <p className={`text-xs ${colors.text}`}>
                      {provider.id === 'twilio' && 'Get your credentials from Twilio Console → Account → API Keys & Tokens'}
                      {provider.id === 'twofactor' && 'Register at 2factor.in → API Documentation → Get API Key'}
                      {provider.id === 'msg91' && 'Sign up at msg91.com → API → Authentication Key'}
                      {provider.id === 'nexmo' && 'Get API credentials from Vonage Dashboard → API Settings'}
                      {provider.id === 'releans' && 'Register at releans.com → API → API Key Management'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SMS Best Practices */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">SMS Configuration Best Practices</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h5 className="font-semibold text-gray-700 mb-2">Regional Recommendations</h5>
            <ul className="space-y-1">
              <li>• <strong>India:</strong> Msg91, 2Factor (local compliance)</li>
              <li>• <strong>Middle East:</strong> Releans (Arabic support)</li>
              <li>• <strong>Global:</strong> Twilio, Vonage (worldwide coverage)</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-gray-700 mb-2">Setup Tips</h5>
            <ul className="space-y-1">
              <li>• Test with multiple providers for redundancy</li>
              <li>• Configure sender IDs for brand recognition</li>
              <li>• Monitor delivery rates and switch if needed</li>
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
          {loading ? 'Saving...' : 'Update SMS Configuration'}
        </button>
      </div>
    </form>
  );
};

export default SMSConfig;