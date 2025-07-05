import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword, requestPasswordResetOtp, error, isLoading, clearError } = useAuth();
  
  const initialEmail = (location.state as { email: string })?.email || '';
  
  const [formData, setFormData] = useState({
    email: initialEmail,
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [otpExpired, setOtpExpired] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    if (error) {
      clearError();
    }
    
    if (name === 'otp' && otpExpired) {
      setOtpExpired(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.otp.trim()) {
      errors.otp = 'OTP is required';
    }
    
    if (!formData.newPassword) {
      errors.newPassword = 'Password is required';
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      const response = await resetPassword(formData);
      if (response.succeeded) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Check for specific error messages like expired OTP
        const errorMessage = response.message?.toLowerCase();
        if (errorMessage?.includes('expired')) {
          setOtpExpired(true);
        }
      }
    } catch {
      // The useAuth hook will set the generic error message
    }
  };

  const handleResendOtp = async () => {
    if (!formData.email) return;
    
    setResendingOtp(true);
    try {
      const response = await requestPasswordResetOtp(formData.email);
      if (response.succeeded) {
        setOtpExpired(false);
        setFormData(prev => ({ ...prev, otp: '' }));
      }
    } catch {
      // Error is handled by context
    } finally {
      setResendingOtp(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-xl md:text-3xl font-bold leading-tight font-raleway text-center mb-4 md:mb-6">
        Reset Password
      </h1>

      {error && !otpExpired && (
        <div className="bg-red-100 border font-mulish border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      {otpExpired && (
        <div className="bg-red-100 border font-mulish border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm flex flex-col">
          <p>OTP has expired. Please request a new one.</p>
          <button 
            onClick={handleResendOtp}
            className="text-blue-600 underline mt-2 self-end text-sm"
            disabled={resendingOtp}
          >
            {resendingOtp ? 'Sending...' : 'Resend OTP'}
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded mb-3 text-sm">
          Password has been reset successfully. You will be redirected to login.
        </div>
      )}

      <form className="space-y-3 md:space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="block text-sm md:text-[16px] leading-6 md:leading-8 font-bold font-mulish">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. example@gmail.com"
            className={`w-full h-10 md:h-[48px] border-[#D0D5DD] rounded-lg md:rounded-none bg-transparent placeholder:text-[#98A2B3] placeholder:text-sm md:placeholder:text-[16px] placeholder:leading-6 md:placeholder:leading-8 outline-none focus:ring-2 focus:ring-[#9F1AB1] focus:border-transparent border px-3 transition-all ${
              formErrors.email ? 'border-red-500' : ''
            }`}
            disabled={isLoading || success || !!initialEmail}
          />
          {formErrors.email && <p className="text-red-500 text-xs md:text-sm mt-1">{formErrors.email}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-sm md:text-[16px] leading-6 md:leading-8 font-bold font-mulish">
            OTP
          </label>
          <input
            type="text"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            placeholder="Enter OTP from your email"
            pattern="[0-9]*"
            inputMode="numeric"
            className={`w-full h-10 md:h-[48px] border-[#D0D5DD] rounded-lg md:rounded-none bg-transparent placeholder:text-[#98A2B3] placeholder:text-sm md:placeholder:text-[16px] placeholder:leading-6 md:placeholder:leading-8 outline-none focus:ring-2 focus:ring-[#9F1AB1] focus:border-transparent border px-3 transition-all ${
              formErrors.otp || otpExpired ? 'border-red-500' : ''
            }`}
            disabled={isLoading || success}
          />
          {formErrors.otp && <p className="text-red-500 text-xs md:text-sm mt-1">{formErrors.otp}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-sm md:text-[16px] leading-6 md:leading-8 font-bold font-mulish">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className={`w-full pr-10 h-10 md:h-[48px] border-[#D0D5DD] rounded-lg md:rounded-none bg-transparent placeholder:text-[#98A2B3] placeholder:text-sm md:placeholder:text-[16px] placeholder:leading-6 md:placeholder:leading-8 outline-none focus:ring-2 focus:ring-[#9F1AB1] focus:border-transparent border px-3 transition-all ${
                formErrors.newPassword ? 'border-red-500' : ''
              }`}
              placeholder="**********"
              disabled={isLoading || success}
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
          {formErrors.newPassword && <p className="text-red-500 text-xs md:text-sm mt-1">{formErrors.newPassword}</p>}
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
              className={`w-full pr-10 h-10 md:h-[48px] border-[#D0D5DD] rounded-lg md:rounded-none bg-transparent placeholder:text-[#98A2B3] placeholder:text-sm md:placeholder:text-[16px] placeholder:leading-6 md:placeholder:leading-8 outline-none focus:ring-2 focus:ring-[#9F1AB1] focus:border-transparent border px-3 transition-all ${
                formErrors.confirmPassword ? 'border-red-500' : ''
              }`}
              placeholder="**********"
              disabled={isLoading || success}
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
          {formErrors.confirmPassword && <p className="text-red-500 text-xs md:text-sm mt-1">{formErrors.confirmPassword}</p>}
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            className="w-full bg-[#9F1AB1] py-0 hover:bg-[#8f179f] text-sm md:text-base font-mulish h-10 md:h-[56px] transition-colors"
            disabled={isLoading || success}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </div>

        <div className="text-center pt-1">
          <Link to="/login" className="text-[#9F1AB1] hover:underline text-sm md:text-[16px] leading-6 md:leading-8 font-bold font-mulish">
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword; 