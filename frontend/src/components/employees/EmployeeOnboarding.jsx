import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  User, 
  Phone, 
  MapPin, 
  Briefcase, 
  Upload, 
  Eye, 
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Check,
  Mail,
  Lock,
  CreditCard,
  Hash
} from 'lucide-react';
import { toast } from 'sonner';

const EmployeeOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Employee Info
    firstName: '',
    lastName: '',
    phone: '',
    countryCode: '+966',
    address: '',
    role: '',
    zone: '',
    profileImage: null,
    
    // Step 2: Business Information  
    identityType: '',
    identityNumber: '',
    identificationImage: null,
    
    // Step 3: Account Information
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const steps = [
    { id: 1, title: 'Employee Info', subtitle: 'Give employee\'s basic and account info', nextStep: 'Set Permissions' },
    { id: 2, title: 'Business Information', subtitle: 'Give verified information to verify a employee', nextStep: 'Account Setup' },
    { id: 3, title: 'Account Information', subtitle: 'This info will need for employee\'s future login', nextStep: 'Complete' }
  ];

  const roles = [
    'Operations Manager',
    'Pilgrim Guide',
    'Customer Support',
    'Medical Officer',
    'Security Officer',
    'Transportation Coordinator',
    'IT Support',
    'Finance Officer'
  ];

  const zones = [
    'Makkah Central Zone',
    'Madinah Zone',
    'Mina Zone',
    'Arafat Zone',
    'Muzdalifah Zone',
    'Airport Zone',
    'Hotel District',
    'Administrative Zone'
  ];

  const identityTypes = [
    'Passport',
    'Driving License', 
    'NID',
    'Trade License'
  ];

  const countryCodes = [
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
    { code: '+1', country: 'USA', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' }
  ];

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.role) newErrors.role = 'Role is required';
      if (!formData.zone) newErrors.zone = 'Zone is required';
    }
    
    if (step === 2) {
      if (!formData.identityType) newErrors.identityType = 'Identity type is required';
      if (!formData.identityNumber.trim()) newErrors.identityNumber = 'Identity number is required';
    }
    
    if (step === 3) {
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 digits';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
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

  const handleFileUpload = (field, file) => {
    if (file && file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (file && !allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, JPEG, and GIF files are allowed');
      return;
    }
    
    updateFormData(field, file);
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    toast.success('Employee onboarding completed!', {
      description: `${formData.firstName} ${formData.lastName} has been successfully added to the system.`
    });
    
    console.log('Form submitted:', formData);
    // Here you would typically send the data to your API
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
            First Name *
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              id="firstName"
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={(e) => updateFormData('firstName', e.target.value)}
              className={`pl-10 ${errors.firstName ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
            Last Name *
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              id="lastName"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={(e) => updateFormData('lastName', e.target.value)}
              className={`pl-10 ${errors.lastName ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
          Phone Number *
        </Label>
        <div className="flex gap-3">
          <Select value={formData.countryCode} onValueChange={(value) => updateFormData('countryCode', value)}>
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
          <div className="relative flex-1">
            <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              id="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => updateFormData('phone', e.target.value)}
              className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
            />
          </div>
        </div>
        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address" className="text-sm font-medium text-gray-700">
          Address *
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            id="address"
            placeholder="Enter full address"
            value={formData.address}
            onChange={(e) => updateFormData('address', e.target.value)}
            className={`pl-10 ${errors.address ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Role *</Label>
          <Select value={formData.role} onValueChange={(value) => updateFormData('role', value)}>
            <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <SelectValue placeholder="Select role" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Zone *</Label>
          <Select value={formData.zone} onValueChange={(value) => updateFormData('zone', value)}>
            <SelectTrigger className={errors.zone ? 'border-red-500' : ''}>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <SelectValue placeholder="Select zone" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {zones.map((zone) => (
                <SelectItem key={zone} value={zone}>{zone}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.zone && <p className="text-sm text-red-500">{errors.zone}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Employee Image (1:1)</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            id="profileImage"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            onChange={(e) => handleFileUpload('profileImage', e.target.files[0])}
            className="hidden"
          />
          <label htmlFor="profileImage" className="cursor-pointer">
            <div className="w-24 h-24 mx-auto mb-4 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              {formData.profileImage ? (
                <img
                  src={URL.createObjectURL(formData.profileImage)}
                  alt="Profile preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Upload className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <p className="text-sm text-gray-600">
              {formData.profileImage ? formData.profileImage.name : 'Click to upload square image'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Max size: 2MB | JPG, PNG, JPEG, GIF</p>
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Identity Type *</Label>
          <Select value={formData.identityType} onValueChange={(value) => updateFormData('identityType', value)}>
            <SelectTrigger className={errors.identityType ? 'border-red-500' : ''}>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <SelectValue placeholder="Select identity type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {identityTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.identityType && <p className="text-sm text-red-500">{errors.identityType}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="identityNumber" className="text-sm font-medium text-gray-700">
            Identity Number *
          </Label>
          <div className="relative">
            <Hash className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              id="identityNumber"
              placeholder="Enter identity number"
              value={formData.identityNumber}
              onChange={(e) => updateFormData('identityNumber', e.target.value)}
              className={`pl-10 ${errors.identityNumber ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.identityNumber && <p className="text-sm text-red-500">{errors.identityNumber}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Identification Image (2:1)</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            id="identificationImage"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            onChange={(e) => handleFileUpload('identificationImage', e.target.files[0])}
            className="hidden"
          />
          <label htmlFor="identificationImage" className="cursor-pointer">
            <div className="w-48 h-24 mx-auto mb-4 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              {formData.identificationImage ? (
                <img
                  src={URL.createObjectURL(formData.identificationImage)}
                  alt="ID preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Upload className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <p className="text-sm text-gray-600">
              {formData.identificationImage ? formData.identificationImage.name : 'Click to upload wide identification image'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Max size: 2MB | JPG, PNG, JPEG, GIF</p>
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email Address *
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          Password *
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) => updateFormData('password', e.target.value)}
            className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
        {formData.password && formData.password.length < 8 && (
          <p className="text-sm text-amber-600">⚠️ Password must be at least 8 digits</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
          Confirm Password *
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={(e) => updateFormData('confirmPassword', e.target.value)}
            className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
      </div>
    </div>
  );

  const currentStepInfo = steps[currentStep - 1];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Employee Onboarding</h1>
        <p className="text-gray-600">Add new team member to FindMyHaji Operations Center</p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep > step.id 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : currentStep === step.id 
                    ? 'bg-yellow-500 border-yellow-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
              }`}>
                {currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-20 h-1 mx-4 ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4">
          {steps.map((step) => (
            <div key={step.id} className="flex-1 text-center">
              <p className={`text-sm font-medium ${
                currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {step.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <Card className="shadow-lg border-0">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {currentStepInfo.title}
          </CardTitle>
          <p className="text-gray-600 mt-2">{currentStepInfo.subtitle}</p>
          {currentStep < 3 && (
            <p className="text-sm text-gray-500 mt-1">
              Next step: <span className="font-medium text-yellow-600">{currentStepInfo.nextStep}</span>
            </p>
          )}
        </CardHeader>

        <CardContent className="p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 mt-8 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <Button
              onClick={nextStep}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white flex items-center gap-2"
            >
              {currentStep === 3 ? 'Complete Onboarding' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeOnboarding;