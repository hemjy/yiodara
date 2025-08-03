import { X, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfilePictureModalProps {
  onClose: () => void;
}

const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-red-500 hover:text-red-700">
          <X className="size-6" />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 font-raleway">Upload your profile picture</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 mb-4">
            <UploadCloud className="mx-auto size-16 text-gray-400" />
            <p className="text-gray-500 mt-4">JPG or PNG formats, up to 5MB.</p>
          </div>
          <Button className="bg-[#9F1AB1] hover:bg-[#8f179f] w-full">Upload Image</Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureModal;
