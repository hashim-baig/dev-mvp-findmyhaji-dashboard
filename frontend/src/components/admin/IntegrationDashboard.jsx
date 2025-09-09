import React, { useState } from 'react';
import PaymentTestInterface from './integrations/PaymentTestInterface';
import FirebaseTestInterface from './integrations/FirebaseTestInterface';
import MapsTestInterface from './integrations/MapsTestInterface';

const IntegrationDashboard = () => {
  const [activeTab, setActiveTab] = useState('payments');

  const tabs = [
    {
      id: 'payments',
      name: 'Stripe Payments',
      icon: '💳',
      component: PaymentTestInterface
    },
    {
      id: 'firebase',
      name: 'Firebase Services',
      icon: '🔥',
      component: FirebaseTestInterface
    },
    {
      id: 'maps',
      name: 'Google Maps',
      icon: '🗺️',
      component: MapsTestInterface
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              🚀 Integration Testing Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Test and manage third-party integrations for FindMyHaji mobile apps
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.name}</span>
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {ActiveComponent && <ActiveComponent />}
      </div>

      {/* Integration Status Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Integration Status Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Stripe Status */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">💳 Stripe Payments</h3>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                  Configured
                </span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ Payment packages configured</li>
                <li>✅ Checkout session creation</li>
                <li>✅ Transaction tracking</li>
                <li>✅ Webhook handling</li>
              </ul>
            </div>

            {/* Firebase Status */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">🔥 Firebase Services</h3>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                  Needs Setup
                </span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>⚙️ Authentication (service key needed)</li>
                <li>⚙️ Push notifications (service key needed)</li>
                <li>⚙️ Firestore database (service key needed)</li>
                <li>⚙️ Cloud storage (service key needed)</li>
              </ul>
            </div>

            {/* Google Maps Status */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">🗺️ Google Maps</h3>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                  Needs API Key
                </span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>⚙️ Geocoding (API key needed)</li>
                <li>⚙️ Directions (API key needed)</li>
                <li>⚙️ Places search (API key needed)</li>
                <li>✅ Static maps working</li>
              </ul>
            </div>
          </div>

          {/* Quick Setup Links */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">🔧 Quick Setup Links</h3>
            <div className="flex flex-wrap gap-3">
              <a
                href="/admin/third-party-configurations"
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
              >
                3rd Party Configurations
              </a>
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
              >
                Firebase Console
              </a>
              <a
                href="https://console.cloud.google.com/apis/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Google Cloud Console
              </a>
              <a
                href="https://dashboard.stripe.com/apikeys"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Stripe API Keys
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">🕌 FindMyHaji - Third-Party Integrations</h3>
            <p className="text-gray-300 text-sm">
              Comprehensive backend APIs for Flutter mobile apps supporting pilgrimage management,
              real-time tracking, secure payments, and enhanced user experiences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationDashboard;