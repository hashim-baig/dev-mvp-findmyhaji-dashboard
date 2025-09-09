import React, { useState, useEffect } from 'react';
import { CreditCard, Save, RefreshCw, Eye, EyeOff, Smartphone, Globe, DollarSign, Building } from 'lucide-react';

const PaymentConfig = ({ onSave, loading, category }) => {
  const [configs, setConfigs] = useState({});
  const [showSensitiveData, setShowSensitiveData] = useState({});

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const digitalGateways = [
    {
      id: 'paytm',
      name: 'Paytm',
      description: 'Popular Indian digital wallet and payment gateway',
      icon: Smartphone,
      color: 'blue',
      fields: [
        { key: 'merchantId', label: 'Merchant ID', type: 'text', required: true },
        { key: 'merchantKey', label: 'Merchant Key', type: 'password', required: true },
        { key: 'environment', label: 'Environment', type: 'select', options: ['sandbox', 'production'], default: 'sandbox' }
      ]
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Global payment processing platform',
      icon: CreditCard,
      color: 'purple',
      fields: [
        { key: 'publishableKey', label: 'Publishable Key', type: 'text', required: true },
        { key: 'secretKey', label: 'Secret Key', type: 'password', required: true },
        { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: false }
      ]
    },
    {
      id: 'razorpay',
      name: 'Razorpay',
      description: 'Indian payment gateway with multiple options',
      icon: DollarSign,
      color: 'indigo',
      fields: [
        { key: 'keyId', label: 'Key ID', type: 'text', required: true },
        { key: 'keySecret', label: 'Key Secret', type: 'password', required: true },
        { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: false }
      ]
    },
    {
      id: 'senangpay',
      name: 'Senang Pay',
      description: 'Malaysian payment gateway',
      icon: Globe,
      color: 'green',
      fields: [
        { key: 'merchantId', label: 'Merchant ID', type: 'text', required: true },
        { key: 'secretKey', label: 'Secret Key', type: 'password', required: true },
        { key: 'environment', label: 'Environment', type: 'select', options: ['sandbox', 'production'], default: 'sandbox' }
      ]
    }
  ];

  const offlinePayments = [
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      description: 'Traditional bank account transfer',
      icon: Building,
      color: 'gray',
      fields: [
        { key: 'accountName', label: 'Account Holder Name', type: 'text', required: true },
        { key: 'accountNumber', label: 'Account Number', type: 'text', required: true },
        { key: 'bankName', label: 'Bank Name', type: 'text', required: true },
        { key: 'routingNumber', label: 'Routing/SWIFT Code', type: 'text', required: true },
        { key: 'instructions', label: 'Payment Instructions', type: 'textarea', required: false }
      ]
    },
    {
      id: 'esewa',
      name: 'eSewa',
      description: 'Nepali digital wallet service',
      icon: Smartphone,
      color: 'green',
      fields: [
        { key: 'esewaId', label: 'eSewa ID', type: 'text', required: true },
        { key: 'qrCode', label: 'QR Code URL', type: 'url', required: false },
        { key: 'instructions', label: 'Payment Instructions', type: 'textarea', required: false }
      ]
    },
    {
      id: 'googlepay',
      name: 'Google Pay',
      description: 'UPI-based payment method',
      icon: Smartphone,
      color: 'red',
      fields: [
        { key: 'upiId', label: 'UPI ID', type: 'text', required: true },
        { key: 'qrCode', label: 'QR Code URL', type: 'url', required: false },
        { key: 'instructions', label: 'Payment Instructions', type: 'textarea', required: false }
      ]
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Global digital payment platform',
      icon: Globe,
      color: 'blue',
      fields: [
        { key: 'paypalEmail', label: 'PayPal Email', type: 'email', required: true },
        { key: 'paypalLink', label: 'PayPal.me Link', type: 'url', required: false },
        { key: 'instructions', label: 'Payment Instructions', type: 'textarea', required: false }
      ]
    }
  ];

  const colorClasses = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-800' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
    gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' }
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

  const renderPaymentProvider = (provider, section) => {
    const config = getProviderConfig(provider.id);
    const colors = colorClasses[provider.color];
    const IconComponent = provider.icon;

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
                <IconComponent className={`w-5 h-5 ${colors.text}`} />
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
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={fieldValue}
                      onChange={(e) => handleFieldChange(provider.id, field.key, e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      required={field.required}
                    />
                  ) : (
                    <div className="relative">
                      <input
                        type={isPassword && !showPassword ? 'password' : field.type}
                        value={fieldValue}
                        onChange={(e) => handleFieldChange(provider.id, field.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
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
          </div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Digital Payment Gateways */}
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Digital Payment Gateways</h3>
          <p className="text-gray-600">Configure automated payment processing services</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {digitalGateways.map(provider => renderPaymentProvider(provider, 'digital'))}
        </div>
      </div>

      {/* Offline Payment Methods */}
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Offline Payment Methods</h3>
          <p className="text-gray-600">Configure manual payment collection methods</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {offlinePayments.map(provider => renderPaymentProvider(provider, 'offline'))}
        </div>
      </div>

      {/* Payment Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">Payment Security Guidelines</h4>
            <div className="text-sm text-yellow-700 space-y-2">
              <p><strong>Digital Gateways:</strong> Always use HTTPS and validate webhook signatures</p>
              <p><strong>API Keys:</strong> Keep secret keys secure and rotate them regularly</p>
              <p><strong>Testing:</strong> Use sandbox/test modes before going live</p>
              <p><strong>Compliance:</strong> Ensure PCI DSS compliance for card processing</p>
              <p><strong>Monitoring:</strong> Set up fraud detection and transaction monitoring</p>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-3">Regional Payment Recommendations</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
          <div>
            <p className="font-semibold mb-2">🇮🇳 India</p>
            <p>• Razorpay (comprehensive)</p>
            <p>• Paytm (popular wallet)</p>
            <p>• Google Pay (UPI)</p>
          </div>
          <div>
            <p className="font-semibold mb-2">🇲🇾 Malaysia</p>
            <p>• Senang Pay (local)</p>
            <p>• Stripe (international)</p>
          </div>
          <div>
            <p className="font-semibold mb-2">🌍 Global</p>
            <p>• Stripe (worldwide)</p>
            <p>• PayPal (trusted)</p>
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
          {loading ? 'Saving...' : 'Update Payment Configuration'}
        </button>
      </div>
    </form>
  );
};

export default PaymentConfig;