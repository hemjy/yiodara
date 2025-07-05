import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Pencil, UserPlus } from "lucide-react";
import { authService } from "@/api/services/authService";

const Account = () => {
    useEffect(()=>{
    window.scrollTo(0,0)
  },[])
  const { user: currentUser, changePassword } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
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

  // State for creating a new admin
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    fullName: '',
    userName: '',
    email: '',
    password: '',
  });
  const [newAdminErrors, setNewAdminErrors] = useState({
    fullName: '',
    userName: '',
    email: '',
    password: '',
  });
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);
  const [newAdminPasswordVisible, setNewAdminPasswordVisible] = useState(false);

  const userName = currentUser?.userName || (currentUser?.email ? currentUser.email.split('@')[0] : '');

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

  const handleNewAdminInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAdminData(prev => ({ ...prev, [name]: value }));
    if (newAdminErrors[name as keyof typeof newAdminErrors]) {
        setNewAdminErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = { fullName: '', userName: '', email: '', password: '' };

    if (!newAdminData.fullName) errors.fullName = 'Full Name is required.';
    if (!newAdminData.userName) errors.userName = 'Username is required.';
    if (!newAdminData.email) errors.email = 'Email is required.';
    
    // Password validation
    if (!newAdminData.password) {
      errors.password = 'Password is required.';
    } else if (newAdminData.password.length < 8) {
      errors.password = 'Passwords must be at least 8 characters.';
    } else if (!/[^a-zA-Z0-9]/.test(newAdminData.password)) {
        errors.password = "Passwords must have at least one non alphanumeric character.";
    } else if (!/\d/.test(newAdminData.password)) {
        errors.password = "Passwords must have at least one digit ('0'-'9').";
    } else if (!/[A-Z]/.test(newAdminData.password)) {
        errors.password = "Passwords must have at least one uppercase ('A'-'Z').";
    }

    if (Object.values(errors).some(e => e)) {
      setNewAdminErrors(errors);
      return;
    }
    
    setIsSubmittingAdmin(true);
    try {
      const response = await authService.signup(newAdminData);
      if (response.succeeded) {
        toast({
          title: "Admin Created",
          description: "New admin user has been created successfully.",
        });
        setIsCreatingAdmin(false);
        setNewAdminData({ fullName: '', userName: '', email: '', password: '' });
      } else {
        toast({
          title: "Creation Failed",
          description: response.message || "An error occurred.",
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
      setIsSubmittingAdmin(false);
    }
  };

  return (
    <div className=" py-8">
      <div className="relative text-center mt-10 mb-12 md:mt-[20px] md:mb-[75px]">
        <h1 className="absolute w-full text-5xl md:text-8xl font-black font-raleway leading-tight md:leading-[144px] text-[#F6D0FE] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          PROFILE SETTINGS
        </h1>
        <h2 className="relative text-lg md:text-[24px] leading-tight md:leading-[36px] font-extrabold font-raleway text-[#9F1AB1] z-10">
          PROFILE SETTINGS
        </h2>
      </div>

      <div className="bg-[#F9FAFB] p-4 md:p-6 mb-8 border-[1.5px] border-[#EAECF0]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
          <div className="flex items-center gap-4 font-raleway w-full">
            <div className="relative">
              <div className="size-12 md:size-16 rounded-full bg-[#FBE8FF] flex items-center justify-center flex-shrink-0">
                
                  <span className="text-[#9F1AB1] text-xl md:text-2xl font-extrabold">
                    {(currentUser?.fullName)?.charAt(0).toUpperCase() || "A"}
                  </span>
                
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
                
                  <span className="text-[#000000] font-bold text-sm md:text-[16px] leading-tight md:leading-[18px]">
                    {userName}
                  </span>
                
              </div>
              <div className="flex flex-row md:items-center gap-2 font-raleway">
                <span className="text-[#101828] font-normal text-sm md:text-[16px] leading-tight md:leading-[18px]">
                  Email Address:
                </span>
                
                  <span className="text-[#000000] font-bold text-sm md:text-[16px] leading-tight md:leading-[18px] truncate">
                    {currentUser?.email}
                  </span>
                
              </div>
            </div>
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
                    <Input id="username" type="text" defaultValue={userName} disabled />
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
                  <p className="text-[#101828] text-[16px] font-raleway font-bold">{userName}</p>
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

        {/* Create Admin Section */}
        <div className="bg-white p-4 md:p-8 border rounded-lg">
          {isCreatingAdmin ? (
            <>
              <h3 className="text-xl md:text-2xl font-bold font-raleway mb-6">Create New Admin</h3>
              <form className="space-y-6" onSubmit={handleCreateAdmin}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="newAdminFullName">Full Name</label>
                    <Input id="newAdminFullName" name="fullName" value={newAdminData.fullName} onChange={handleNewAdminInputChange} />
                    {newAdminErrors.fullName && <p className="text-red-500 text-sm mt-1">{newAdminErrors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="newAdminUserName">Username</label>
                    <Input id="newAdminUserName" name="userName" value={newAdminData.userName} onChange={handleNewAdminInputChange} />
                     {newAdminErrors.userName && <p className="text-red-500 text-sm mt-1">{newAdminErrors.userName}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="newAdminEmail">Email Address</label>
                  <Input id="newAdminEmail" name="email" type="email" value={newAdminData.email} onChange={handleNewAdminInputChange} />
                  {newAdminErrors.email && <p className="text-red-500 text-sm mt-1">{newAdminErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="newAdminPassword">Password</label>
                  <div className="relative">
                    <Input 
                      id="newAdminPassword" 
                      name="password" 
                      type={newAdminPasswordVisible ? "text" : "password"} 
                      value={newAdminData.password} 
                      onChange={handleNewAdminInputChange} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setNewAdminPasswordVisible(!newAdminPasswordVisible)} 
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {newAdminPasswordVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5"/>}
                    </button>
                  </div>
                  {newAdminErrors.password && <p className="text-red-500 text-sm mt-1">{newAdminErrors.password}</p>}
                </div>
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreatingAdmin(false)} disabled={isSubmittingAdmin}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#9F1AB1] hover:bg-[#8f179f]" disabled={isSubmittingAdmin}>
                    {isSubmittingAdmin ? 'Creating...' : 'Create Admin'}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl md:text-2xl font-bold font-raleway">Admin User Management</h3>
                <p className="text-sm text-[#98A2B3] font-mulish mt-1">Create new admin credentials here.</p>
              </div>
              <Button variant="outline" className="border-[#F6D0FE] font-mulish text-[#9F1AB1] hover:bg-[#FDF2FF] bg-[#FEFAFF] hover:text-[#9F1AB1] leading-[150%]" onClick={() => setIsCreatingAdmin(true)}>
                Create New Admin
                <UserPlus className="ml-2 size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;