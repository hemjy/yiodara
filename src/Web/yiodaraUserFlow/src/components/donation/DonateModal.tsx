import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignTitle: string;
  campaignDescription: string;
  raisedAmount: number;
  goalAmount: number;
  percentageRaised: number;
  onDonate: (amount: number, isAnonymous: boolean) => void;
}

const DonateModal = ({
  isOpen,
  onClose,
  campaignTitle,
  campaignDescription,
  raisedAmount,
  goalAmount,
  percentageRaised,
  onDonate,
}: DonateModalProps) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  const predefinedAmounts = [25, 50, 100, 150, 200];

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

  // Calculate percentage raised (ensure it's a number)
  const displayPercentage = isNaN(percentageRaised) ? 0 : percentageRaised;

  // Handle amount selection
  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  // Handle custom amount input
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value);
      setSelectedAmount(null);
    }
  };

  // Handle donation submission
  const handleDonate = () => {
    const amount = selectedAmount || parseFloat(customAmount);
    if (amount && amount > 0) {
      onDonate(amount, isAnonymous);
      onClose();
    }
  };

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
          
          {/* Donation amount selection */}
          <div className="mb-6">
            <div className="text-[#9F1AB1] font-semibold mb-2">Custom Amount</div>
            <div className="flex flex-wrap gap-2 mb-4">
              {predefinedAmounts.map((amount) => (
                <button
                  key={amount}
                  className={`px-4 py-2 border rounded ${
                    selectedAmount === amount
                      ? "bg-[#9F1AB1] text-white border-[#9F1AB1]"
                      : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                  }`}
                  onClick={() => handleAmountSelect(amount)}
                >
                  ${amount.toFixed(2)}
                </button>
              ))}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">Enter a custom amount:</label>
              <div className="flex items-center">
                <span className="mr-2 text-gray-700">$</span>
                <Input
                  type="text"
                  placeholder="e.g. 100, 200, 300..."
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={() => setIsAnonymous(!isAnonymous)}
                className="mr-2"
              />
              <label htmlFor="anonymous" className="text-sm text-gray-600">
                Click here to make donations anonymously.
              </label>
            </div>
          </div>
          
          <Button
            className="w-full bg-[#9F1AB1] hover:bg-[#8A1697] text-white"
            onClick={handleDonate}
            disabled={!selectedAmount && (!customAmount || parseFloat(customAmount) <= 0)}
          >
            Make Payment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DonateModal; 