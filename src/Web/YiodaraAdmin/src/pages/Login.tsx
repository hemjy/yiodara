import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import PrimaryLogo from '../assets/primary-logo.svg';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { login, isAuthenticated, loading, error } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!email.trim()) {
      setFormError('Email is required');
      return;
    }
    
    if (!password.trim()) {
      setFormError('Password is required');
      return;
    }
    
    const success = await login(email, password);
    
    if (success) {
      navigate('/');
    }
  };
  
  return (
    <div className="flex min-h-svh md:min-h-screen bg-gradient-to-b from-white to-[#FEFAFF]">
      <div className="hidden lg:flex lg:w-1/2 bg-[#9F1AB1] flex-col justify-center items-center p-12">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold text-white mb-6 font-raleway">Welcome Back!</h1>
          <p className="text-white/80 text-lg mb-8 font-raleway">
          Your dashboard is ready. Let's get started on creating positive change.
          </p>
          <div className="w-24 h-1 bg-white/30 mx-auto rounded-full"></div>
        </div>
      </div>
      
      <div className="w-full  lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <img src={PrimaryLogo} alt="Yiodara Logo" className="mx-auto h-12 w-12 md:h-16 md:w-16 mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-[#101828] mb-2 font-raleway">Access Your Dashboard</h2>
            <p className="text-sm md:text-base text-gray-600 font-mulish">Enter your admin credentials to continue</p>
          </div>
          
          {(error || formError) && (
            <Alert variant="destructive" className="mb-6 border border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600">
                {formError || error}
              </AlertDescription>
            </Alert>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-gray-300 focus:border-[#BA24D5] focus:ring-[#BA24D5]/10"
                placeholder="name@example.com"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                {/* <a href="#" className="text-sm font-medium text-[#9F1AB1] hover:text-[#BA24D5]">
                  Forgot password?
                </a> */}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-10 border-gray-300 focus:border-[#BA24D5] focus:ring-[#BA24D5]/10"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full h-12 bg-[#9F1AB1] hover:bg-[#BA24D5] transition-colors duration-200"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
            
            {/* <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="#" className="font-medium text-[#9F1AB1] hover:text-[#BA24D5]">
                  Contact administrator
                </a>
              </p>
            </div> */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 