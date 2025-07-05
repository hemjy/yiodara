import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from 'lucide-react';
import GoogleIcon from '../../assets/devicon_google.svg';
import { useAuth } from '../../contexts/AuthContext';
import useGoogleAuth from '../../hooks/useGoogleAuth';

const SignUp = () => {
  const navigate = useNavigate();
  const { signup, error, isLoading, clearError } = useAuth();
  const { renderGoogleButton, isGoogleReady } = useGoogleAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    userName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Render Google button when component mounts
  useEffect(() => {
    if (isGoogleReady) {
  //     setTimeout(() => {
        renderGoogleButton('google-signup-button');
      // }, 100);
    }
  }, [isGoogleReady, renderGoogleButton]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
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
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!formData.userName.trim()) {
      errors.userName = 'Username is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else {
      if (formData.password.length < 8) {
        errors.password = 'Passwords must be at least 8 characters.';
      } else if (!/[^a-zA-Z0-9]/.test(formData.password)) {
        errors.password = 'Passwords must have at least one non-alphanumeric character.';
      } else if (!/\d/.test(formData.password)) {
        errors.password = "Passwords must have at least one digit ('0'-'9').";
      } else if (!/[A-Z]/.test(formData.password)) {
        errors.password = "Passwords must have at least one uppercase ('A'-'Z').";
      }
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirm Password is required';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      await signup({
        fullName: formData.fullName,
        userName: formData.userName,
        email: formData.email,
        password: formData.password,
        role: 'user' // Default role
      });
      
      // If signup is successful, the user will be automatically logged in
      // and redirected to the home page
      navigate('/');
    } catch {
      // Error handling is done in the AuthContext
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-xl md:text-3xl font-bold leading-tight font-raleway text-center mb-4 md:mb-6">
        Create an account
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      <form className="space-y-3 md:space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="block text-sm md:text-[16px] leading-6 md:leading-8 font-bold font-mulish">
            Full name
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="e.g. Gloria Philips, Emmanuel Brian, .."
            className={`w-full h-10 md:h-[48px] border-[#D0D5DD] rounded-none bg-transparent placeholder:text-[#98A2B3] placeholder:text-sm md:placeholder:text-[16px] placeholder:leading-6 md:placeholder:leading-8 outline-none focus:ring-1 focus:ring-[#9F1AB1] focus:border-transparent border px-3 transition-all ${
              formErrors.fullName ? 'border-red-500' : ''
            }`}
          />
          {formErrors.fullName && (
            <p className="text-red-500 font-medium font-mulish text-xs md:text-sm mt-1">{formErrors.fullName}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm md:text-[16px] leading-6 md:leading-8 font-bold font-mulish">
            Username
          </label>
          <input
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            placeholder="e.g. gbengz, caduna, shrek..."
            className={`w-full h-10 md:h-[48px] border-[#D0D5DD] rounded-none bg-transparent placeholder:text-[#98A2B3] placeholder:text-sm md:placeholder:text-[16px] placeholder:leading-6 md:placeholder:leading-8 outline-none focus:ring-1 focus:ring-[#9F1AB1] focus:border-transparent border px-3 transition-all ${
              formErrors.userName ? 'border-red-500' : ''
            }`}
          />
          {formErrors.userName && (
            <p className="text-red-500 font-medium font-mulish text-xs md:text-sm mt-1">{formErrors.userName}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm md:text-[16px] leading-6 md:leading-8 font-bold font-mulish">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. example@gmail.com"
            className={`w-full h-10 md:h-[48px] border-[#D0D5DD] rounded-none bg-transparent placeholder:text-[#98A2B3] placeholder:text-sm md:placeholder:text-[16px] placeholder:leading-6 md:placeholder:leading-8 outline-none focus:ring-1 focus:ring-[#9F1AB1] focus:border-transparent border px-3 transition-all ${
              formErrors.email ? 'border-red-500' : ''
            }`}
          />
          {formErrors.email && (
            <p className="text-red-500 font-medium font-mulish text-xs md:text-sm mt-1">{formErrors.email}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm md:text-[16px] leading-6 md:leading-8 font-bold font-mulish">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full pr-10 h-10 md:h-[48px] border-[#D0D5DD] rounded-none bg-transparent placeholder:text-[#98A2B3] placeholder:text-sm md:placeholder:text-[16px] placeholder:leading-6 md:placeholder:leading-8 outline-none focus:ring-1 focus:ring-[#9F1AB1] focus:border-transparent border px-3 transition-all ${
                formErrors.password ? 'border-red-500' : ''
              }`}
              placeholder="**********"
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
            <p className="text-red-500 font-medium font-mulish text-xs md:text-sm mt-1">{formErrors.password}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm md:text-[16px] leading-6 md:leading-8 font-bold font-mulish">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full pr-10 h-10 md:h-[48px] border-[#D0D5DD] rounded-none bg-transparent placeholder:text-[#98A2B3] placeholder:text-sm md:placeholder:text-[16px] placeholder:leading-6 md:placeholder:leading-8 outline-none focus:ring-1 focus:ring-[#9F1AB1] focus:border-transparent border px-3 transition-all ${
                formErrors.confirmPassword ? 'border-red-500' : ''
              }`}
              placeholder="**********"
            />
            <div
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer touch-manipulation"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </div>
          </div>
          {formErrors.confirmPassword && (
            <p className="text-red-500 font-medium font-mulish text-xs md:text-sm mt-1">{formErrors.confirmPassword}</p>
          )}
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            className="w-full bg-[#9F1AB1] py-0 hover:bg-[#8f179f] h-10 md:h-[56px] text-sm md:text-base transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Signing Up...' : 'Sign Up'}
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

          <div className="mt-3 md:mt-4 flex justify-center">
            {isGoogleReady ? (
              <div id="google-signup-button"></div>
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

        <p className="text-center text-sm md:text-[16px] leading-6 md:leading-8 font-mulish font-medium pt-1">
          Already have an account?{' '}
          <Link to="/login" className="text-[#9F1AB1] hover:underline font-bold">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;