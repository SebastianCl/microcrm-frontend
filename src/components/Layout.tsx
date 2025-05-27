import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from './ui/button';
import { Menu, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useState } from 'react';
import NetworkStatus from './NetworkStatus';
import { ThemeToggle } from './ThemeToggle';

const Layout = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="min-h-screen bg-background flex">
      <div className={`${sidebarOpen ? 'w-64' : 'w-0 md:w-16'} transition-all duration-300 overflow-hidden fixed md:relative h-screen z-40`}>
        <Sidebar collapsed={!sidebarOpen} />
      </div>
      <main className={`flex-1 transition-all duration-300 ${isMobile && sidebarOpen ? 'opacity-50' : ''}`}>
        <div className="container mx-auto py-4 px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleSidebar}
                className={isMobile ? "md:hidden" : ""}
                aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                {isMobile ? (
                  <Menu className="h-5 w-5" />
                ) : sidebarOpen ? (
                  <PanelLeftClose className="h-5 w-5" />
                ) : (
                  <PanelLeft className="h-5 w-5" />
                )}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
          <Outlet />
        </div>
      </main>
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <NetworkStatus />
    </div>
  );
};

export default Layout;
