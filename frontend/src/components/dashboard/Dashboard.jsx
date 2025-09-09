import React from 'react';
import DashboardStats from './DashboardStats';
import DashboardCharts from './DashboardCharts';
import PilgrimMap from './PilgrimMap';
import ActivityLog from './ActivityLog';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          السلام عليكم، Welcome back!
        </h1>
        <p className="text-slate-600">
          Here's what's happening with your pilgrims and agents today.
        </p>
      </div>

      {/* Dashboard Stats Cards */}
      <DashboardStats />
      
      {/* Charts Section */}
      <DashboardCharts />
      
      {/* Map and Activity Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <PilgrimMap />
        </div>
        <div className="xl:col-span-1">
          <ActivityLog />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;