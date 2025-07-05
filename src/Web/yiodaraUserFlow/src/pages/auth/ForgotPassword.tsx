import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '../../contexts/AuthContext';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { requestPasswordResetOtp, error, isLoading, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      setFormError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setFormError('Email is invalid');
      return false;
    }
    
    setFormError('');
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setFormError('');
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await requestPasswordResetOtp(email);
      if (response && response.succeeded) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/reset-password', { state: { email } });
        }, 2000);
      }
    } catch {
      // Error is handled by the useAuth context, which will set the error state
    }
  };
   

  return (
    <div className="w-full">
      <h1 className="text-xl md:text-3xl font-bold leading-tight font-raleway text-center mb-4 md:mb-6">
        Forgot Password
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border font-mulish border-green-400 text-green-700 px-3 py-2 rounded mb-3 text-sm">
          OTP has been sent to your email. You will be redirected to reset your password.
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
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
              formError ? 'border-red-500' : ''
            }`}
            disabled={isLoading || success}
          />
          {formError && <p className="text-red-500 text-xs md:text-sm mt-1 font-mulish font-bold">{formError}</p>}
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            className="w-full bg-[#9F1AB1] py-0 hover:bg-[#8f179f] text-sm md:text-base font-mulish h-10 md:h-[56px] transition-colors"
            disabled={isLoading || success}
          >
            {isLoading ? 'Sending...' : 'Send OTP'}
          </Button>
        </div>

        <div className="text-center pt-1">
          <Link to="/login" className="text-[#9F1AB1] underline text-sm md:text-[16px] leading-6 md:leading-8 font-bold font-mulish">
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;