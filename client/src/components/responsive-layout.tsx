import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './sidebar';
import Header from './header';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function ResponsiveLayout({ children, title }: ResponsiveLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  return (
    <div className="mobile-container min-h-screen bg-gaming-dark text-gaming-text">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-72 sm:w-64 bg-gaming-darker border-r border-gaming-card-hover z-50 transform transition-transform duration-300
        ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
      `}>
        <Sidebar onItemClick={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className={`flex flex-col min-h-screen ${!isMobile ? 'ml-64' : ''}`}>
        {/* Header */}
        <div className="sticky top-0 z-30 bg-gaming-card border-b border-gaming-card-hover">
          <div className="flex items-center p-3 sm:p-4">
            {/* Mobile menu button */}
            {isMobile && (
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-3 p-2 rounded-lg bg-gaming-darker border border-gaming-card-hover text-white hover:bg-gaming-card transition-colors touch-manipulation"
                aria-label="Toggle menu"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
            
            <div className="flex-1 min-w-0">
              <Header title={title} />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}