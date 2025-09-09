import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, MapPin, Plane, DollarSign, Heart, TrendingUp } from 'lucide-react';
import { mockDashboardStats } from '../../mock/mockData';

const DashboardStats = () => {
  const stats = [
    {
      title: 'Total Pilgrims',
      value: mockDashboardStats.totalPilgrims.toLocaleString(),
      icon: Users,
      change: '+12%',
      changeType: 'positive',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Agents',
      value: mockDashboardStats.activeAgents.toString(),
      icon: MapPin,
      change: '+3',
      changeType: 'positive',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Ongoing Trips',
      value: mockDashboardStats.ongoingTrips.toString(),
      icon: Plane,
      change: '+8',
      changeType: 'positive',
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      title: 'Revenue',
      value: `$${(mockDashboardStats.revenue / 1000).toFixed(0)}K`,
      icon: DollarSign,
      change: '+18%',
      changeType: 'positive',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Donations',
      value: `$${(mockDashboardStats.donations / 1000).toFixed(0)}K`,
      icon: Heart,
      change: '+25%',
      changeType: 'positive',
      color: 'from-rose-500 to-rose-600',
      bgColor: 'bg-rose-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <Card key={index} className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className={`text-xs font-medium ${
                      stat.changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-slate-500">this month</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardStats;