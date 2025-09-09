import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { toast } from 'sonner';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('findmyhaji_token');
    localStorage.removeItem('findmyhaji_user');
    toast({
      title: "Logged out successfully",
      description: "You have been signed out of FindMyHaji Admin",
    });
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar onLogout={handleLogout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onLogout={handleLogout} />
        
        <main className="flex-1 overflow-y-auto bg-slate-100">
          <div className="p-6">
            {children}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 px-6 py-3">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <div className="flex items-center space-x-4">
              <span>FindMyHaji Admin v2.1.0</span>
              <span>•</span>
              <button className="hover:text-slate-700 transition-colors">
                Contact Support
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <span>Built with ❤️ for the Ummah</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;