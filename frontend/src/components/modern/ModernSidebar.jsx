import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar,
  Users, 
  MessageSquare, 
  Clock, 
  BarChart3,
  Settings,
  Navigation,
  Heart,
  AlertTriangle,
  LogOut,
  ChevronDown,
  ChevronRight,
  Tag,
  Gift,
  Wallet,
  Megaphone,
  Image,
  Bell,
  UserPlus,
  UserCheck,
  Plus,
  List,
  MapPin,
  Briefcase,
  FileText,
  Search,
  Wrench,
  Database,
  Shield,
  Key,
  BellRing,
  Activity,
  Archive,
  Globe,
  Speaker,
  Package,
  Cloud,
  Camera
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const ModernSidebar = ({ onLogout }) => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    'pilgrimage': false,
    'promotion': false,
    'providers': false,
    'employees': false,
    'reports': false,
    'system': false,
    'subscription': false,
    'configurations': false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const menuSections = [
    {
      title: 'Main',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', active: true }
      ]
    },
    {
      title: 'Pilgrimage Management',
      key: 'pilgrimage',
      expandable: true,
      items: [
        { icon: Calendar, label: 'Hajj Bookings', path: '/bookings/hajj' },
        { icon: Calendar, label: 'Umrah Bookings', path: '/bookings/umrah' },
        { icon: Users, label: 'Group Bookings', path: '/bookings/groups' },
        { icon: FileText, label: 'Booking Reports', path: '/bookings/reports' }
      ]
    },
    {
      title: 'Promotion Management',
      key: 'promotion',
      expandable: true,
      items: [
        { icon: Tag, label: 'Hajj Package Discounts', path: '/promotions/discounts' },
        { icon: Gift, label: 'Coupons', path: '/promotions/coupons' },
        { icon: Wallet, label: 'Wallet Bonus', path: '/promotions/wallet' },
        { icon: Megaphone, label: 'Campaigns', path: '/promotions/campaigns' },
        { icon: Image, label: 'Advertisements', path: '/promotions/ads' },
        { icon: Image, label: 'Promotional Banners', path: '/promotions/banners' },
        { icon: Bell, label: 'Send Notifications', path: '/promotions/notifications' }
      ]
    },
    {
      title: 'Provider Management',
      key: 'providers',
      expandable: true,
      items: [
        { 
          icon: UserCheck, 
          label: 'Provider Applications', 
          path: '/admin/providers',
          badge: '12'
        },
        { 
          icon: Users, 
          label: 'Active Providers', 
          path: '/admin/providers?status=approved'
        },
        { 
          icon: UserPlus, 
          label: 'Pending Approvals', 
          path: '/admin/providers?status=pending',
          badge: '3'
        }
      ]
    },
    {
      title: 'Contact Management',
      key: 'contacts',
      expandable: true,
      items: [
        { 
          icon: MessageSquare, 
          label: 'Contact Inquiries', 
          path: '/admin/contacts',
          badge: '5'
        },
        { 
          icon: Bell, 
          label: 'Website Content', 
          path: '/admin/website-content'
        },
        { 
          icon: FileText, 
          label: '📖 Blog Management', 
          path: '/admin/blogs'
        },
        { 
          icon: Bell, 
          label: '🔔 Push Notifications', 
          path: '/admin/notifications'
        }
      ]
    },
    {
      title: 'Zone Setup',
      items: [
        { icon: MapPin, label: 'Makkah Zones', path: '/zones/makkah' },
        { icon: MapPin, label: 'Madinah Zones', path: '/zones/madinah' },
        { icon: MapPin, label: 'Mina Zones', path: '/zones/mina' },
        { icon: MapPin, label: 'Arafat Zones', path: '/zones/arafat' }
      ]
    },
    {
      title: 'Employee Management',
      key: 'employees',
      expandable: true,
      items: [
        { icon: Settings, label: 'Employee Role Setup', path: '/employees/roles' },
        { icon: List, label: 'Employee List', path: '/employees/list' },
        { icon: Plus, label: 'Add New Employee', path: '/employees/add' }
      ]
    },
    {
      title: 'Reports & Analytics',
      key: 'reports',
      expandable: true,
      items: [
        { icon: FileText, label: 'Transaction Reports', path: '/reports/transactions' },
        { icon: Briefcase, label: 'Business Reports', path: '/reports/business' },
        { icon: Calendar, label: 'Booking Reports', path: '/reports/bookings' },
        { icon: Users, label: 'Agent Reports', path: '/reports/agents' },
        { icon: Search, label: 'Keyword Search', path: '/analytics/keywords' },
        { icon: Search, label: 'Customer Search', path: '/analytics/customers' }
      ]
    },
    {
      title: 'System Management',
      key: 'system',
      expandable: true,
      items: [
        { icon: Wrench, label: 'Settings Management', path: '/system/settings' },
        { icon: Briefcase, label: 'Business Settings', path: '/system/business' },
        { icon: Key, label: 'Login Setup', path: '/system/login' },
        { icon: BellRing, label: 'Notification Channel', path: '/system/notifications' },
        { icon: AlertTriangle, label: '404 Logs', path: '/system/logs' },
        { icon: Activity, label: 'Cron Jobs', path: '/system/cron' }
      ]
    },
    {
      title: 'Package Management',
      key: 'subscription',
      expandable: true,
      items: [
        { icon: Package, label: 'Hajj Packages', path: '/packages/hajj' },
        { icon: Package, label: 'Umrah Packages', path: '/packages/umrah' },
        { icon: Users, label: 'Subscriber List', path: '/packages/subscribers' },
        { icon: Settings, label: 'Package Settings', path: '/packages/settings' }
      ]
    },
    {
      title: 'Configurations',
      key: 'configurations',
      expandable: true,
      items: [
        { icon: Bell, label: 'Push Notifications', path: '/config/notifications' },
        { icon: Globe, label: '3rd Party Integrations', path: '/config/integrations' },
        { icon: Activity, label: 'Integration Testing', path: '/admin/integration-dashboard' },
        { icon: Globe, label: 'Language Setup', path: '/config/languages' },
        { icon: Settings, label: '⚙️ 3rd Party Configs', path: '/admin/third-party'}
      ]
    },
    {
      title: 'Other Tools',
      items: [
        { icon: FileText, label: 'Page Settings', path: '/tools/pages' },
        { icon: Camera, label: 'Gallery', path: '/tools/gallery' },
        { icon: Cloud, label: 'Backup Database', path: '/tools/backup' }
      ]
    }
  ];

  const isActive = (path) => location.pathname === path || (path === '/dashboard' && location.pathname === '/');

  const renderMenuItem = (item, isSubmenu = false) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    
    return (
      <Link
        key={item.path}
        to={item.path}
        className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 group ${
          isSubmenu ? 'ml-6' : ''
        } ${
          active 
            ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-300 border-r-2 border-yellow-500 shadow-lg' 
            : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
        }`}
      >
        <div className="flex items-center space-x-3">
          <Icon className={`w-4 h-4 ${active ? 'text-yellow-400' : 'text-gray-400 group-hover:text-gray-300'}`} />
          <span className="font-medium text-sm">{item.label}</span>
        </div>
        {item.badge && (
          <Badge className="bg-red-500 text-white text-xs px-2 py-0.5">
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  };

  const renderSection = (section) => {
    const isExpanded = expandedSections[section.key];
    
    return (
      <div key={section.title} className="mb-6">
        <div className="px-4 mb-3">
          {section.expandable ? (
            <button
              onClick={() => toggleSection(section.key)}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.title}
              </h3>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>
          ) : (
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {section.title}
            </h3>
          )}
        </div>
        
        <div className={`space-y-1 ${section.expandable && !isExpanded ? 'hidden' : ''}`}>
          {section.items.map((item) => (
            <div key={item.label}>
              {renderMenuItem(item)}
              {item.submenu && isExpanded && (
                <div className="mt-1 space-y-1">
                  {item.submenu.map((subItem) => renderMenuItem({
                    ...subItem,
                    icon: List
                  }, true))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-72 bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white min-h-screen flex flex-col shadow-2xl border-r border-gray-700 overflow-y-auto">
      {/* Logo Header */}
      <div className="p-6 border-b border-gray-700/50 sticky top-0 bg-gray-900 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg relative">
            <div className="w-6 h-6 bg-black rounded-sm"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-xl"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">FindMyHaji</h1>
            <p className="text-xs text-gray-400">Operations Center</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-6 py-4 border-b border-gray-700/50">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-r from-green-600/20 to-green-500/20 rounded-lg p-3 border border-green-500/30">
            <div className="text-green-400 text-sm font-medium">Active</div>
            <div className="text-white text-lg font-bold">1,247</div>
          </div>
          <div className="bg-gradient-to-r from-red-600/20 to-red-500/20 rounded-lg p-3 border border-red-500/30">
            <div className="text-red-400 text-sm font-medium">Alerts</div>
            <div className="text-white text-lg font-bold">3</div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6">
        {menuSections.map(renderSection)}
      </nav>

      {/* Emergency Button */}
      <div className="px-4 py-4 border-t border-gray-700/50">
        <Button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02]">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Emergency Alert
        </Button>
      </div>

      {/* Arabic Blessing */}
      <div className="px-6 py-4 text-center opacity-30">
        <div className="text-lg font-arabic text-yellow-400/40">بِسْمِ ٱللَّٰهِ</div>
        <div className="text-xs text-gray-500 mt-1">Bismillah</div>
      </div>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-gray-700/50">
        <Button
          onClick={onLogout}
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default ModernSidebar;