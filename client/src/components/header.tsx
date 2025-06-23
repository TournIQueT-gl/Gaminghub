import React, { useState } from "react";
import { Search, Bell, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import NotificationBell from "@/components/notifications/notification-bell";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { user, logout, isAuthenticated, login } = useAuth();
  const [searchVisible, setSearchVisible] = useState(false);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-white truncate">{title}</h1>
          <div className="hidden lg:flex items-center space-x-2">
            <span className="text-xs text-gaming-text-dim">Live:</span>
            <span className="text-xs font-mono text-gaming-emerald">1,247</span>
            <div className="w-1.5 h-1.5 bg-gaming-emerald rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Search Toggle for Mobile */}
          <button 
            onClick={() => setSearchVisible(!searchVisible)}
            className="md:hidden p-2 rounded-lg text-gaming-text-dim hover:text-white transition-colors touch-target"
            aria-label="Search"
            type="button"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Desktop Search Bar */}
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gaming-text-dim pointer-events-none" />
            <Input
              placeholder="Search posts, users..."
              className="bg-gaming-card border-gaming-card-hover rounded-lg pl-10 w-48 lg:w-64 text-sm focus:border-gaming-blue transition-colors"
            />
          </div>

          {/* Notifications */}
          <NotificationBell />

          {/* User Menu */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gaming-card">
                  <img 
                    src={user?.profileImageUrl || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40"} 
                    alt="User menu" 
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gaming-card border-gaming-card-hover">
              <DropdownMenuItem asChild className="text-white hover:bg-gaming-card-hover">
                <Link href="/profile">
                  <User className="w-4 h-4 mr-2" />
                  View Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-white hover:bg-gaming-card-hover">
                <Link href="/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="border-gaming-card-hover" />
              <DropdownMenuItem 
                onClick={() => logout()}
                className="text-red-400 hover:bg-gaming-card-hover cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          ) : (
            <Button 
              onClick={login}
              className="bg-gradient-to-r from-gaming-blue to-gaming-purple hover:from-gaming-blue/80 hover:to-gaming-purple/80"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile Search Bar */}
      {searchVisible && (
        <div className="mt-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gaming-text-dim pointer-events-none" />
            <Input
              placeholder="Search posts, users, tournaments..."
              className="bg-gaming-card border-gaming-card-hover rounded-lg pl-10 w-full text-sm focus:border-gaming-blue transition-colors touch-target"
            />
          </div>
        </div>
      )}
    </div>
  );
}
