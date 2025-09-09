import React, { useState, useEffect } from 'react';
import { Settings, Map, Bell, Shield, Mail, MessageSquare, CreditCard, Database, Smartphone, Key, Save, AlertTriangle, CheckCircle, Info, Upload, FileText, Toggle } from 'lucide-react';
import MapAPIConfig from './configs/MapAPIConfig';
import FirebaseNotificationConfig from './configs/FirebaseNotificationConfig';
import RecaptchaConfig from './configs/RecaptchaConfig';
import AppleLoginConfig from './configs/AppleLoginConfig';
import EmailConfig from './configs/EmailConfig';
import SMSConfig from './configs/SMSConfig';
import PaymentConfig from './configs/PaymentConfig';
import StorageConfig from './configs/StorageConfig';
import AppSettings from './configs/AppSettings';
import FirebaseAuthConfig from './configs/FirebaseAuthConfig';

const ThirdPartyConfigurations = () => {
  const [activeTab, setActiveTab] = useState('map-api');
  const [loading, setLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const tabs = [
    {
      id: 'map-api',
      name: 'Map API',
      icon: Map,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      component: MapAPIConfig
    },
    {
      id: 'firebase-notification',
      name: 'Firebase Notification',
      icon: Bell,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      component: FirebaseNotificationConfig
    },
    {
      id: 'recaptcha',
      name: 'reCAPTCHA',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      component: RecaptchaConfig
    },
    {
      id: 'apple-login',
      name: 'Apple Login',
      icon: Smartphone,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      component: AppleLoginConfig
    },
    {
      id: 'email-config',
      name: 'Email Config',
      icon: Mail,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      component: EmailConfig
    },
    {
      id: 'sms-config',
      name: 'SMS Config',
      icon: MessageSquare,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      component: SMSConfig
    },
    {
      id: 'payment-config',
      name: 'Payment Config',
      icon: CreditCard,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      component: PaymentConfig
    },
    {
      id: 'storage-config',
      name: 'Storage Connection',
      icon: Database,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      component: StorageConfig
    },
    {
      id: 'app-settings',
      name: 'App Settings',
      icon: Settings,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      component: AppSettings
    },
    {
      id: 'firebase-auth',
      name: 'Firebase Auth',
      icon: Key,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      component: FirebaseAuthConfig
    }
  ];

  const getCurrentTab = () => tabs.find(tab => tab.id === activeTab);
  const CurrentComponent = getCurrentTab()?.component;

  const handleSave = async (configData) => {
    try {
      setLoading(true);
      setErrorMessage('');
      
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('findmyhaji_token');
      
      const response = await fetch(`${BACKEND_URL}/api/configurations/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category: activeTab,
          config: configData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSavedMessage('Configuration saved successfully!');
        setTimeout(() => setSavedMessage(''), 3000);
      } else {
        setErrorMessage(data.message || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      setErrorMessage('Error saving configuration: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">3rd Party Configurations</h1>
              <p className="text-gray-600">Configure external services and integrations for FindMyHaji</p>
            </div>
          </div>

          {/* Status Messages */}
          {savedMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">{savedMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">{errorMessage}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Configuration Categories</h3>
                <p className="text-sm text-gray-600 mt-1">Select a service to configure</p>
              </div>
              <nav className="p-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 mb-1 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${activeTab === tab.id ? 'bg-white/20' : tab.bgColor}`}>
                        <IconComponent className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
                      </div>
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md border border-gray-100">
              {/* Tab Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${getCurrentTab()?.bgColor}`}>
                    {getCurrentTab()?.icon && React.createElement(getCurrentTab().icon, {
                      className: `w-6 h-6 ${getCurrentTab()?.color}`
                    })}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{getCurrentTab()?.name}</h2>
                    <p className="text-gray-600">Configure your {getCurrentTab()?.name.toLowerCase()} settings</p>
                  </div>
                </div>
              </div>

              {/* Configuration Form */}
              <div className="p-6">
                {CurrentComponent && (
                  <CurrentComponent
                    onSave={handleSave}
                    loading={loading}
                    category={activeTab}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThirdPartyConfigurations;