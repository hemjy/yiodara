// import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  // DialogClose,
} from "@/components/ui/dialog";

interface VolunteerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VolunteerAuthModal = ({ isOpen, onClose }: VolunteerAuthModalProps) => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Join Our Volunteer Team!
          </DialogTitle>
          {/* <DialogClose asChild>
              <button className="absolute top-4 right-4" onClick={onClose}>
                <X className="h-6 w-6" />
              </button>
          </DialogClose> */}
        </DialogHeader>
        <div className="text-center text-gray-600 mt-2 mb-6">
          <p>Please log in or create an account to register for an event.</p>
        </div>
        <div className="flex flex-col space-y-3">
          <Button
            onClick={() => handleNavigation("/login")}
            className="w-full bg-[#9F1AB1] hover:bg-[#8a0f9c]"
          >
            Login
          </Button>
          <Button
            onClick={() => handleNavigation("/signup")}
            variant="outline"
            className="w-full"
          >
            Sign Up
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 