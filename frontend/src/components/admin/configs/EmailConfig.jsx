import React, { useState, useEffect } from 'react';
import { Mail, Save, RefreshCw, Send, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

const EmailConfig = ({ onSave, loading, category }) => {
  const [activeTab, setActiveTab] = useState('configuration');
  const [config, setConfig] = useState({
    mailerName: 'FindMyHaji',
    driver: 'smtp',
    host: '',
    port: '587',
    username: '',
    emailId: '',
    encryption: 'tls',
    password: '',
    enabled: false
  });
  const [testEmail, setTestEmail] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const drivers = [
    { value: 'smtp', label: 'SMTP', description: 'Standard SMTP server' },
    { value: 'mailgun', label: 'Mailgun', description: 'Mailgun service' },
    { value: 'ses', label: 'Amazon SES', description: 'Amazon Simple Email Service' },
    { value: 'sendgrid', label: 'SendGrid', description: 'SendGrid email service' }
  ];

  const encryptionTypes = [
    { value: 'tls', label: 'TLS' },
    { value: 'ssl', label: 'SSL' },
    { value: 'none', label: 'None' }
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

  const sendTestEmail = async () => {
    if (!testEmail) {
      alert('Please enter a test email address');
      return;
    }

    try {
      setTestLoading(true);
      setTestResult(null);
      
      const token = localStorage.getItem('findmyhaji_token');
      const response = await fetch(`${BACKEND_URL}/api/configurations/test-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: testEmail,
          config: config
        })
      });

      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Error sending test email: ' + error.message
      });
    } finally {
      setTestLoading(false);
    }
  };

  const tabs = [
    { id: 'configuration', name: 'Configuration', icon: Mail },
    { id: 'test', name: 'Send Test Mail', icon: Send }
  ];

  return (
    <div className="space-y-6">
      {/* Enable Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-purple-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Enable Email Service</h3>
            <p className="text-sm text-gray-600">Activate email notifications and communications</p>
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

      {/* Tabs */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'configuration' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mailer Name
                  </label>
                  <input
                    type="text"
                    value={config.mailerName}
                    onChange={(e) => handleInputChange('mailerName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="FindMyHaji"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Driver
                  </label>
                  <select
                    value={config.driver}
                    onChange={(e) => handleInputChange('driver', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {drivers.map(driver => (
                      <option key={driver.value} value={driver.value}>
                        {driver.label} - {driver.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Host *
                  </label>
                  <input
                    type="text"
                    value={config.host}
                    onChange={(e) => handleInputChange('host', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="smtp.gmail.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Port *
                  </label>
                  <input
                    type="number"
                    value={config.port}
                    onChange={(e) => handleInputChange('port', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="587"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={config.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="your-email@gmail.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email ID *
                  </label>
                  <input
                    type="email"
                    value={config.emailId}
                    onChange={(e) => handleInputChange('emailId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="noreply@findmyhaji.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Encryption
                  </label>
                  <select
                    value={config.encryption}
                    onChange={(e) => handleInputChange('encryption', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {encryptionTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={config.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                      placeholder="App password or regular password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Common Email Providers */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-3">Common Email Provider Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-blue-700">
                  <div>
                    <p className="font-semibold">Gmail:</p>
                    <p>Host: smtp.gmail.com</p>
                    <p>Port: 587 (TLS) or 465 (SSL)</p>
                    <p>Note: Use App Password for 2FA accounts</p>
                  </div>
                  <div>
                    <p className="font-semibold">Outlook/Hotmail:</p>
                    <p>Host: smtp-mail.outlook.com</p>
                    <p>Port: 587</p>
                    <p>Encryption: TLS</p>
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
          )}

          {activeTab === 'test' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Test Email Requirements</p>
                    <p>Make sure you have saved your email configuration before testing. The test will use your current configuration settings.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Email Address
                  </label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="test@example.com"
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={sendTestEmail}
                  disabled={testLoading || !testEmail}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {testLoading ? 'Sending...' : 'Send Test Email'}
                </button>

                {testResult && (
                  <div className={`p-4 rounded-lg border ${
                    testResult.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      {testResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      )}
                      <div className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                        <p className="font-semibold">
                          {testResult.success ? 'Email Sent Successfully!' : 'Email Failed'}
                        </p>
                        <p className="text-sm mt-1">{testResult.message}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailConfig;