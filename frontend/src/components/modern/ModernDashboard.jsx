import React from 'react';
import RealTimeTrackingPanel from './RealTimeTrackingPanel';
import FamilyConnectionDashboard from './FamilyConnectionDashboard';
import JourneyTimelinePanel from './JourneyTimelinePanel';
import QuickAnalytics from './QuickAnalytics';

const ModernDashboard = () => {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              <span className="text-yellow-600">السلام عليكم</span> Operations Center
            </h1>
            <p className="text-gray-600">
              Real-time monitoring and management of {1247} active pilgrims across {23} groups
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Makkah Operations Center</div>
            <div className="text-lg font-semibold text-gray-900">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Analytics Overview */}
      <QuickAnalytics />
      
      {/* Real-Time Tracking Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Real-Time Pilgrim Tracking</h2>
        <RealTimeTrackingPanel />
      </div>
      
      {/* Family Connection & Journey Timeline */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Family Connection Hub</h2>
          <FamilyConnectionDashboard />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Journey Timeline & Updates</h2>
          <JourneyTimelinePanel />
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard;