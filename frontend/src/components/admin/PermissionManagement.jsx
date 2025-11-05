import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import Network from '@/lib/Network';
import { Urls } from '@/lib/utils';
import Sections from './permissionsections/Sections';

const PermissionManagement = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    // Step 1: Info
    role: ''
  });
  const [contacts, setContacts] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [menus, setMenus] = useState([]);
  const [errors, setErrors] = useState({});

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.role) newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

  const nextStep = () => {
    if (validateStep(1)) {
      handleSubmit(menus);
    }
  };

  const handleSubmit = async (permissions) => {
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
      form.append('role', formData.role);
      form.append('data', JSON.stringify(permissions));
      const response = await Network.put('/menus/update', headers, form);
      if (response?.data?.success === "success") {
        toast.success('Permission assigned successfully !', {
          description: `Permission has been successfully added to the role.`
        });
        // fetchMenus(formData.role);
        setFormData({ role: '' });
        fetchContacts();
      } else {
        toast.error("Updation Failed", {
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
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('findmyhaji_token');
        const headers =  {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        
      const response = await Network.get(Urls.baseUrl +`/roles`, headers);
      if (response?.data?.success === 'success') {
        let filteredContacts = response.data.data;
        setContacts(filteredContacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchMenus = async (roleId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('findmyhaji_token');
        const headers =  {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        
      const response = await Network.get(Urls.baseUrl +`/menus/:${roleId}`, headers);
      if (response?.data?.success === 'success') {
        if(response.data.isSuperAdmin === true){
          const allMenus = response.data.data.filter(
            (item) => item.name === 'CUSTOMER MANAGEMENT'
          );
          setMenus({
            data: allMenus,
            isSuperAdmin: true
          });
        }else{
          const allMenus = response.data.data;
          setMenus({
            data: allMenus,
            isSuperAdmin: false
          });
        }
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (field, value) => {
    setSelectedRole(value);
    fetchMenus(value);
    setFormData({role:value});
  };

  const handleInputChange = (menuId, field, value) => {
    setMenus(prevMenus => ({
      ...prevMenus,
      data: prevMenus.data.map(item =>
        item.id === menuId
          ? { ...item, [field]: value }
          : item
      )
    }));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-medium text-gray-700">
            Role Name *
          </Label>
          <div className="relative">
            <Select value={selectedRole} onValueChange={handleChange.bind(this, 'role')}>
                <SelectTrigger className="w-32">
                <SelectValue />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value={null}>Select Role</SelectItem>
                {contacts.map(item => (
                    <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                ))}
                </SelectContent>
            </Select>
          </div>
          {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
        </div>
      </div>
    </div>
  );
 


  return (
    <div className="max-w-10xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Permission Management</h1>
        <p className="text-gray-600">Assign permission to the role</p>
      </div>

      {/* Form Card */}
      <Card className="shadow-lg border-0">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Role Info
          </CardTitle>
          <p className="text-gray-600 mt-2">Select role</p>
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
        <CardContent className="p-0 border-t border-gray-100">
          {/* Contacts Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-2xl font-bold text-gray-900">
                    Set Permission
                </CardTitle>
                <p className="text-gray-600 mt-2">Modify what individuals on this role can do</p>
                {/* <Sections 
                title="Dashboard"
                /> */}
                {menus?.data?.map((item) => (
                  <Sections key={item.id} menuId={item.id} title={item.name} isSuperAdmin={item.isSuperAdmin} permissions={item} handleInputChange={handleInputChange}/>
                ))}
            </CardHeader>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionManagement;