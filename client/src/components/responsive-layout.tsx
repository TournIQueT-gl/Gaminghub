import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Sidebar from "@/components/sidebar";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function ResponsiveLayout({ children, title }: ResponsiveLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gaming-dark text-gaming-text">
        {/* Mobile Header */}
        <div className="bg-gaming-card border-b border-gaming-card-hover px-4 py-3 flex items-center justify-between lg:hidden">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-gaming-darker border-gaming-card-hover">
              <Sidebar />
            </SheetContent>
          </Sheet>
          
          <h1 className="text-xl font-bold text-white">{title}</h1>
          <div className="w-8" /> {/* Spacer for centering */}
        </div>

        {/* Mobile Content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gaming-dark text-gaming-text">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          {/* Desktop Header */}
          <div className="bg-gaming-card border-b border-gaming-card-hover px-6 py-4">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default ResponsiveLayout;