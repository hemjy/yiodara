// src/pages/auth/Login.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from 'lucide-react';
import GoogleIcon from '@/assets/devicon_google.svg';
import { useAuth } from '../../contexts/AuthContext';
import useGoogleAuth from '../../hooks/useGoogleAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, error, isLoading, clearError } = useAuth();
  const { renderGoogleButton, isGoogleReady } = useGoogleAuth();
  const location = useLocation();
  
  // Get the redirect path from location state or default to home
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Render Google button when component mounts
  useEffect(() => {
    if (isGoogleReady) {
      renderGoogleButton('google-signin-button');
    }
  }, [isGoogleReady, renderGoogleButton]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    }
    
    // Clear field error when user types
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Clear API error when user makes changes
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await login({
        email,
        password
      }, from);
    } catch (err) {
      // Error is handled and displayed by the AuthContext
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl md:text-3xl font-bold leading-tight font-raleway text-center mb-4 md:mb-6">
        Login to your account
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 font-mulish text-red-700 px-3 md:px-4 py-2 md:py-3 rounded mb-3 md:mb-4 text-sm md:text-base">
          {error}
        </div>
      )}

      <form className="space-y-3 md:space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1 md:space-y-2">
          <label className="block text-sm md:text-[16px] leading-6 md:leading-8 font-bold font-mulish">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            placeholder="e.g. example@gmail.com"
            className={`w-full h-10 md:h-[48px] border-[#D0D5DD] rounded-none bg-transparent placeholder:text-[#98A2B3] placeholder:text-sm md:placeholder:text-[16px] placeholder:leading-6 md:placeholder:leading-8 outline-none focus:ring-1 focus:ring-[#9F1AB1] focus:border-transparent border px-3 transition-all ${
              formErrors.email ? 'border-red-500' : ''
            }`}
          />
          {formErrors.email && (
            <p className="text-red-500 font-semibold font-mulish text-xs md:text-sm">{formErrors.email}</p>
          )}
        </div>

        <div className="space-y-1 md:space-y-2">
          <label className="block text-sm md:text-[16px] leading-6 md:leading-8 font-bold font-mulish">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={handleChange}
              className={`w-full pr-10 h-10 md:h-[48px] border-[#D0D5DD] rounded-none bg-transparent placeholder:text-[#98A2B3] placeholder:text-sm md:placeholder:text-[16px] placeholder:leading-6 md:placeholder:leading-8 outline-none focus:ring-1 focus:ring-[#9F1AB1] focus:border-transparent border px-3 transition-all ${
                formErrors.password ? 'border-red-500' : ''
              }`}
              placeholder='*******'
            />
            <div 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer touch-manipulation"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </div>
          </div>
          {formErrors.password && (
            <p className="text-red-500 font-semibold font-mulish text-xs md:text-sm">{formErrors.password}</p>
          )}
          <div className="text-right">
            <Link 
              to="/forgot-password" 
              className="text-sm md:text-[16px] leading-6 md:leading-8 font-bold font-mulish text-[#9F1AB1] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <div className="pt-2 md:pt-0">
          <Button 
            type="submit" 
            className="w-full bg-[#9F1AB1] py-0 hover:bg-[#8f179f] text-sm md:text-base font-mulish h-10 md:h-[56px] transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </div>

        <div className="mt-4 md:mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs md:text-sm">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

            <div className="mt-4 md:mt-6 flex justify-center">
              {isGoogleReady ? (
                <div id="google-signin-button"></div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 md:h-[56px] bg-transparent border-[#9F1AB1] text-[#9F1AB1] text-sm md:text-base font-bold font-mulish gap-2 transition-colors"
                disabled
              >
                <img src={GoogleIcon} className="h-4 w-4 md:h-5 md:w-5" />
                Setting up Google Sign-In...
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-sm md:text-[16px] leading-6 md:leading-8 font-mulish font-medium mt-3 md:mt-2"> 
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#9F1AB1] hover:underline font-bold">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;