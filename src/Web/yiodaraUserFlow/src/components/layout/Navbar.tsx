import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Logo from "../../assets/logo.svg";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, currentUser, logout } = useAuth();

  const getInitials = (
    fullName?: string,
    userName?: string,
    email?: string
  ): string => {
    if (fullName) {
      const parts = fullName.split(" ").filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      if (parts.length === 1 && parts[0].length > 1) {
        return parts[0].substring(0, 2).toUpperCase();
      }
      if (parts.length === 1) {
        return parts[0][0].toUpperCase();
      }
    }
    if (userName) {
      if (userName.length > 1) {
        return userName.substring(0, 2).toUpperCase();
      }
      return userName[0].toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "Y";
  };

  const initials = getInitials(
    currentUser?.fullName,
    currentUser?.userName,
    currentUser?.email
  );

  // Function to check if link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Prevent body scroll when menu is open + auto-close on route change
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  const AuthButtons = () => {
    return isAuthenticated ? (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center space-x-1 md:space-x-2 outline-none hover:opacity-80 transition-opacity">
            {currentUser?.profileImage ? (
              <img
                src={currentUser.profileImage}
                alt={`${
                  currentUser.fullName || currentUser.userName
                }'s profile`}
                className="size-8 rounded-full object-cover border-2 border-[#9F1AB1]"
                onError={(e) => {
                  // If image fails to load, fallback to initials
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove(
                    "hidden"
                  );
                }}
              />
            ) : null}
            <div
              className={`size-8 rounded-full bg-[#9F1AB1] text-white flex items-center justify-center font-bold text-sm ${
                currentUser?.profileImage ? "hidden" : ""
              }`}
            >
              {initials}
            </div>
            <span className="text-[#667085] text-base font-mulish font-semibold hidden sm:inline">
              {currentUser?.fullName ||
                currentUser?.userName ||
                currentUser?.email}
            </span>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-[200px] animate-in fade-in-0 zoom-in-95 duration-200"
          >
            <DropdownMenuItem className="cursor-pointer group">
              <Link
                to="/account"
                className="flex items-end justify-end w-full group-hover:text-[#9F1AB1] transition-colors"
              >
                <span className="text-[#667085] text-base font-mulish font-semibold group-hover:text-[#9F1AB1] transition-colors">
                  My Account
                </span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer group">
              <Link
                to="/history"
                className="flex items-center justify-end text-center w-full group-hover:text-[#9F1AB1] transition-colors"
              >
                <span className="text-[#667085] text-base font-mulish font-semibold group-hover:text-[#9F1AB1] transition-colors">
                  Donation History
                </span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer group" onClick={logout}>
              <div className="flex items-center justify-end w-full text-[#667085] hover:text-red-600 transition-colors">
                <LogOut className="mr-2 h-4 w-4" />
                <span className="text-base font-mulish font-semibold">
                  Logout
                </span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    ) : (
      <div className="flex items-center space-x-2 sm:space-x-4">
        <Link to="/login">
          <Button
            variant="outline"
            className="border-[#9F1AB1] text-[#9F1AB1] text-xs sm:text-sm px-2 sm:px-4"
          >
            Login
          </Button>
        </Link>
        <Link to="/signup">
          <Button className="bg-[#9F1AB1] text-white text-xs sm:text-sm px-2 sm:px-4">
            Sign Up
          </Button>
        </Link>
      </div>
    );
  };

  // if it's active, add the active class
  const NavLink = ({
    to,
    children,
    mobile = false,
  }: {
    to: string;
    children: React.ReactNode;
    mobile?: boolean;
  }) => {
    const active = isActive(to);

    return (
      <Link
        to={to}
        className={`relative transition-colors text-base
          ${
            active ? "text-[#9F1AB1] font-bold" : "text-[#667085] font-semibold"
          }
          ${
            active && !mobile
              ? 'after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#9F1AB1]'
              : ""
          }
          ${mobile ? "text-lg py-3 block" : ""}
        `}
        onClick={mobile ? closeMenu : undefined}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav className="w-full font-mulish border-b sticky top-0 z-50 bg-white transition-all duration-300 ease-in-out">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-4 md:py-7">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img src={Logo} alt="Yiodara Logo" className="h-12 w-12" />
            <span className="text-lg font-[900] text-[#667085]">Yiodara</span>
          </Link>

          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/about">About Us</NavLink>
            <NavLink to="/campaigns">Campaigns</NavLink>
            <NavLink to="/contributors">Star Contributor</NavLink>
            <NavLink to="/partner">Partner with Us</NavLink>
            <NavLink to="/volunteers">Volunteers</NavLink>
          </div>

          <div className="flex items-center md:space-x-4">
            <AuthButtons />

            <button
              className="lg:hidden relative text-[#667085] focus:outline-none p-3 rounded-2xl hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 active:scale-95 group"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              <div className="relative w-6 h-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                      isMenuOpen
                        ? "rotate-180 scale-0 opacity-0"
                        : "rotate-0 scale-100 opacity-100"
                    }`}
                  >
                    <Menu size={24} className="drop-shadow-sm" />
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                      isMenuOpen
                        ? "rotate-0 scale-100 opacity-100"
                        : "rotate-180 scale-0 opacity-0"
                    }`}
                  >
                    <X size={24} className="drop-shadow-sm" />
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div
        className={`lg:hidden fixed inset-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isMenuOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isMenuOpen
              ? "opacity-100 backdrop-blur-md"
              : "opacity-0 backdrop-blur-none"
          }`}
          onClick={closeMenu}
        />

        <div
          className={`absolute right-4 top-4 bottom-4 w-80 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
            isMenuOpen
              ? "translate-x-0 scale-100 opacity-100"
              : "translate-x-full scale-95 opacity-0"
          }`}
        >
          <div className="relative p-6 border-b border-gray-100/50 bg-gradient-to-r from-[#9F1AB1]/5 to-purple-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src={Logo} alt="Yiodara Logo" className="h-10 w-10" />
                <div>
                  <span className="text-lg font-black text-[#9F1AB1]">
                    Yiodara
                  </span>
                  <p className="text-xs text-gray-500 font-medium">
                    Charity Platform
                  </p>
                </div>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 focus:outline-none p-2 hover:bg-gray-100 rounded-2xl transition-all duration-200 active:scale-90 group"
                onClick={closeMenu}
                aria-label="Close menu"
              >
                <X
                  size={20}
                  className="group-hover:rotate-90 transition-transform duration-300"
                />
              </button>
            </div>
          </div>

          <div className="px-6 py-4 space-y-1 flex-1 overflow-y-auto pb-6">
            {[
              { to: "/", label: "Home", icon: "🏠" },
              { to: "/about", label: "About Us", icon: "💡" },
              { to: "/campaigns", label: "Campaigns", icon: "🎯" },
              { to: "/contributors", label: "Star Contributors", icon: "⭐" },
              { to: "/partner", label: "Partner with Us", icon: "🤝" },
              { to: "/volunteers", label: "Volunteers", icon: "❤️" },
            ].map((link, index) => {
              const active = isActive(link.to);
              return (
                <div
                  key={link.to}
                  className={`transform transition-all duration-300 ease-out ${
                    isMenuOpen
                      ? "translate-x-0 opacity-100"
                      : "translate-x-8 opacity-0"
                  }`}
                  style={{
                    transitionDelay: isMenuOpen
                      ? `${index * 50 + 100}ms`
                      : "0ms",
                  }}
                >
                  <Link
                    to={link.to}
                    onClick={closeMenu}
                    className={`group flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                      active
                        ? "bg-gradient-to-r from-[#9F1AB1]/10 to-purple-50 border-l-4 border-[#9F1AB1] text-[#9F1AB1] shadow-sm"
                        : "text-gray-700 hover:bg-gray-50 hover:text-[#9F1AB1]"
                    }`}
                  >
                    <span className="text-xl group-hover:scale-105 transition-transform duration-200">
                      {link.icon}
                    </span>
                    <span className="font-semibold text-base group-hover:translate-x-0.5 transition-transform duration-200">
                      {link.label}
                    </span>
                    {active && (
                      <div className="ml-auto">
                        <div className="w-2 h-2 bg-[#9F1AB1] rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>

          {isAuthenticated && (
            <div
              className={`p-6 border-t border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-purple-50/30 transform transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isMenuOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: isMenuOpen ? "400ms" : "0ms" }}
            >
              <div className="flex items-center space-x-3 mb-4 p-3 bg-white/60 rounded-2xl border border-white/50">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#9F1AB1] to-[#B845C7] flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">
                    {initials}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Signed in as
                  </p>
                  <p className="text-sm font-bold text-[#9F1AB1] truncate">
                    {currentUser?.userName ||
                      currentUser?.fullName ||
                      currentUser?.email}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Link to="/account" onClick={closeMenu}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-600 hover:text-[#9F1AB1] hover:bg-purple-50 rounded-2xl h-11 font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    <span className="mr-3">👤</span> My Account
                  </Button>
                </Link>
                <Link to="/history" onClick={closeMenu}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-600 hover:text-[#9F1AB1] hover:bg-purple-50 rounded-2xl h-11 font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    <span className="mr-3">📋</span> Donation History
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl h-11 font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
