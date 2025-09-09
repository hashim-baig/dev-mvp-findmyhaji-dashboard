import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  UserPlus, 
  Plane, 
  Heart, 
  CheckCircle, 
  Star, 
  Clock,
  ExternalLink
} from 'lucide-react';
import { mockRecentActivities } from '../../mock/mockData';

const ActivityLog = () => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'registration':
        return <UserPlus className="w-4 h-4 text-blue-600" />;
      case 'trip':
        return <Plane className="w-4 h-4 text-amber-600" />;
      case 'donation':
        return <Heart className="w-4 h-4 text-rose-600" />;
      case 'agent':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'completion':
        return <Star className="w-4 h-4 text-purple-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getActivityBadge = (type) => {
    switch (type) {
      case 'registration':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">New Registration</Badge>;
      case 'trip':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Trip Update</Badge>;
      case 'donation':
        return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">Donation</Badge>;
      case 'agent':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Agent Activity</Badge>;
      case 'completion':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Completion</Badge>;
      default:
        return <Badge variant="secondary">Activity</Badge>;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
            <Clock className="w-6 h-6 mr-2 text-slate-600" />
            Recent Activity
          </CardTitle>
          <Button variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            View All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {mockRecentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {activity.message}
                  </p>
                  <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  {getActivityBadge(activity.type)}
                </div>
              </div>
            </div>
          ))}
          
          {/* Load More Activities */}
          <div className="pt-4 border-t border-slate-200">
            <Button variant="ghost" className="w-full text-slate-600 hover:text-slate-800">
              Load More Activities
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityLog;