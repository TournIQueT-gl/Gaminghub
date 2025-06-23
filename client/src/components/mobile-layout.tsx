import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './sidebar';
import Header from './header';

interface MobileLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function MobileLayout({ children, title }: MobileLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (sidebarOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen, isMobile]);

  return (
    <div className="min-h-screen bg-gaming-dark">
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-gaming-darker border-r border-gaming-card-hover z-50
        transform transition-transform duration-300 ease-out
        ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
      `}>
        <Sidebar onItemClick={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className={`min-h-screen flex flex-col ${!isMobile ? 'ml-64' : ''}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-gaming-card/95 backdrop-blur border-b border-gaming-card-hover">
          <div className="flex items-center h-16 px-4">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="mr-3 p-2 rounded-md text-gaming-text hover:bg-gaming-card-hover"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            
            <div className="flex-1 min-w-0">
              <Header title={title} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}