import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Search, 
  UserPlus, 
  UserMinus, 
  Crown,
  Shield,
  Star,
  MessageCircle
} from "lucide-react";

interface User {
  id: string;
  username: string;
  email: string;
  profileImageUrl?: string;
  isVerified?: boolean;
  level?: number;
  followersCount?: number;
  isFollowing?: boolean;
}

interface ProfileFollowersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  initialTab?: 'followers' | 'following';
}

export default function ProfileFollowersModal({ 
  open, 
  onOpenChange, 
  userId, 
  initialTab = 'followers' 
}: ProfileFollowersModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(initialTab);
  const { toast } = useToast();

  // Mock data for followers and following
  const mockUsers: User[] = [
    {
      id: "user1",
      username: "GamerPro123",
      email: "gamer@example.com",
      profileImageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
      isVerified: true,
      level: 25,
      followersCount: 1540,
      isFollowing: false
    },
    {
      id: "user2", 
      username: "EsportsLegend",
      email: "legend@example.com",
      profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      isVerified: true,
      level: 42,
      followersCount: 8920,
      isFollowing: true
    },
    {
      id: "user3",
      username: "StreamQueen",
      email: "queen@example.com",
      profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b6fa9e16?w=100&h=100&fit=crop&crop=face",
      level: 18,
      followersCount: 3200,
      isFollowing: false
    },
    {
      id: "user4",
      username: "TechNinja",
      email: "ninja@example.com",
      level: 33,
      followersCount: 950,
      isFollowing: true
    },
    {
      id: "user5",
      username: "PixelMaster",
      email: "pixel@example.com",
      profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      level: 21,
      followersCount: 670,
      isFollowing: false
    }
  ];

  const { data: followers, isLoading: followersLoading } = useQuery({
    queryKey: [`/api/users/${userId}/followers`],
    enabled: !!userId && open && activeTab === 'followers',
    retry: false,
  });

  const { data: following, isLoading: followingLoading } = useQuery({
    queryKey: [`/api/users/${userId}/following`],
    enabled: !!userId && open && activeTab === 'following',
    retry: false,
  });

  const followMutation = useMutation({
    mutationFn: async ({ targetUserId, action }: { targetUserId: string, action: 'follow' | 'unfollow' }) => {
      const response = await apiRequest('POST', `/api/users/${targetUserId}/${action}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/followers`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/following`] });
      toast({
        title: "Success",
        description: "Follow status updated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update follow status",
        variant: "destructive",
      });
    },
  });

  const handleFollowToggle = (targetUserId: string, isCurrentlyFollowing: boolean) => {
    followMutation.mutate({
      targetUserId,
      action: isCurrentlyFollowing ? 'unfollow' : 'follow'
    });
  };

  const filteredUsers = (activeTab === 'followers' ? followers || mockUsers : following || mockUsers)
    .filter(user => 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const UserCard = ({ user }: { user: User }) => (
    <div className="flex items-center justify-between p-4 bg-gaming-darker rounded-lg hover:bg-gaming-card-hover transition-colors">
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={user.profileImageUrl} />
          <AvatarFallback className="bg-gaming-card text-white">
            {user.username[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-white font-medium">{user.username}</h4>
            {user.isVerified && (
              <Shield className="w-4 h-4 text-gaming-blue" />
            )}
            {user.level && user.level >= 30 && (
              <Crown className="w-4 h-4 text-gaming-gold" />
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-gaming-text-dim">
            <span>Level {user.level}</span>
            <span>•</span>
            <span>{user.followersCount?.toLocaleString()} followers</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-gaming-text-dim hover:text-white"
        >
          <MessageCircle className="w-4 h-4" />
        </Button>
        
        <Button
          onClick={() => handleFollowToggle(user.id, user.isFollowing || false)}
          disabled={followMutation.isPending}
          size="sm"
          className={`${
            user.isFollowing 
              ? 'bg-gaming-card border border-gaming-card-hover text-white hover:bg-red-500/20 hover:border-red-500 hover:text-red-400' 
              : 'bg-gaming-purple hover:bg-purple-600 text-white'
          }`}
        >
          {user.isFollowing ? (
            <>
              <UserMinus className="w-4 h-4 mr-1" />
              Unfollow
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-1" />
              Follow
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-gaming-card border-gaming-card-hover">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Connections
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gaming-darker">
            <TabsTrigger value="followers" className="data-[state=active]:bg-gaming-card">
              Followers
            </TabsTrigger>
            <TabsTrigger value="following" className="data-[state=active]:bg-gaming-card">
              Following
            </TabsTrigger>
          </TabsList>

          {/* Search Bar */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gaming-text-dim w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gaming-darker border-gaming-card-hover text-white"
            />
          </div>

          <TabsContent value="followers" className="mt-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {followersLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center gap-3 p-4 bg-gaming-darker rounded-lg">
                      <div className="w-12 h-12 bg-gaming-card rounded-full" />
                      <div className="flex-1">
                        <div className="h-4 bg-gaming-card rounded w-32 mb-2" />
                        <div className="h-3 bg-gaming-card rounded w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))
              ) : (
                <div className="text-center py-8 text-gaming-text-dim">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No followers found</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="following" className="mt-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {followingLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center gap-3 p-4 bg-gaming-darker rounded-lg">
                      <div className="w-12 h-12 bg-gaming-card rounded-full" />
                      <div className="flex-1">
                        <div className="h-4 bg-gaming-card rounded w-32 mb-2" />
                        <div className="h-3 bg-gaming-card rounded w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))
              ) : (
                <div className="text-center py-8 text-gaming-text-dim">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Not following anyone yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Stats */}
        <div className="border-t border-gaming-card-hover pt-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-white">{mockUsers.length}</div>
              <div className="text-sm text-gaming-text-dim">Followers</div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">{mockUsers.filter(u => u.isFollowing).length}</div>
              <div className="text-sm text-gaming-text-dim">Following</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}