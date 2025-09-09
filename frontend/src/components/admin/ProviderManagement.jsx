import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock,
  UserCheck,
  UserX,
  UserMinus,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Building,
  Mail,
  Phone
} from 'lucide-react';

const AdminProviderManagement = () => {
  const [providers, setProviders] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [actionReason, setActionReason] = useState('');
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    status: '',
    zone: '',
    businessType: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  const zones = ['Makkah', 'Madinah', 'Jeddah', 'Riyadh', 'Dammam', 'Other'];
  const businessTypes = [
    'Travel Agent', 'Tour Operator', 'Transportation Provider',
    'Accommodation Provider', 'Guide Service', 'Food Service', 'Other Services'
  ];

  useEffect(() => {
    fetchProviders();
  }, [currentPage, filters]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');
      
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.zone && { zone: filters.zone }),
        ...(filters.businessType && { businessType: filters.businessType }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/providers?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProviders(data.data.providers);
        setSummary(data.data.summary);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        setError('Failed to fetch providers');
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      zone: '',
      businessType: '',
      search: ''
    });
    setCurrentPage(1);
  };

  const handleProviderAction = async (providerId, action, reason = '') => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');
      const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/admin/providers/${providerId}/${action}`;
      
      const body = action === 'reject' || action === 'suspend' 
        ? JSON.stringify({ reason }) 
        : JSON.stringify({ notes: reason });

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body
      });

      if (response.ok) {
        await fetchProviders();
        setShowModal(false);
        setActionReason('');
        setSelectedProvider(null);
      } else {
        const data = await response.json();
        setError(data.message || 'Action failed');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      setError('Network error. Please try again.');
    }
  };

  const openActionModal = (provider, action) => {
    setSelectedProvider(provider);
    setModalAction(action);
    setShowModal(true);
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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Provider Management</h1>
        <p className="text-gray-600">Manage provider applications and accounts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Providers</p>
              <p className="text-2xl font-bold text-gray-900">{summary.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-600">{summary.pending || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{summary.approved || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{summary.rejected || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          <button
            onClick={clearFilters}
            className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by name or email"
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
            <select
              value={filters.zone}
              onChange={(e) => handleFilterChange('zone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="">All Zones</option>
              {zones.map(zone => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
            <select
              value={filters.businessType}
              onChange={(e) => handleFilterChange('businessType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="">All Types</option>
              {businessTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Providers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Providers</h3>
            <button
              onClick={fetchProviders}
              className="flex items-center text-yellow-600 hover:text-yellow-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchProviders}
              className="mt-2 text-yellow-600 hover:text-yellow-700"
            >
              Try Again
            </button>
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No providers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {providers.map((provider) => (
                  <tr key={provider.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {provider.firstName} {provider.lastName}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {provider.email}
                        </div>
                        {provider.formattedPhone && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {provider.formattedPhone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Building className="w-3 h-3 mr-1" />
                        {provider.businessType}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {provider.zone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(provider.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(provider.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedProvider(provider)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {provider.status === 'pending' && (
                        <>
                          <button
                            onClick={() => openActionModal(provider, 'approve')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openActionModal(provider, 'reject')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {provider.status === 'approved' && (
                        <button
                          onClick={() => openActionModal(provider, 'suspend')}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                      
                      {provider.status === 'suspended' && (
                        <button
                          onClick={() => openActionModal(provider, 'reactivate')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showModal && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {modalAction.charAt(0).toUpperCase() + modalAction.slice(1)} Provider
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to {modalAction} <strong>{selectedProvider.firstName} {selectedProvider.lastName}</strong>?
            </p>

            {(modalAction === 'reject' || modalAction === 'suspend') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason {modalAction === 'reject' ? '(Required)' : '(Required)'}
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  rows="3"
                  placeholder={`Enter reason for ${modalAction}...`}
                />
              </div>
            )}

            {modalAction === 'approve' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  rows="2"
                  placeholder="Add any notes about the approval..."
                />
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setActionReason('');
                  setSelectedProvider(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => handleProviderAction(selectedProvider.id, modalAction, actionReason)}
                disabled={(modalAction === 'reject' || modalAction === 'suspend') && !actionReason.trim()}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 ${
                  modalAction === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700'
                    : modalAction === 'reactivate'
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {modalAction.charAt(0).toUpperCase() + modalAction.slice(1)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Provider Detail Modal */}
      {selectedProvider && !showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Provider Details</h3>
              <button
                onClick={() => setSelectedProvider(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Personal Information</h4>
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {selectedProvider.firstName} {selectedProvider.lastName}</p>
                    <p><strong>Email:</strong> {selectedProvider.email}</p>
                    <p><strong>Phone:</strong> {selectedProvider.formattedPhone || 'Not provided'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Business Information</h4>
                  <div className="space-y-2">
                    <p><strong>Type:</strong> {selectedProvider.businessType}</p>
                    <p><strong>Zone:</strong> {selectedProvider.zone}</p>
                    <p><strong>Status:</strong> {getStatusBadge(selectedProvider.status)}</p>
                  </div>
                </div>
              </div>

              {selectedProvider.address && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Address</h4>
                  <p>
                    {selectedProvider.address.street}, {selectedProvider.address.city}
                    {selectedProvider.address.state && `, ${selectedProvider.address.state}`}
                    {selectedProvider.address.zipCode && `, ${selectedProvider.address.zipCode}`}
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Application Details</h4>
                <div className="space-y-2">
                  <p><strong>Applied:</strong> {formatDate(selectedProvider.createdAt)}</p>
                  {selectedProvider.approvedAt && (
                    <p><strong>Approved:</strong> {formatDate(selectedProvider.approvedAt)}</p>
                  )}
                  {selectedProvider.rejectionReason && (
                    <p><strong>Rejection Reason:</strong> {selectedProvider.rejectionReason}</p>
                  )}
                </div>
              </div>

              {selectedProvider.businessIdProof && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Business Documents</h4>
                  <a
                    href={`${process.env.REACT_APP_BACKEND_URL}${selectedProvider.businessIdProof.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-yellow-600 hover:text-yellow-700"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    View Business ID Proof
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProviderManagement;