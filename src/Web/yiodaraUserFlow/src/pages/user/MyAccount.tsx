import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDonationHistory } from "@/hooks/useDonationHistory";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, EyeOff, Pencil, ArrowRight } from "lucide-react";

const MyAccount = () => {
    useEffect(()=>{
    window.scrollTo(0,0)
  },[])
  const { currentUser, changePassword } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isAmountVisible, setIsAmountVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const { data: historyData, isLoading: isLoadingHistory } = useDonationHistory({
    userId: currentUser?.userId || '',
    pageNumber: 1,
    pageSize: 1,
  });

  const user = historyData?.data;

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log("Updated full name:", fullName);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved.",
    });

    setIsSaving(false);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setFullName(currentUser?.fullName || '');
    setIsEditing(false);
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (passwordErrors[name as keyof typeof passwordErrors]) {
        setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = { currentPassword: '', newPassword: '', confirmPassword: '' };

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required.';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required.';
    } else if (passwordData.newPassword.length < 9) {
      errors.newPassword = 'Password must be at least 9 characters long.';
    } else if (!/[a-zA-Z]/.test(passwordData.newPassword)) {
      errors.newPassword = 'Password must contain at least one letter.';
    } else if (!/\d/.test(passwordData.newPassword)) {
      errors.newPassword = 'Password must contain at least one number.';
    } else if (!/[^a-zA-Z0-9]/.test(passwordData.newPassword)) {
      errors.newPassword = 'Password must contain at least one symbol.';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.values(errors).some(e => e)) {
      setPasswordErrors(errors);
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const response = await changePassword(passwordData);

      if (response.succeeded) {
        toast({
          title: "Password Updated",
          description: "Your password has been changed successfully.",
        });
        setIsChangingPassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast({
          title: "Update Failed",
          description: response.message || "An error occurred. Please check your current password.",
          variant: "destructive",
        });
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast({
        title: "Error",
        description: error.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordErrors({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-8">
      <div className="relative text-center mt-10 mb-12 md:mt-[60px] md:mb-[75px]">
        <h1 className="absolute w-full text-5xl md:text-8xl font-black font-raleway leading-tight md:leading-[144px] text-[#F6D0FE] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          MY ACCOUNT
        </h1>
        <h2 className="relative text-lg md:text-[24px] leading-tight md:leading-[36px] font-extrabold font-raleway text-[#9F1AB1] z-10">
          MY ACCOUNT
        </h2>
      </div>

      <div className="bg-[#F9FAFB] p-4 md:p-6 mb-8 border-[1.5px] border-[#EAECF0]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
          <div className="flex items-center gap-4 font-raleway w-full">
            <div className="relative">
              <div className="size-12 md:size-16 rounded-full bg-[#FBE8FF] flex items-center justify-center flex-shrink-0">
                {isLoadingHistory ? (
                  <Skeleton className="h-10 w-10 rounded-full" />
                ) : (
                  <span className="text-[#9F1AB1] text-xl md:text-2xl font-extrabold">
                    {(user?.username || currentUser?.userName)?.charAt(0).toUpperCase() || "A"}
                  </span>
                )}
              </div>
              <button className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 border shadow-sm hover:bg-gray-50 cursor-pointer">
                <Pencil className="size-4 text-[#9F1AB1]" />
              </button>
            </div>

            <div className="space-y-3 md:space-y-4 w-full">
              <div className="flex flex-row md:items-center gap-2 font-raleway">
                <span className="text-[#101828] font-normal text-sm md:text-[16px] leading-tight md:leading-[18px]">
                  Username:
                </span>
                {isLoadingHistory ? <Skeleton className="h-5 w-32" /> : (
                  <span className="text-[#000000] font-bold text-sm md:text-[16px] leading-tight md:leading-[18px]">
                    {currentUser?.userName}
                  </span>
                )}
              </div>
              <div className="flex flex-row md:items-center gap-2 font-raleway">
                <span className="text-[#101828] font-normal text-sm md:text-[16px] leading-tight md:leading-[18px]">
                  Email Address:
                </span>
                {isLoadingHistory ? <Skeleton className="h-5 w-48" /> : (
                  <span className="text-[#000000] font-bold text-sm md:text-[16px] leading-tight md:leading-[18px] truncate">
                    {user?.email || currentUser?.email}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-4 w-full  border-t md:border-none pt-4 md:pt-0">
            <div className="flex md:justify-end items-center gap-2 text-[16px] font-normal font-raleway">
              <span className="text-[#101828] text-sm md:text-[16px]">Total Donations:</span>
              <div className="flex items-center gap-2">
                {isLoadingHistory ? <Skeleton className="md:h-5 md:w-24" /> : (
                  <span className="font-bold text-[#000000]">
                    $ {isAmountVisible ? (user?.totalDonations || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "******"}
                  </span>
                )}
                <button 
                  className="ml-2 hover:text-[#9F1AB1] transition-colors"
                  onClick={() => setIsAmountVisible(!isAmountVisible)}
                  aria-label={isAmountVisible ? "Hide total donations" : "Show total donations"}
                >
                  {isAmountVisible ? (
                    <EyeOff className="text-[#9F1AB1]" />
                  ) : (
                    <Eye className="text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <Link to="/history" className="md:w-auto">
              <Button variant="outline" className="border-[#F6D0FE]  font-mulish text-[#9F1AB1] hover:bg-[#FDF2FF] bg-[#FEFAFF] hover:text-[#9F1AB1] leading-[150%] md:w-full flex items-center justify-center">
                See Donation History
                <ArrowRight className="md:ml-2 ml-0 size-3 md:size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-y-8">
        {/* Profile Information Section */}
        <div className=" bg-white p-4 md:p-8 border rounded-lg">
          {isEditing ? (
            <>
              <h3 className="text-xl md:text-2xl font-bold font-raleway mb-6">Edit Information</h3>
              <form className="space-y-6" onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="username">
                      Username
                    </label>
                    <Input id="username" type="text" defaultValue={currentUser?.userName} disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fullName">
                      Full Name
                    </label>
                    <Input 
                      id="fullName" 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)} 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                    Email Address
                  </label>
                  <Input id="email" type="email" defaultValue={currentUser?.email} disabled />
                </div>
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#9F1AB1] hover:bg-[#8f179f]" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            // View Mode
            <>
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl md:text-2xl font-bold font-raleway">Personal Information</h3>
                <Button variant="outline" className="border-[#F6D0FE]  font-mulish text-[#9F1AB1] hover:bg-[#FDF2FF] bg-[#FEFAFF] hover:text-[#9F1AB1] leading-[150%]" onClick={() => setIsEditing(true)}>
                  Edit
                  <Pencil className="ml-0 size-2" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-6 pt-4">
                <div className="space-y-2">
                  <p className="text-[#475467] font-mulish font-normal leading-[150%] text-base">Full Name</p>
                  <p className="text-[#101828] text-[16px] font-raleway font-bold">{currentUser?.fullName}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[#475467] font-mulish font-normal leading-[150%] text-base">Username</p>
                  <p className="text-[#101828] text-[16px] font-raleway font-bold">{currentUser?.userName}</p>
                </div>
                <div className="space-y-1 col-span-1 md:col-span-2">
                  <p className="text-[#475467] font-mulish font-normal leading-[150%] text-base">Email</p>
                  <p className="text-[#101828] text-[16px] font-raleway font-bold">{currentUser?.email}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Change Password Section */}
        <div className="bg-white p-4 md:p-8 border rounded-lg">
           {isChangingPassword ? (
            // Edit Password Mode
            <>
              <h3 className="text-xl md:text-2xl font-bold font-raleway mb-6">Change Password</h3>
              <form className="space-y-5 md:space-y-6" onSubmit={handlePasswordChange}>
                <div>
                  <label className="block text-sm font-medium font-raleway text-[#08120C] mb-3" htmlFor="currentPassword">
                    Current Password
                  </label>
                  <div className="relative">
                    <Input className="border-[1.8px] rounded-none focus:border-[#9F1AB1] focus:ring-0 focus:ring-offset-0" id="currentPassword" name="currentPassword" placeholder="**********" type={passwordVisibility.current ? "text" : "password"} value={passwordData.currentPassword} onChange={handlePasswordInputChange} />
                    <button type="button" onClick={() => setPasswordVisibility(prev => ({...prev, current: !prev.current}))} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {passwordVisibility.current ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5"/>}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && <p className="text-red-500 text-sm mt-1 font-semibold font-raleway">{passwordErrors.currentPassword}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium font-raleway text-[#08120C] mb-3" htmlFor="newPassword">
                    New Password
                  </label>
                  <div className="relative">
                    <Input className="border-[1.8px] rounded-none focus:border-[#9F1AB1] focus:ring-0 focus:ring-offset-0"  id="newPassword" name="newPassword" type={passwordVisibility.new ? "text" : "password"} value={passwordData.newPassword} onChange={handlePasswordInputChange} />
                     <button type="button" onClick={() => setPasswordVisibility(prev => ({...prev, new: !prev.new}))} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {passwordVisibility.new ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    </button>
                  </div>
                   {passwordErrors.newPassword && <p className="text-red-500 text-sm mt-1 font-semibold font-raleway">{passwordErrors.newPassword}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium font-raleway text-[#08120C] mb-3" htmlFor="confirmPassword">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Input className="border-[1.8px] rounded-none focus:border-[#9F1AB1] focus:ring-0 focus:ring-offset-0" id="confirmPassword" name="confirmPassword"  type={passwordVisibility.confirm ? "text" : "password"} value={passwordData.confirmPassword} onChange={handlePasswordInputChange} />
                     <button type="button" onClick={() => setPasswordVisibility(prev => ({...prev, confirm: !prev.confirm}))} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {passwordVisibility.confirm ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    </button>
                  </div>
                   {passwordErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>}
                </div>
                <div className="flex justify-end gap-4 pt-2">
                    <Button type="button" variant="outline" className="border-[#F6D0FE] border-[1px] w-auto text-[#9F1AB1] bg-[#FDF2FF] hover:text-[#9F1AB1] " onClick={handleCancelPasswordChange} disabled={isUpdatingPassword}>
                        Cancel
                    </Button>
                    <Button type="submit" className="bg-[#9F1AB1] w-auto hover:bg-[#8f179f]" disabled={isUpdatingPassword}>
                        {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                    </Button>
                </div>
              </form>
            </>
          ) : (
            // View Password Mode
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl md:text-2xl font-bold font-raleway">Password</h3>
                    <p className="text-sm text-[#98A2B3] font-mulish mt-1">Change your password here</p>
                    <div className="mt-6">
                        <p className="text-sm text-[#475467] font-mulish">Current Password</p>
                        <p className="font-semibold text-[#101828] font-mulish tracking-widest pt-2">**********</p>
                    </div>
                </div>
                 <Button variant="outline" className="border-[#F6D0FE]  font-mulish text-[#9F1AB1] hover:bg-[#FDF2FF] bg-[#FEFAFF] hover:text-[#9F1AB1] leading-[150%]" onClick={() => setIsChangingPassword(true)}>
                  Change
                  <Pencil className="ml-2 size-4" />
                </Button>
            </div>
          )}
        </div>

        {/* Payment Method Section */}
        <div className="bg-white p-4 md:p-8 border rounded-lg">
          {isEditingPayment ? (
            // Edit Payment Mode
            <>
              <h3 className="text-xl md:text-2xl font-bold font-raleway mb-6">Update Payment Method</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cardNumber">
                    Card Number
                  </label>
                  <Input id="cardNumber" name="cardNumber" type="text" placeholder="**** **** **** 1234" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="expiryDate">
                        Expiry Date
                      </label>
                      <Input id="expiryDate" name="expiryDate" type="text" placeholder="MM/YY" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cvc">
                        CVC
                      </label>
                      <Input id="cvc" name="cvc" type="text" placeholder="123" />
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsEditingPayment(false)}>
                        Cancel
                    </Button>
                    <Button type="submit" className="bg-[#9F1AB1] hover:bg-[#8f179f]">
                        Save Payment Method
                    </Button>
                </div>
              </form>
            </>
          ) : (
            // View Payment Mode
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl md:text-2xl font-bold font-raleway">Payment Method</h3>
                    <p className="text-sm text-gray-500 font-mulish mt-1">Manage your payment methods</p>
                    <div className="mt-6">
                        <p className="text-sm text-gray-500 font-mulish">Default Card</p>
                        <p className="font-semibold text-gray-800 font-mulish tracking-widest">Visa ending in 1234</p>
                    </div>
                </div>
                 <Button variant="outline" className="border-[#F6D0FE]  font-mulish text-[#9F1AB1] hover:bg-[#FDF2FF] bg-[#FEFAFF] hover:text-[#9F1AB1] leading-[150%]" onClick={() => setIsEditingPayment(true)}>
                  Change
                  <Pencil className="ml-2 size-4" />
                </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
