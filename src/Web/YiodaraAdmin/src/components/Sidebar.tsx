import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Users,
  Flag,
  LogOut,
  Menu,
  FolderIcon,
  Calendar,
} from 'lucide-react';
import partnershipIcon from "../assets/partnership.svg";
import VolunteersIcon from "../assets/Volunteers.svg"

interface SidebarProps {
  isMobile: boolean;
  isCollapsed: boolean;
  isOpen: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

// Create a wrapper component for your SVG
const PartnershipIcon: React.FC<{ className?: string }> = ({ className }) => (
  <img src={partnershipIcon} alt="Partnership" className={className} />
);
const VolunteersIconComponent: React.FC<{ className?: string }> = ({ className }) => (
  <img src={VolunteersIcon} alt="Volunteers" className={className} />
);

const Sidebar: React.FC<SidebarProps> = ({ 
  isMobile, 
  isCollapsed, 
  isOpen,
  onClose,
  onToggleCollapse
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems: NavItem[] = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/campaigns', icon: Flag, label: 'Campaigns' },
    { path: '/donors', icon: Users, label: 'Donors' },
    { path: '/partnerships', icon: PartnershipIcon, label: 'Partnerships' },
    { path: '/volunteers', icon: VolunteersIconComponent, label: 'Volunteers' },
    { path: '/campaign-categories', icon: FolderIcon, label: 'Campaign Categories' },
    { path: '/events', icon: Calendar, label: 'Events' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isMobile && !isOpen) {
    return null;
  }

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-[#9F1AB1] flex flex-col transition-all duration-300 z-20
        ${isMobile ? 'w-[237px]' : isCollapsed ? 'w-[70px]' : 'w-[237px]'}`}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          {/* <div className="w-8 h-8 bg-white rounded-full mr-2 flex items-center justify-center">
            <span className="text-[#BA24D5] font-bold">Y</span>
          </div> */}
          {!isCollapsed && (
            <h1 className="text-lg font-bold text-white">Yiodara</h1>
          )}
        </div>
        <button 
          onClick={isMobile ? onClose : onToggleCollapse}
          className="text-white p-1 hover:bg-white/10 rounded"
        >
          <Menu size={20} />
        </button>
      </div>

      <nav className="flex-grow mt-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={isMobile ? onClose : undefined}
              className={`
                flex items-center px-4 py-3 my-4 mx-2 rounded
                ${isActive 
                  ? 'bg-white text-[#BA24D5]' 
                  : 'text-white hover:bg-white/10'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className={`w-5 h-5 ${!isCollapsed && 'mr-3'}`} />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/20 pt-4 pb-6">
        <button 
          onClick={handleLogout}
          className={`
            flex items-center px-4 py-3 mx-2 text-white hover:bg-white/10 rounded
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut className={`w-5 h-5 ${!isCollapsed && 'mr-3'}`} />
          {!isCollapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;