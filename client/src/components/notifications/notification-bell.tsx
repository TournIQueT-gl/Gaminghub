import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Bell,
  Check,
  Archive,
  Trash2,
  Settings,
  Users,
  Trophy,
  Heart,
  MessageCircle,
  Crown,
  Star,
  Gamepad2,
  AlertCircle,
  ChevronRight,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function NotificationBell() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");

  // Unread count query
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['/api/notifications/unread-count'],
    queryFn: async () => {
      const response = await fetch('/api/notifications/unread-count');
      if (!response.ok) throw new Error('Failed to fetch unread count');
      const data = await response.json();
      return data.count;
    },
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Notifications query
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['/api/notifications', { category: activeTab === 'all' ? undefined : activeTab }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.append('category', activeTab);
      params.append('limit', '20');

      const response = await fetch(`/api/notifications?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await apiRequest('PATCH', `/api/notifications/${notificationId}/read`);
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async (category?: string) => {
      const response = await apiRequest('PATCH', '/api/notifications/read-all', { category });
      if (!response.ok) throw new Error('Failed to mark all as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      toast({ title: "All notifications marked as read" });
    },
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await apiRequest('PATCH', `/api/notifications/${notificationId}/archive`);
      if (!response.ok) throw new Error('Failed to archive notification');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await apiRequest('DELETE', `/api/notifications/${notificationId}`);
      if (!response.ok) throw new Error('Failed to delete notification');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow': return <Users className="w-4 h-4 text-gaming-blue" />;
      case 'like': return <Heart className="w-4 h-4 text-red-400" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-gaming-emerald" />;
      case 'friend_request': return <Users className="w-4 h-4 text-gaming-purple" />;
      case 'tournament': return <Trophy className="w-4 h-4 text-yellow-400" />;
      case 'clan': return <Crown className="w-4 h-4 text-gaming-blue" />;
      case 'achievement': return <Star className="w-4 h-4 text-yellow-400" />;
      case 'message': return <MessageCircle className="w-4 h-4 text-gaming-blue" />;
      case 'gaming': return <Gamepad2 className="w-4 h-4 text-gaming-purple" />;
      case 'system': return <AlertCircle className="w-4 h-4 text-gaming-text-dim" />;
      default: return <Bell className="w-4 h-4 text-gaming-text-dim" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'normal': return 'border-l-gaming-blue';
      case 'low': return 'border-l-gaming-text-dim';
      default: return 'border-l-gaming-card-hover';
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return notificationDate.toLocaleDateString();
  };

  const handleNotificationClick = async (notification: any) => {
    // Mark as read if unread
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate to action URL if provided
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleMarkAllAsRead = () => {
    const category = activeTab === 'all' ? undefined : activeTab;
    markAllAsReadMutation.mutate(category);
  };

  if (!isAuthenticated) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-96 p-0 bg-gaming-card border-gaming-card-hover" 
        align="end"
      >
        <div className="p-4 border-b border-gaming-card-hover">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsReadMutation.isPending}
                  className="text-xs"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-transparent border-b border-gaming-card-hover rounded-none h-auto p-0">
            <TabsTrigger value="all" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-gaming-blue">
              All
            </TabsTrigger>
            <TabsTrigger value="social" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-gaming-blue">
              Social
            </TabsTrigger>
            <TabsTrigger value="gaming" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-gaming-blue">
              Gaming
            </TabsTrigger>
            <TabsTrigger value="system" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-gaming-blue">
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="p-0 m-0">
            <ScrollArea className="h-96">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-start gap-3 animate-pulse">
                      <div className="w-8 h-8 bg-gaming-darker rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gaming-darker rounded w-3/4" />
                        <div className="h-2 bg-gaming-darker rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gaming-text-dim" />
                  <p className="text-gaming-text-dim">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gaming-card-hover">
                  {notifications.map((notification: any) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gaming-darker/50 cursor-pointer border-l-2 ${getPriorityColor(notification.priority)} ${
                        !notification.isRead ? 'bg-gaming-blue/5' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gaming-darker rounded-lg flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${notification.isRead ? 'text-gaming-text-dim' : 'text-white'}`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gaming-text-dim mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gaming-text-dim mt-2">
                                {formatTimeAgo(notification.createdAt)}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-1 ml-2">
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-gaming-blue rounded-full" />
                              )}
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <MoreHorizontal className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-gaming-card border-gaming-card-hover">
                                  {!notification.isRead && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markAsReadMutation.mutate(notification.id);
                                      }}
                                    >
                                      <Check className="w-3 h-3 mr-2" />
                                      Mark as read
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      archiveMutation.mutate(notification.id);
                                    }}
                                  >
                                    <Archive className="w-3 h-3 mr-2" />
                                    Archive
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteMutation.mutate(notification.id);
                                    }}
                                    className="text-red-400"
                                  >
                                    <Trash2 className="w-3 h-3 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              
                              {notification.actionUrl && (
                                <ChevronRight className="w-3 h-3 text-gaming-text-dim" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {notifications.length > 0 && (
          <div className="p-3 border-t border-gaming-card-hover">
            <Button variant="ghost" className="w-full text-sm text-gaming-blue hover:text-white">
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}