import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";

// Import components
import LoginPage from "./components/auth/LoginPage";
import ModernLayout from "./components/modern/ModernLayout";
import ModernDashboard from "./components/modern/ModernDashboard";
import EmployeeOnboarding from "./components/employees/EmployeeOnboarding";
import ProviderRegistration from "./components/providers/ProviderRegistration";
import ProviderLogin from "./components/providers/ProviderLogin";
import ProviderDashboard from "./components/providers/ProviderDashboard";
import AdminProviderManagement from "./components/admin/ProviderManagement";
import ContactManagement from "./components/admin/ContactManagement";
import WebsiteContentManager from "./components/admin/WebsiteContentManager";
import BlogManagement from "./components/admin/BlogManagement";
import PushNotificationConfig from "./components/admin/PushNotificationConfig";
import ThirdPartyConfigurations from "./components/admin/ThirdPartyConfigurations";
import IntegrationDashboard from "./components/admin/IntegrationDashboard";
import RoleManagement from "./components/employees/RoleManagement";

// Website redirect component
const WebsiteRedirect = () => {
  useEffect(() => {
    // Redirect to the backend landing page
    window.location.href = '/api/landing-page';
  }, []);

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      textAlign: 'center', 
      padding: '50px',
      background: 'linear-gradient(135deg, #faf8f3 0%, #f5f1eb 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div>
        <h2 style={{ color: '#0f4c3a', marginBottom: '20px' }}>🕌 FindMyHaji</h2>
        <p style={{ color: '#4b5563', marginBottom: '20px' }}>Redirecting to our website...</p>
        <p style={{ color: '#6b7280' }}>
          If you're not redirected automatically, {' '}
          <a href="/api/landing-page" style={{ color: '#0f4c3a', textDecoration: 'underline' }}>
            click here
          </a>.
        </p>
      </div>
    </div>
  );
};

// Auth wrapper component for admin routes
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('findmyhaji_token');
      const user = localStorage.getItem('findmyhaji_user');
      
      // Check if both token and user exist
      const authValid = !!(token && user);
      setIsAuthenticated(authValid);
      setIsLoading(false);
    };

    checkAuth();

    // Listen for storage changes (useful for logout from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'findmyhaji_token' || e.key === 'findmyhaji_user') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FindMyHaji Operations Center...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Auth wrapper component for provider routes
const ProviderProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('providerToken');
      const role = localStorage.getItem('userRole');
      
      // Check if both token exists and role is provider
      const authValid = !!(token && role === 'provider');
      setIsAuthenticated(authValid);
      setIsLoading(false);
    };

    checkAuth();

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'providerToken' || e.key === 'userRole') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Provider Dashboard...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/providers/login" replace />;
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Public Website Routes */}
          <Route path="/website" element={<WebsiteRedirect />} />
          <Route path="/landing" element={<WebsiteRedirect />} />
          <Route path="/findmyhaji-website" element={<WebsiteRedirect />} />
          
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Provider Public Routes */}
          <Route path="/providers/register" element={<ProviderRegistration />} />
          <Route path="/providers/login" element={<ProviderLogin />} />
          
          {/* Provider Protected Routes */}
          <Route path="/providers/dashboard" element={
            <ProviderProtectedRoute>
              <ProviderDashboard />
            </ProviderProtectedRoute>
          } />
          
          {/* Admin Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <ModernLayout>
                <ModernDashboard />
              </ModernLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <ModernLayout>
                <ModernDashboard />
              </ModernLayout>
            </ProtectedRoute>
          } />

          {/* Admin Provider Management */}
          <Route path="/admin/providers" element={
            <ProtectedRoute>
              <ModernLayout>
                <AdminProviderManagement />
              </ModernLayout>
            </ProtectedRoute>
          } />

          {/* Contact Management Route */}
          <Route path="/admin/contacts" element={
            <ProtectedRoute>
              <ModernLayout>
                <ContactManagement />
              </ModernLayout>
            </ProtectedRoute>
          } />

          {/* Website Content Management Route */}
          <Route path="/admin/website-content" element={
            <ProtectedRoute>
              <ModernLayout>
                <WebsiteContentManager />
              </ModernLayout>
            </ProtectedRoute>
          } />

          {/* Blog Management Route */}
          <Route path="/admin/blogs" element={
            <ProtectedRoute>
              <ModernLayout>
                <BlogManagement />
              </ModernLayout>
            </ProtectedRoute>
          } />

          {/* Push Notification Config Route */}
          <Route path="/admin/notifications" element={
            <ProtectedRoute>
              <ModernLayout>
                <PushNotificationConfig />
              </ModernLayout>
            </ProtectedRoute>
          } />

          {/* Third Party Configurations Route */}
          <Route path="/admin/third-party" element={
            <ProtectedRoute>
              <ModernLayout>
                <ThirdPartyConfigurations />
              </ModernLayout>
            </ProtectedRoute>
          } />

          {/* Integration Dashboard Route */}
          <Route path="/admin/integration-dashboard" element={
            <ProtectedRoute>
              <ModernLayout>
                <IntegrationDashboard />
              </ModernLayout>
            </ProtectedRoute>
          } />

          {/* Employee Management Routes */}
          <Route path="/employees/add" element={
            <ProtectedRoute>
              <ModernLayout>
                <EmployeeOnboarding />
              </ModernLayout>
            </ProtectedRoute>
          } />
          
          {/* Placeholder routes for other modern sections */}
          <Route path="/tracking" element={
            <ProtectedRoute>
              <ModernLayout>
                <div className="text-center py-20">
                  <h2 className="text-2xl font-bold text-gray-800">Real-Time Tracking Panel</h2>
                  <p className="text-gray-600 mt-2">Advanced pilgrim tracking interface coming soon...</p>
                </div>
              </ModernLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/family" element={
            <ProtectedRoute>
              <ModernLayout>
                <div className="text-center py-20">
                  <h2 className="text-2xl font-bold text-gray-800">Family Connection Hub</h2>
                  <p className="text-gray-600 mt-2">Comprehensive family communication system coming soon...</p>
                </div>
              </ModernLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/groups" element={
            <ProtectedRoute>
              <ModernLayout>
                <div className="text-center py-20">
                  <h2 className="text-2xl font-bold text-gray-800">Pilgrim Group Management</h2>
                  <p className="text-gray-600 mt-2">Advanced group management tools coming soon...</p>
                </div>
              </ModernLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/communication" element={
            <ProtectedRoute>
              <ModernLayout>
                <div className="text-center py-20">
                  <h2 className="text-2xl font-bold text-gray-800">Communication Center</h2>
                  <p className="text-gray-600 mt-2">Unified communication platform coming soon...</p>
                </div>
              </ModernLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/timeline" element={
            <ProtectedRoute>
              <ModernLayout>
                <div className="text-center py-20">
                  <h2 className="text-2xl font-bold text-gray-800">Journey Timeline</h2>
                  <p className="text-gray-600 mt-2">Detailed journey tracking interface coming soon...</p>
                </div>
              </ModernLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/analytics" element={
            <ProtectedRoute>
              <ModernLayout>
                <div className="text-center py-20">
                  <h2 className="text-2xl font-bold text-gray-800">Analytics & Reports</h2>
                  <p className="text-gray-600 mt-2">Comprehensive analytics dashboard coming soon...</p>
                </div>
              </ModernLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <ModernLayout>
                <div className="text-center py-20">
                  <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
                  <p className="text-gray-600 mt-2">Operations center configuration coming soon...</p>
                </div>
              </ModernLayout>
            </ProtectedRoute>
          } />

          {/* Employee Management placeholder routes */}
          <Route path="/employees/roles" element={
            <ProtectedRoute>
              <ModernLayout>
                <RoleManagement/>
              </ModernLayout>
            </ProtectedRoute>
          } />

          <Route path="/employees/list" element={
            <ProtectedRoute>
              <ModernLayout>
                <div className="text-center py-20">
                  <h2 className="text-2xl font-bold text-gray-800">Employee List</h2>
                  <p className="text-gray-600 mt-2">Employee directory and management coming soon...</p>
                </div>
              </ModernLayout>
            </ProtectedRoute>
          } />

          {/* Catch all route - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </div>
  );
}

export default App;