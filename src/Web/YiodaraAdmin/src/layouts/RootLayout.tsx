import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import DashboardHeader from './DashboardHeader';

const RootLayout: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsCollapsed(width >= 768 && width < 1024);
    };

    // Set initial values
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        isMobile={isMobile} 
        isCollapsed={isCollapsed} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={toggleSidebar}
      />

      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className={`flex-grow transition-all duration-300 ${
        isMobile ? 'ml-0' : (isCollapsed ? 'ml-[70px]' : 'ml-[237px]')
      }`}>
        <header className="sticky top-0 z-10 bg-white border-b">
          <div className="flex items-center h-16 ">
            {isMobile && !sidebarOpen && (
              <button 
                className="p-2 rounded-md text-gray-600 focus:outline-none mr-2" 
                onClick={toggleSidebar}
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            <DashboardHeader />
          </div>
        </header>
        
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RootLayout;