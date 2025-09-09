import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  Heart, 
  FileText, 
  Settings,
  Building,
  LogOut
} from 'lucide-react';
import { Button } from '../ui/button';

const Sidebar = ({ onLogout }) => {
  const location = useLocation();
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', active: true },
    { icon: Users, label: 'Pilgrims', path: '/pilgrims' },
    { icon: MapPin, label: 'Haji Travel Agents', path: '/agents' },
    { icon: Heart, label: 'Donations', path: '/donations' },
    { icon: FileText, label: 'Reports', path: '/reports' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];

  const isActive = (path) => location.pathname === path || (path === '/dashboard' && location.pathname === '/');

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white min-h-screen flex flex-col shadow-2xl">
      {/* Logo Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg">
            <Building className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">FindMyHaji</h1>
            <p className="text-xs text-slate-400">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <li key={index}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    active 
                      ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 border-r-2 border-amber-500' 
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Arabic Calligraphy Watermark */}
      <div className="px-6 py-4 text-center opacity-20">
        <div className="text-2xl font-arabic text-amber-400/30">بسم الله</div>
        <div className="text-xs text-slate-500 mt-1">Bismillah</div>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-700/50">
        <Button
          onClick={onLogout}
          variant="ghost"
          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700/50"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;