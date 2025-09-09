import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Building, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Urls } from '@/lib/utils';
import Network from '@/lib/Network';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('findmyhaji_token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    // setTimeout(() => {
      if (credentials.email && credentials.password) {
        try{
          const headers = { 'Content-Type': 'application/json' }
          const param = {
            email:credentials.email,
            password:credentials.password
          }
          const response = await Network.post(Urls.baseUrl +'/api/auth/login', headers, param);
          if(response?.data?.status === "success"){
            localStorage.setItem('findmyhaji_token', response.data.token);
            localStorage.setItem('findmyhaji_user', JSON.stringify({
              name: response.data.user.name,
              email: credentials.email,
              role: response.data.user.role,
              location: response.data.user.location
            }));
            
            toast.success("Welcome back!", {
              description: "Successfully logged in to FindMyHaji Operations Center",
            });
            
            // Force navigation and refresh auth state
            setTimeout(() => {
              navigate('/dashboard');
              window.location.reload(); // Ensure auth state is refreshed
            }, 500);
          }else{
            toast.error("Login Failed", {
              description: response.data.error,
            });
          }
        }catch(e){
          toast.error("Login Failed", {
            description: "Please enter valid credentials",
          });
        }     
      } else {
          toast.error("Login Failed", {
          description: "Please enter valid credentials",
        });
      }
      setIsLoading(false);
    // }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-transparent to-amber-100"></div>
      </div>

      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
            <Building className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-800 mb-2">FindMyHaji Admin</CardTitle>
            <CardDescription className="text-slate-600">
              Operations Center - Manage pilgrims and sacred journeys
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@findmyhaji.com"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                className="bg-slate-50 border-slate-200 focus:border-amber-500 focus:ring-amber-500/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="bg-slate-50 border-slate-200 focus:border-amber-500 focus:ring-amber-500/20 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium py-3 shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-slate-600">
            <p className="mb-2">Demo Credentials:</p>
            <div className="bg-slate-50 p-3 rounded-lg text-left">
              <p><strong>Email:</strong> admin@findmyhaji.com</p>
              <p><strong>Password:</strong> admin123</p>
              <p className="text-xs text-slate-500 mt-1">Admin: Khazi Naseeruddin</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;