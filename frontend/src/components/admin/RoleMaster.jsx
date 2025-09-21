import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  User,
  Search,
  MessageSquare,
  Edit,
  Trash2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import Network from '@/lib/Network';
import { Urls } from '@/lib/utils';

const RoleMaster = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    // Step 1: Info
    name: ''
  });
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [errors, setErrors] = useState({});

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };


  const nextStep = () => {
    if (validateStep(1)) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('findmyhaji_token');
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      const form = new FormData();

      // Append all fields to FormData
      form.append('name', formData.name);
      const response = await Network.post(Urls.baseUrl + '/roles/store', headers, form);
      if (response?.data?.success === "success") {
        toast.success('Role registered successfully !', {
          description: `${formData.name} has been successfully added to the system.`
        });
        setFormData({ name: '' });
        fetchContacts();
      } else {
        toast.error("Registration Failed", {
          description: response.data.message,
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  // Fetch roles
  useEffect(() => {
    fetchContacts();
  }, [searchTerm]);

  const fetchContacts = async () => {
    try {
      // setLoading(true);
      const params = new URLSearchParams({
        search: searchTerm
      });
      const token = localStorage.getItem('findmyhaji_token');
        const headers =  {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        
      const response = await Network.get(Urls.baseUrl +`/roles?${params}`, headers);
      if (response?.data?.success === 'success') {
        let filteredContacts = response.data.data;
        setContacts(filteredContacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };
  const handleChange = (field, value) => {
    setSelectedContact((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  const updateContact = async (updateData) => {
    try {
      const token = localStorage.getItem('findmyhaji_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      const response = await Network.put(`/roles/update`, headers, updateData);
      if (response?.data?.success === 'success') {
        toast.success('Information updated!', {
          description: `${updateData.name} info successfully updated to the system.`
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
    if (!window.confirm('Are you sure you want to delete this info?')) return;

    try {
      const token = localStorage.getItem('findmyhaji_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      const response = await Network.delete(Urls.baseUrl +`/roles/delete/${contactId}`, headers);
      if(response?.data?.success === 'success'){
        toast.success('Role deleted!', {
          description: `Role has been successfully deleted from the system.`
        });
        fetchContacts();
      } else {
        console.error('Error deleting contact:', response.data);
        toast.error("Deletion Failed", {
          description: response.data.message,
        });
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };
  const submitData = () => {
    const newErrors = {};
    if (!selectedContact.name) newErrors.name = 'Role name is required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      updateContact(selectedContact);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-medium text-gray-700">
            Role Name *
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              id="role"
              placeholder="Enter role name"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>
      </div>
    </div>
  );


  return (
    <div className="max-w-10xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Role Management</h1>
        <p className="text-gray-600">Add new role</p>
      </div>

      {/* Form Card */}
      <Card className="shadow-lg border-0">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Role Info
          </CardTitle>
          <p className="text-gray-600 mt-2">Give role basic info</p>
          {/* {currentStep < 3 && (
            <p className="text-sm text-gray-500 mt-1">
              Next step: <span className="font-medium text-yellow-600">{currentStepInfo.nextStep}</span>
            </p>
          )} */}
        </CardHeader>

        <CardContent className="p-8">
          {renderStep1()}
          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 mt-8">
            <Button
              onClick={nextStep}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white flex items-center gap-2"
            >
              Submit
            </Button>
          </div>
        </CardContent>
        <CardContent className="p-8 border-t border-gray-100">
          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contacts Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Total Roles ({contacts.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{contact.name}</div>
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
            {contacts.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No data found matching your filters.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Details Modal */}
      {showDetails && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Role Detail</h3>
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
                <h4 className="text-sm font-medium text-gray-900 mb-3">Role Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Name</label>
                    <Input
                      id="name"
                      placeholder="Enter role name"
                      value={selectedContact.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className={`${errors.name ? 'border-red-500' : ''}`}
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
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

export default RoleMaster;