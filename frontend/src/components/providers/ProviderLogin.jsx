import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, UserPlus, LogIn } from 'lucide-react';

const ProviderLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('providerToken');
    if (token) {
      navigate('/providers/dashboard');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🔐 Attempting provider login...');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/providers/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      console.log('📡 API Response Status:', response.status);
      const data = await response.json();
      console.log('📄 API Response Data:', data);

      if (response.ok && data.success) {
        console.log('✅ Login successful, storing auth data...');
        
        // Store authentication data
        localStorage.setItem('providerToken', data.data.token);
        localStorage.setItem('providerData', JSON.stringify(data.data.provider));
        localStorage.setItem('userRole', 'provider');
        
        console.log('✅ Auth data stored, redirecting to dashboard...');
        
        // Show success message briefly
        setErrors({ 
          general: 'Login successful! Redirecting to dashboard...',
          type: 'success'
        });
        
        // Small delay to ensure data is stored, then force redirect
        setTimeout(() => {
          console.log('✅ Attempting navigation to dashboard...');
          try {
            navigate('/providers/dashboard');
          } catch (navError) {
            console.error('❌ Navigation error:', navError);
            // Fallback: use window.location
            window.location.href = '/providers/dashboard';
          }
        }, 200);
        
      } else {
        console.log('❌ Login failed:', data.message);
        setLoginAttempts(prev => prev + 1);
        
        if (data.status === 'pending') {
          setErrors({ 
            general: 'Your account is pending approval. Please wait for admin approval.',
            type: 'pending'
          });
        } else if (data.status === 'rejected') {
          setErrors({ 
            general: data.message || 'Your account has been rejected. Please contact support.',
            type: 'rejected'
          });
        } else if (data.status === 'suspended') {
          setErrors({ 
            general: 'Your account has been suspended. Please contact support.',
            type: 'suspended'
          });
        } else {
          setErrors({ 
            general: data.message || 'Invalid email or password',
            type: 'error'
          });
        }
      }
    } catch (error) {
      console.error('🚨 Login error:', error);
      setErrors({ 
        general: 'Network error. Please check your connection and try again.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getErrorIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500 mr-2" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />;
      case 'rejected':
      case 'suspended':
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500 mr-2" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-500 mr-2" />;
    }
  };

  const getErrorBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'rejected':
      case 'suspended':
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-red-50 border-red-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-full flex items-center justify-center mb-4">
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Provider Login</h2>
          <p className="mt-2 text-gray-600">
            Access your FindMyHaji provider dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className={`border rounded-lg p-4 flex items-start ${getErrorBgColor(errors.type)}`}>
                {getErrorIcon(errors.type)}
                <div>
                  <p className={`${errors.type === 'pending' ? 'text-yellow-700' : 'text-red-700'} text-sm`}>
                    {errors.general}
                  </p>
                  {errors.type === 'rejected' && (
                    <p className="text-red-600 text-xs mt-1">
                      Contact support at support@findmyhaji.com for assistance.
                    </p>
                  )}
                  {errors.type === 'pending' && (
                    <p className="text-yellow-600 text-xs mt-1">
                      We'll notify you via email once your application is reviewed.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter your email address"
                disabled={isSubmitting}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Lock className="w-4 h-4 mr-1" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 text-white py-3 px-6 rounded-lg hover:from-yellow-700 hover:to-amber-700 focus:outline-none focus:ring-4 focus:ring-yellow-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors duration-200"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </div>
              )}
            </button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/providers/forgot-password')}
                className="text-yellow-600 hover:text-yellow-500 text-sm font-medium underline"
              >
                Forgot your password?
              </button>
            </div>
          </form>
        </div>

        {/* Register Link */}
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <UserPlus className="w-5 h-5 text-gray-400 mr-2" />
            <p className="text-gray-600">Don't have a provider account?</p>
          </div>
          <Link
            to="/providers/register"
            className="inline-flex items-center justify-center w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium transition-colors duration-200"
          >
            Register as a Provider
          </Link>
          <p className="text-xs text-gray-500 mt-2">
            Submit your application and wait for approval
          </p>
        </div>

        {/* Admin Login Link */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            Are you an admin?{' '}
            <Link
              to="/login"
              className="text-yellow-600 hover:text-yellow-500 font-medium underline"
            >
              Admin Login
            </Link>
          </p>
        </div>

        {/* Security Notice */}
        {loginAttempts >= 3 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <AlertCircle className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
            <p className="text-yellow-700 text-sm">
              Multiple failed login attempts detected. For your security, please ensure you're using the correct credentials.
            </p>
          </div>
        )}

        {/* Support Contact */}
        <div className="text-center text-xs text-gray-500">
          <p>
            Need help? Contact support at{' '}
            <a href="mailto:support@findmyhaji.com" className="text-yellow-600 hover:text-yellow-500 underline">
              support@findmyhaji.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProviderLogin;