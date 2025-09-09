import React from 'react';
import { useNavigate } from 'react-router-dom';
import ModernSidebar from './ModernSidebar';
import ModernTopBar from './ModernTopBar';
import { toast } from 'sonner';

const ModernLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('findmyhaji_token');
    localStorage.removeItem('findmyhaji_user');
    
    // Clear any other cached data
    sessionStorage.clear();
    
    toast.success("Logged out successfully", {
      description: "You have been signed out of FindMyHaji Operations Center",
    });
    
    // Navigate to login and refresh to ensure clean state
    navigate('/login');
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <ModernSidebar onLogout={handleLogout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <ModernTopBar onLogout={handleLogout} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            {children}
          </div>
        </main>
        
        {/* Modern Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>FindMyHaji Operations Center v3.0</span>
              <span>•</span>
              <button className="hover:text-gray-700 transition-colors">
                Emergency Support: +966 800 HAJJ (4255)
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <span>🕋 Serving the pilgrims of Allah with dedication</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ModernLayout;