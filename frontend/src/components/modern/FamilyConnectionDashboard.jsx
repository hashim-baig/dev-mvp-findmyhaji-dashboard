import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  Heart, 
  MessageSquare, 
  Send, 
  Clock, 
  MapPin,
  CheckCircle,
  AlertCircle,
  User
} from 'lucide-react';
import { mockFamilyMessages } from '../../mock/newMockData';

const FamilyConnectionDashboard = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'location_update': return <MapPin className="w-4 h-4 text-blue-500" />;
      case 'status_update': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'health_update': return <Heart className="w-4 h-4 text-red-500" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMessageTypeBadge = (type) => {
    switch (type) {
      case 'location_update': 
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Location</Badge>;
      case 'status_update': 
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Status</Badge>;
      case 'health_update': 
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Health</Badge>;
      default: 
        return <Badge variant="secondary">Message</Badge>;
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
    <div className="space-y-4">
      {/* Family Connection Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="text-green-600 text-sm font-medium">Messages Sent</div>
          <div className="text-green-900 text-xl font-bold">247</div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="text-blue-600 text-sm font-medium">Families Connected</div>
          <div className="text-blue-900 text-xl font-bold">189</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="text-purple-600 text-sm font-medium">Auto Updates</div>
          <div className="text-purple-900 text-xl font-bold">456</div>
        </div>
      </div>

      {/* Recent Family Messages */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Recent Family Messages</h3>
          <Button size="sm" variant="outline" className="text-xs">
            <Send className="w-3 h-3 mr-1" />
            Send Broadcast
          </Button>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {mockFamilyMessages.map((message) => (
            <Card key={message.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedMessage(message)}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-yellow-100 text-yellow-700">
                      {message.pilgrimName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm text-gray-900">{message.pilgrimName}</h4>
                      <div className="flex items-center space-x-2">
                        {getMessageTypeIcon(message.type)}
                        <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2">To: {message.familyContact}</p>
                    
                    <p className="text-sm text-gray-800 line-clamp-2">{message.message}</p>
                    
                    <div className="flex items-center justify-between mt-2">
                      {getMessageTypeBadge(message.type)}
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600">Delivered</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" className="justify-start">
            <Heart className="w-4 h-4 mr-2 text-pink-500" />
            Send Reassurance
          </Button>
          <Button size="sm" variant="outline" className="justify-start">
            <MapPin className="w-4 h-4 mr-2 text-blue-500" />
            Location Update
          </Button>
          <Button size="sm" variant="outline" className="justify-start">
            <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
            Health Status
          </Button>
          <Button size="sm" variant="outline" className="justify-start">
            <MessageSquare className="w-4 h-4 mr-2 text-green-500" />
            Custom Message
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FamilyConnectionDashboard;