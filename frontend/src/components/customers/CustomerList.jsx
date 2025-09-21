import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  User, 
  MessageSquare, 
  XCircle,
  Search,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import Network from '@/lib/Network';
import { Urls } from '@/lib/utils';

const CustomerList = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [errors, setErrors] = useState({});
  // const [filters, setFilters] = useState({
    status: 'all',
    // priority: 'all',
    // search: ''
  // });

  // Fetch contacts and stats
  useEffect(() => {
    fetchContacts();
  }, [searchTerm, currentPage]);

  const fetchContacts = async () => {
    try {
      // setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        // status: filterStatus,
        // sort: sortBy
      });
      const token = localStorage.getItem('findmyhaji_token');
        const headers =  {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        
      const response = await Network.get(Urls.baseUrl +`/users/pagination?${params}`, headers);
      
      if (response?.data?.success === 'success') {
        let filteredContacts = response.data.users;
        setContacts(filteredContacts);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const updateContact = async (updateData) => {
    try {
      const token = localStorage.getItem('findmyhaji_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      const response = await Network.put(`/users/update`, headers, updateData);
      if (response?.data?.success === 'success') {
        toast.success('Information updated!', {
          description: `${updateData.firstname} ${updateData.lastname} info successfully updated to the system.`
        });
        setShowDetails(false);
        setSelectedContact(null);
        fetchContacts();
      } else {
        toast.error("Update Failed", {
          description: response.data.message,
        });
      }
    } catch (error) {
      console.error('Error updating detail:', error);
    }
  };

  const deleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;

    try {
      const token = localStorage.getItem('findmyhaji_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      const response = await Network.delete(Urls.baseUrl +`/users/delete/${contactId}`, headers);
      if(response?.data?.success === 'success'){
        toast.success('Customer deleted!', {
          description: `Customer has been successfully deleted from the system.`
        });
        fetchContacts();
      } else {
        setErrorMessage(response?.data?.message || 'Failed to delete info');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const countryCodes = [
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
    { code: '+1', country: 'USA', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const handleInputChange = (field, value, contact) => {
    setContacts((prev) =>
      prev.map((c) =>
        c.id === contact.id ? { ...c, [field]: value } : c
      )
    );
    const updateData = {
      ...contact,
      status: contact.status === 1 ? 0 : 1
    };
    updateContact(updateData);
  };
  const handleChange = (field, value) => {
    setSelectedContact((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  const submitData = () => {
    const newErrors = {};
    if (!selectedContact.firstname) newErrors.firstname = 'First name is required';
    if (!selectedContact.lastname) newErrors.lastname = 'Last name is required';
    if (!selectedContact.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(selectedContact.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!selectedContact.mobile.trim()){
      newErrors.mobile = 'Phone number is invalid';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      updateContact(selectedContact);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contact management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cutomers List</h1>
          <p className="text-gray-600">Manage cutomer</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div> */}

            {/* <div className="flex items-end">
              <button
                // onClick={() => setFilters({ status: 'all', priority: 'all', search: '' })}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div> */}
          </div>
        </div>

        {/* Contacts Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Total Cutomers ({contacts.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-8 h-8 text-gray-400 mr-3" />
                        <div>
                          {contact.mobile & contact.countrycode && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {contact.countrycode +'-'+ contact.mobile}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{contact.firstname + ' ' +contact.lastname}</div>
                    </td>
                    <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {contact.email}
                    </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(contact.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        type="button"
                        onClick={() => handleInputChange('status', !contact.status, contact)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          contact.status ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          contact.status ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedContact(contact);
                            setShowDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteContact(contact.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page {pagination.currentPage} of {pagination.totalPages} 
                    ({pagination.totalBlogs} total blogs)
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
          
          {contacts.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No data found matching your filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Contact Details Modal */}
      {showDetails && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Customer Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="px-6 py-4 space-y-6">
              {/* Contact Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">First Name</label>
                    <Input
                      id="firstName"
                      placeholder="Enter first name"
                      value={selectedContact.firstname}
                      onChange={(e) => handleChange('firstname', e.target.value)}
                      className={`${errors.firstname ? 'border-red-500' : ''}`}
                    />
                    {errors.firstname && <p className="text-sm text-red-500">{errors.firstname}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Last Name</label>
                    <Input
                      id="lastName"
                      placeholder="Enter last name"
                      value={selectedContact.lastname}
                      onChange={(e) => handleChange('lastname', e.target.value)}
                      className={`${errors.lastname ? 'border-red-500' : ''}`}
                    />
                    {errors.lastname && <p className="text-sm text-red-500">{errors.lastname}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Country Code</label>
                    <Select value={selectedContact.countrycode} onValueChange={(value) => handleChange('countrycode', value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countryCodes.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <span className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span>{country.code}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <Input
                      id="email"
                      placeholder="Enter email name"
                      value={selectedContact.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={`${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>
                  <div>
                      <label className="text-sm text-gray-600">Phone</label>
                      <Input
                        id="phone"
                        placeholder="Enter phone name"
                        value={selectedContact.mobile}
                        onChange={(e) => handleChange('mobile', e.target.value)}
                        className={`${errors.mobile ? 'border-red-500' : ''}`}
                      />
                      {errors.mobile && <p className="text-sm text-red-500">{errors.mobile}</p>}
                  </div>
                </div>
              </div>
              {/* Response */}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                    submitData();
                  }}
                className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;