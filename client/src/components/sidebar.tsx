import { Home, Trophy, Users, MessageCircle, User, Settings, Gamepad2, Compass } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, isAuthenticated, login } = useAuth();

  const { data: clanMembership } = useQuery({
    queryKey: ['/api/users/clan-membership'],
    enabled: !!user,
    retry: false,
  });

  const navItems = [
    { icon: Home, label: "Feed", path: "/", active: location === "/" },
    { icon: Trophy, label: "Tournaments", path: "/tournaments", active: location === "/tournaments" },
    { icon: Users, label: "Clans", path: "/clans", active: location === "/clans" },
    { icon: Compass, label: "Discover", path: "/discover", active: location === "/discover" },
    { icon: Gamepad2, label: "Gaming", path: "/gaming", active: location === "/gaming" },
    ...(isAuthenticated ? [
      { icon: MessageCircle, label: "Messages", path: "/messages", active: location === "/messages" },
      { icon: User, label: "Profile", path: "/profile", active: location.startsWith("/profile") },
      { icon: Settings, label: "Settings", path: "/settings", active: location === "/settings" },
    ] : [])
  ];

  return (
    <div className="w-64 bg-gaming-darker border-r border-gaming-card flex flex-col fixed h-full z-10">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gaming-card">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 gaming-gradient rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM4 7h16v11H4zm1-3h2l1 2H4zm12 0h2l1 2h-3z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">GamingX</h1>
            <p className="text-xs text-gaming-text-dim">Pro Gaming Social</p>
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-gaming-card">
        {isAuthenticated ? (
          <div className="flex items-center space-x-3">
            <img 
              src={user?.profileImageUrl || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
              alt="User avatar" 
              className="w-12 h-12 rounded-lg object-cover border-2 border-gaming-blue"
            />
            <div>
              <h3 className="font-semibold text-white">{user?.username || user?.firstName || 'Gamer'}</h3>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gaming-emerald rounded-full"></div>
                <span className="text-xs text-gaming-text-dim">Online</span>
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <span className="text-xs text-gaming-text-dim">Level</span>
                <span className="text-xs font-mono text-gaming-blue">{user?.level || 1}</span>
                <div className="flex-1 bg-gaming-card rounded-full h-1 ml-2">
                  <div className="bg-gaming-blue h-1 rounded-full w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-12 h-12 bg-gaming-blue/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6 text-gaming-blue" />
            </div>
            <h3 className="font-semibold text-white mb-1">Guest Mode</h3>
            <p className="text-xs text-gaming-text-dim mb-3">Limited access - Sign in to unlock all features</p>
            <button 
              onClick={login}
              className="w-full bg-gradient-to-r from-gaming-blue to-gaming-purple text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-gaming-blue/80 hover:to-gaming-purple/80 transition-colors"
            >
              Sign In
            </button>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all cursor-pointer ${
              item.active 
                ? 'bg-gaming-blue text-white' 
                : 'text-gaming-text-dim hover:text-white hover:bg-gaming-card'
            }`}>
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-gaming-red text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
          </Link>
        ))}
      </nav>

      {/* Clan Quick Access */}
      {clanMembership && (
        <div className="p-4 border-t border-gaming-card">
          <h4 className="text-sm font-semibold text-gaming-text-dim mb-3">MY CLAN</h4>
          <div className="bg-gaming-card rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 clan-badge rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11H14.4C14.4,12.1 13.5,13 12.4,13H11.6C10.5,13 9.6,12.1 9.6,11H9.2V10C9.2,8.6 10.6,7 12,7Z" />
                </svg>
              </div>
              <div>
                <h5 className="font-semibold text-white text-sm">{clanMembership?.clan?.name || 'Elite Esports'}</h5>
                <p className="text-xs text-gaming-text-dim">{clanMembership?.role || 'Member'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
