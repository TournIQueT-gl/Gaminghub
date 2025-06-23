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
      // Auto-close sidebar on mobile when screen is resized
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen, isMobile]);

  return (
    <div className="responsive-container min-h-screen bg-gaming-dark text-gaming-text">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-gaming-darker border-r border-gaming-card-hover z-50 transform transition-transform duration-300 ease-in-out
        ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
      `}>
        <Sidebar onItemClick={() => isMobile && setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <div className={`min-h-screen flex flex-col ${!isMobile ? 'ml-64' : ''}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-gaming-card border-b border-gaming-card-hover">
          <div className="flex items-center px-4 py-3">
            {/* Mobile menu button */}
            {isMobile && (
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-3 p-2 rounded-lg bg-gaming-darker border border-gaming-card-hover text-white hover:bg-gaming-card transition-colors touch-target"
                aria-label="Toggle menu"
                type="button"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
            
            <div className="flex-1 min-w-0">
              <Header title={title} />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}