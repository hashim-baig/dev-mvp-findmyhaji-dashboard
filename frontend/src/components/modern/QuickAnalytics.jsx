import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { 
  Users, 
  MapPin, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Activity,
  UserCheck,
  Clock
} from 'lucide-react';
import { mockAnalytics } from '../../mock/newMockData';

const QuickAnalytics = () => {
  const [providerStats, setProviderStats] = useState({
    total: 0,
    approved: 0,
    pending: 0
  });

  useEffect(() => {
    // Fetch provider statistics
    const fetchProviderStats = async () => {
      try {
        const token = localStorage.getItem('findmyhaji_token') || localStorage.getItem('authToken');
        if (!token) return;

        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/providers/pending/count`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProviderStats({
            total: data.data.totalProviders || 0,
            approved: data.data.approvedProviders || 0,
            pending: data.data.pendingCount || 0
          });
        }
      } catch (error) {
        console.error('Error fetching provider stats:', error);
        // Set mock data as fallback
        setProviderStats({
          total: 25,
          approved: 18,
          pending: 3
        });
      }
    };

    fetchProviderStats();
  }, []);
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Pilgrims</p>
                <p className="text-2xl font-bold text-green-900">{mockAnalytics.totalPilgrims.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+8.2% from last Hajj</span>
                </div>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Active Journeys</p>
                <p className="text-2xl font-bold text-blue-900">{mockAnalytics.activeJourneys}</p>
                <div className="flex items-center mt-1">
                  <Activity className="w-3 h-3 text-blue-500 mr-1" />
                  <span className="text-xs text-blue-600">Live tracking</span>
                </div>
              </div>
              <MapPin className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Providers</p>
                <p className="text-2xl font-bold text-yellow-900">{providerStats.total}</p>
                <div className="flex items-center mt-1">
                  <UserCheck className="w-3 h-3 text-yellow-500 mr-1" />
                  <span className="text-xs text-yellow-600">{providerStats.approved} approved</span>
                </div>
              </div>
              <div className="relative">
                <UserCheck className="w-8 h-8 text-yellow-500" />
                {providerStats.pending > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {providerStats.pending}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">SOS Triggered</p>
                <p className="text-2xl font-bold text-red-900">{mockAnalytics.sosTriggered}</p>
                <div className="flex items-center mt-1">
                  <AlertTriangle className="w-3 h-3 text-red-500 mr-1" />
                  <span className="text-xs text-red-600">Requires attention</span>
                </div>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Completed Hajj</p>
                <p className="text-2xl font-bold text-purple-900">{mockAnalytics.completedMilestones.Complete}</p>
                <div className="flex items-center mt-1">
                  <CheckCircle className="w-3 h-3 text-purple-500 mr-1" />
                  <span className="text-xs text-purple-600">Alhamdulillah</span>
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Check-in Frequency */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Daily Check-in Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={mockAnalytics.checkInFrequency}>
                <XAxis 
                  dataKey="time" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#d4af37" 
                  strokeWidth={3}
                  dot={{ fill: '#d4af37', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Group Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Group Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={mockAnalytics.groupLocations}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="count"
                >
                  {mockAnalytics.groupLocations.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {mockAnalytics.groupLocations.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div className="text-xs">
                    <p className="font-medium text-gray-800">{item.location}</p>
                    <p className="text-gray-500">{item.count} pilgrims</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Journey Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Hajj Journey Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(mockAnalytics.completedMilestones).map(([stage, count]) => (
              <div key={stage} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600">{stage}</div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div 
                    className="bg-yellow-500 h-1.5 rounded-full" 
                    style={{ width: `${(count / mockAnalytics.totalPilgrims) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickAnalytics;