import React, { useState, useEffect } from "react";
import { Search, Plus, User, Bell, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

const getInitials = (name: string) => {
  if (!name) return 'A';
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const DashboardHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const isDashboard = location.pathname === "/";
  
  const currentPath = location.pathname.split('/')[1] || 'campaigns';
  
  // Update search term when URL changes (in case the user navigates directly to a search URL)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
    } else {
      setSearchTerm("");
    }
  }, [location]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      // Navigate to the current page with search query
      navigate(`/${currentPath}?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleSearchSubmit = () => {
    if (searchTerm.trim()) {
      // Navigate to the current page with search query
      navigate(`/${currentPath}?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleNewButtonClick = () => {
    if (location.pathname === '/events') {
      navigate('/create-event');
    } else {
      navigate("/create-campaign");
    }
  };

  return (
    <header className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-[#FDF4FF] px-3 py-3 sm:px-4 sm:py-3 md:px-6 md:py-[25px] w-full gap-3 sm:gap-0">
      {!isDashboard && (
        <div className="relative flex-1 max-w-full sm:max-w-md sm:mr-4 order-2 sm:order-1">
          <input
            type="text"
            placeholder={`Search ${currentPath}...`}
            value={searchTerm}
            onChange={handleSearch}
            onKeyDown={handleKeyPress}
            className="w-full pl-3 sm:pl-4 pr-10 py-2 bg-[#FBE8FF] rounded-lg text-sm sm:text-base
            focus:outline-none focus:ring-2 focus:ring-[#BA24D5] focus:ring-opacity-50
            placeholder:text-[#E478FA] placeholder:text-sm sm:placeholder:text-base
            transition duration-300"
          />
          <button
            onClick={handleSearchSubmit}
            className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-[#E478FA] cursor-pointer hover:text-[#BA24D5] transition-colors"
          >
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      )}

      {isDashboard && (
        <div className="flex-1 order-2 sm:order-1" />
      )}

      {/* Action Buttons - Stack on mobile, horizontal on desktop */}
      <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4 order-1 sm:order-2">
        <button
          onClick={handleNewButtonClick}
          className="bg-[#9F1AB1] hover:bg-[#8A1799] text-white text-xs sm:text-sm md:text-base 
          px-3 py-2 sm:px-4 sm:py-2 md:px-4 md:py-2 
          flex items-center gap-1 sm:gap-2 rounded-md sm:rounded
          transition duration-300 shadow-sm hover:shadow-md
          flex-shrink-0 min-w-0"
        >
          <span className="truncate">{location.pathname === '/events' ? 'Create Event' : 'New Campaign'}</span>
          <Plus className="size-3 sm:size-4 md:size-5 flex-shrink-0" />
        </button>

        <div className="hidden sm:block border-[1px] border-[#F6D0FE] h-8 md:h-10"></div>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center space-x-1 sm:space-x-2 min-w-0 flex-shrink-0 outline-none">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex-shrink-0 bg-[#BA24D5] rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user && getInitials(user.fullName)}
            </div>
            <span className="text-[#BA24D5] text-sm sm:text-base font-medium truncate max-w-[80px] sm:max-w-none hidden md:inline">
              {user?.fullName || "Admin"}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuItem asChild>
              <Link to="/account" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span className="text-[#667085] text-base font-mulish font-semibold group-hover:text-[#9F1AB1] transition-colors">My Account</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/notifications" className="cursor-pointer">
                <Bell className="mr-2 h-4 w-4"/>
                <span className="text-[#667085] text-base font-mulish font-semibold group-hover:text-[#9F1AB1] transition-colors">Notifications</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer text-base font-mulish font-semibold text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;
