import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  MapPin,
  User,
  ExternalLink
} from 'lucide-react';
import { mockJourneyUpdates } from '../../mock/newMockData';

const JourneyTimelinePanel = () => {
  const getUpdateIcon = (type) => {
    switch (type) {
      case 'milestone': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'progress': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'alert': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <MapPin className="w-5 h-5 text-gray-500" />;
    }
  };

  const getUpdateBadge = (type) => {
    switch (type) {
      case 'milestone':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Milestone</Badge>;
      case 'progress':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">In Progress</Badge>;
      case 'alert':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Alert</Badge>;
      default:
        return <Badge variant="secondary">Update</Badge>;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Timeline Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="text-green-600 text-sm font-medium">Completed</div>
          <div className="text-green-900 text-xl font-bold">892</div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="text-blue-600 text-sm font-medium">In Progress</div>
          <div className="text-blue-900 text-xl font-bold">234</div>
        </div>
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="text-red-600 text-sm font-medium">Alerts</div>
          <div className="text-red-900 text-xl font-bold">12</div>
        </div>
      </div>

      {/* Journey Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Live Journey Updates</h3>
          <Button size="sm" variant="outline" className="text-xs">
            <ExternalLink className="w-3 h-3 mr-1" />
            View All
          </Button>
        </div>

        <div className="space-y-4 max-h-80 overflow-y-auto">
          {mockJourneyUpdates.map((update, index) => (
            <div key={update.id} className="relative">
              {/* Timeline line */}
              {index < mockJourneyUpdates.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
              )}
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getUpdateIcon(update.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-yellow-100 text-yellow-700 text-xs">
                              {update.pilgrimName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <h4 className="font-medium text-sm text-gray-900">{update.pilgrimName}</h4>
                        </div>
                        <span className="text-xs text-gray-500">{formatTimestamp(update.timestamp)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <h5 className="font-semibold text-sm text-gray-800">{update.stage}</h5>
                        {getUpdateBadge(update.type)}
                      </div>
                      
                      <div className="flex items-center space-x-1 mb-2">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{update.location}</span>
                      </div>
                      
                      <p className="text-sm text-gray-700">{update.description}</p>
                      
                      {update.type === 'alert' && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <Button size="sm" variant="outline" className="text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Take Action
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-3">Alert Preferences</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm">
            <input type="checkbox" defaultChecked className="rounded border-gray-300" />
            <span>Emergency alerts</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input type="checkbox" defaultChecked className="rounded border-gray-300" />
            <span>Milestone completions</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input type="checkbox" className="rounded border-gray-300" />
            <span>Prayer time reminders</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default JourneyTimelinePanel;