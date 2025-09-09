import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  DollarSign, 
  Package, 
  Users, 
  Star, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Eye,
  Edit
} from 'lucide-react';

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [providerData, setProviderData] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalBookings: 247,
    completedBookings: 235,
    cancelledBookings: 12,
    pendingBookings: 0,
    earnings: {
      total: 125000,
      pending: 15000,
      paid: 110000
    },
    rating: {
      average: 4.8,
      count: 89
    },
    activeServices: 3,
    totalServices: 3,
    accountStatus: 'approved',
    joinedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    console.log('🔍 Dashboard useEffect - checking authentication...');
    const token = localStorage.getItem('providerToken');
    const storedProviderData = localStorage.getItem('providerData');
    
    console.log('🔍 Token present:', !!token);
    console.log('🔍 Provider data present:', !!storedProviderData);
    
    if (!token) {
      console.log('❌ No token found, redirecting to login');
      navigate('/providers/login');
      return;
    }

    // Load provider data from localStorage
    if (storedProviderData) {
      console.log('✅ Loading provider data from localStorage');
      setProviderData(JSON.parse(storedProviderData));
    }

    // Fetch dashboard stats
    console.log('✅ Fetching dashboard stats...');
    fetchDashboardStats();
  }, [navigate]);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('providerToken');
      console.log('🔍 Dashboard stats fetch - Token present:', !!token);
      console.log('🔍 Dashboard stats fetch - API URL:', `${process.env.REACT_APP_BACKEND_URL}/api/providers/dashboard/stats`);
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/providers/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🔍 Dashboard stats API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Dashboard stats loaded successfully:', data);
        setDashboardStats(data.data);
      } else if (response.status === 401) {
        console.error('❌ Dashboard stats API: 401 Unauthorized - clearing localStorage');
        localStorage.clear();
        navigate('/providers/login');
      } else {
        console.error('❌ Dashboard stats API error:', response.status, response.statusText);
        const errorData = await response.text();
        console.error('❌ Error details:', errorData);
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/providers/login');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      suspended: { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-4 h-4 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const sidebarItems = [
    { icon: Users, label: 'Dashboard', active: true },
    { icon: Package, label: 'My Services', path: '/providers/services' },
    { icon: Calendar, label: 'Booking List', path: '/providers/bookings' },
    { icon: User, label: 'Profile Settings', path: '/providers/profile' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-yellow-600">FindMyHaji</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              onClick={() => item.path && navigate(item.path)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                item.active
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 mr-4"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Welcome, {providerData?.firstName || 'Provider'}!
                </h1>
                <p className="text-gray-600 text-sm">
                  {providerData?.businessType || 'Service Provider'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {providerData && getStatusBadge(providerData.status)}
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {providerData?.firstName} {providerData?.lastName}
                </p>
                <p className="text-xs text-gray-500">Provider</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-4">
          {/* Account Status Alert */}
          {providerData?.status !== 'approved' && (
            <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-400 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Account Status</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    {providerData?.status === 'pending' && 
                      "Your account is pending approval. You'll receive an email notification once approved."}
                    {providerData?.status === 'rejected' && 
                      "Your account has been rejected. Please contact support for more information."}
                    {providerData?.status === 'suspended' && 
                      "Your account has been suspended. Please contact support to resolve this issue."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardStats?.totalBookings || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-green-600">+{dashboardStats?.completedBookings || 0} completed</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(dashboardStats?.earnings?.total || 0)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-green-600">
                  {formatCurrency(dashboardStats?.earnings?.pending || 0)} pending
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Services</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardStats?.activeServices || 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-gray-600">
                  {dashboardStats?.totalServices || 0} total services
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rating</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardStats?.rating?.average ? dashboardStats.rating.average.toFixed(1) : '0.0'}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-gray-600">
                  {dashboardStats?.rating?.count || 0} reviews
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity & Profile Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Earnings Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-full mr-3">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-900">Total Earned</p>
                      <p className="text-xs text-green-600">All time earnings</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-green-900">
                    {formatCurrency(dashboardStats?.earnings?.total || 0)}
                  </p>
                </div>

                <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-full mr-3">
                      <Clock className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Pending</p>
                      <p className="text-xs text-yellow-600">Awaiting payment</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-yellow-900">
                    {formatCurrency(dashboardStats?.earnings?.pending || 0)}
                  </p>
                </div>

                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-full mr-3">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Paid Out</p>
                      <p className="text-xs text-blue-600">Successfully transferred</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-blue-900">
                    {formatCurrency(dashboardStats?.earnings?.paid || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                <button
                  onClick={() => navigate('/providers/profile')}
                  className="text-yellow-600 hover:text-yellow-700 text-sm font-medium flex items-center"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Business Type</p>
                  <p className="font-medium text-gray-900">{providerData?.businessType || 'Not specified'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Zone</p>
                  <p className="font-medium text-gray-900">{providerData?.zone || 'Not specified'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{providerData?.email}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{providerData?.formattedPhone || 'Not specified'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium text-gray-900">
                    {dashboardStats?.joinedAt ? formatDate(dashboardStats.joinedAt) : 'Unknown'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Last Login</p>
                  <p className="font-medium text-gray-900">
                    {dashboardStats?.lastLogin ? formatDate(dashboardStats.lastLogin) : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/providers/services')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors text-left"
              >
                <Package className="w-8 h-8 text-yellow-600 mb-2" />
                <h4 className="font-medium text-gray-900">Manage Services</h4>
                <p className="text-sm text-gray-600">Add, edit, or remove your services</p>
              </button>

              <button
                onClick={() => navigate('/providers/bookings')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors text-left"
              >
                <Calendar className="w-8 h-8 text-yellow-600 mb-2" />
                <h4 className="font-medium text-gray-900">View Bookings</h4>
                <p className="text-sm text-gray-600">Check your upcoming and past bookings</p>
              </button>

              <button
                onClick={() => navigate('/providers/profile')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors text-left"
              >
                <Settings className="w-8 h-8 text-yellow-600 mb-2" />
                <h4 className="font-medium text-gray-900">Profile Settings</h4>
                <p className="text-sm text-gray-600">Update your profile and preferences</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;