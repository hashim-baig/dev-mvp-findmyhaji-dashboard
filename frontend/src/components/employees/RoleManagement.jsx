import React, { useState, useEffect } from 'react';
import { 
  Save,
  RefreshCw
} from 'lucide-react';
import { Urls } from '@/lib/utils';
import Network from '@/lib/Network';

const RoleManagement = () => {
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
        setLoading(true);

        const token = localStorage.getItem('findmyhaji_token');
        const headers =  {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        
        const response = await Network.get(Urls.baseUrl +'/api/users', headers);
        if (response?.data?.success === 'success') {
            setEmployees(response.data.data);
        } else {
            console.error('Error fetching users:', data.message);
        }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchRoles = async () => {
    try {
        setLoading(true);

        const token = localStorage.getItem('findmyhaji_token');
        const headers =  {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        
        const response = await Network.get(Urls.baseUrl +'/api/roles', headers);
        if (response?.data?.success === 'success') {
            setRoles(response.data.data);
        } else {
            console.error('Error fetching users:', data.message);
        }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    if(e.target.value){
      const selectedOption = e.target.options[e.target.selectedIndex];
      const role = selectedOption.getAttribute("data-role");
      setSelectedUser(e.target.value);
      setSelectedRole(role);
    }
  }
  const handleSave = async() => {
    try {
        setLoading(true);

        const token = localStorage.getItem('findmyhaji_token');
        const headers =  {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        const param = {
          user_id: selectedUser,
          role: selectedRole
        }
        const response = await Network.get(Urls.baseUrl +'/api/role/save', headers);
        if (response?.data?.success === 'success') {
            setRoles(response.data.data);
        } else {
            console.error('Error fetching users:', data.message);
        }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                Role Management
              </h1>
              <p className="text-gray-600 mt-2">Manage your user role</p>
            </div>
            <button
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
              onClick={handleSave}
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
                Save Changes
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {/* Employee Filter */}
            <select
              value={selectedUser}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
                <option value="">Select User</option>
              {employees.map(item => (
                <option data-role={item.role} key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select Role</option>
              {roles.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;