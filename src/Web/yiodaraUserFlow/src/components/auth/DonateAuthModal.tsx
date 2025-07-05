import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

interface DonateAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignTitle: string;
  campaignDescription: string;
  raisedAmount: number;
  goalAmount: number;
  percentageRaised: number;
}

const DonateAuthModal = ({
  isOpen,
  onClose,
  campaignTitle,
  campaignDescription,
  raisedAmount,
  goalAmount,
  percentageRaised,
}: DonateAuthModalProps) => {
  const navigate = useNavigate();

  // Close modal if escape key is pressed
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    
    // Prevent scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSignInClick = () => {
    navigate("/login");
    onClose();
  };

  // Calculate percentage raised (ensure it's a number)
  const displayPercentage = isNaN(percentageRaised) ? 0 : percentageRaised;

  // Add click outside to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold font-raleway mb-4">{campaignTitle}</h2>
          
          <p className="text-gray-700 mb-6">
            {campaignDescription.length > 150 
              ? `${campaignDescription.substring(0, 150)}...` 
              : campaignDescription}
          </p>
          
          <div className="mb-4">
            <div className="h-2 bg-gray-100 rounded w-full mb-2">
              <div
                className="h-full bg-[#FDB022] rounded"
                style={{ width: `${displayPercentage}%` }}
              />
            </div>
            <div className="text-right text-sm font-bold text-black">
              {displayPercentage}%
            </div>
          </div>
          
          <div className="flex justify-between text-sm mb-6">
            <span className="text-gray-500">
              Raised: <span className="text-[#FDB022] font-bold">${raisedAmount?.toLocaleString() || 0}</span>
            </span>
            <span className="text-gray-500">
              Goal: <span className="text-[#067647] font-bold">${goalAmount?.toLocaleString() || 0}</span>
            </span>
          </div>
          
          <Button
            className="w-full bg-[#9F1AB1] hover:bg-[#8A1697] text-white"
            onClick={handleSignInClick}
          >
            Please Sign up/Login to Donate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DonateAuthModal; 