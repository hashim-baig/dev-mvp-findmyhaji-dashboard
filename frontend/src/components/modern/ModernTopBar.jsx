import React, { useState } from 'react';
import { Search, Bell, User, Settings, LogOut, AlertTriangle, Clock, MapPin } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { mockNotifications, mockAdminUser } from '../../mock/newMockData';

const ModernTopBar = ({ onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  
  const unreadCount = mockNotifications.filter(n => !n.read).length;
  const localStorageData = localStorage.getItem('findmyhaji_user');
  const item = JSON.parse(localStorageData);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'emergency': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'success': return <MapPin className="w-4 h-4 text-green-500" />;
      case 'warning': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Page Title & Breadcrumb */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
            <span>Operations Center</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">Real-Time Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Live Pilgrim Tracking</h1>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search pilgrims, groups, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:border-yellow-500 focus:ring-yellow-500/20 rounded-xl"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Live Status Indicator */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-full border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700">Live</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="relative text-gray-600 hover:text-gray-800 rounded-xl p-2"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs rounded-full">
                  {unreadCount}
                </Badge>
              )}
            </Button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Live Notifications</h3>
                  <p className="text-xs text-gray-500">{unreadCount} urgent alerts</p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {mockNotifications.map((notification) => (
                    <div key={notification.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 ${!notification.read ? 'bg-yellow-50/50 border-l-4 border-l-yellow-500' : ''}`}>
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-sm text-gray-900">{notification.title}</h4>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{notification.timestamp}</span>
                          </div>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-100 text-center">
                  <Button variant="ghost" size="sm" className="text-yellow-600 hover:text-yellow-700 font-medium">
                    View All Notifications
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 hover:bg-gray-50 rounded-xl px-3 py-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src='https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' alt={item.name} />
                  <AvatarFallback className="bg-yellow-100 text-yellow-700">
                    {item.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.role}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-64 rounded-xl">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.email}</p>
                  <p className="text-xs text-gray-500">{item.location}</p>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="cursor-pointer rounded-lg">
                <User className="w-4 h-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              
              <DropdownMenuItem className="cursor-pointer rounded-lg">
                <Settings className="w-4 h-4 mr-2" />
                System Preferences
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-600 focus:text-red-600 rounded-lg">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default ModernTopBar;