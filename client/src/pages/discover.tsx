import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Trophy,
  Star,
  TrendingUp,
  Clock,
  Heart,
  MessageCircle,
  Share2,
  Crown,
  Gamepad2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Discover() {
  const { user, isAuthenticated, isGuest } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [gameFilter, setGameFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [activeTab, setActiveTab] = useState("discover");
  const { toast } = useToast();

  // Discover users query
  const { data: discoveredUsers = [], isLoading: isLoadingDiscover } = useQuery({
    queryKey: ['/api/discover/users', { game: gameFilter, region: regionFilter, excludeFollowing: true }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (gameFilter) params.append('game', gameFilter);
      if (regionFilter) params.append('region', regionFilter);
      params.append('excludeFollowing', 'true');

      const response = await fetch(`/api/discover/users?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to discover users');
      return response.json();
    },
    enabled: isAuthenticated && activeTab === 'discover',
  });

  // Search users query
  const { data: searchResults = [], isLoading: isLoadingSearch } = useQuery({
    queryKey: ['/api/search/users', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      
      const response = await fetch(`/api/search/users?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Failed to search users');
      return response.json();
    },
    enabled: activeTab === 'search' && searchQuery.length >= 2,
  });

  // Activity feed query
  const { data: activityFeed = [], isLoading: isLoadingActivity } = useQuery({
    queryKey: ['/api/activity/feed'],
    queryFn: async () => {
      const response = await fetch('/api/activity/feed');
      if (!response.ok) throw new Error('Failed to fetch activity feed');
      return response.json();
    },
    enabled: isAuthenticated && activeTab === 'activity',
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Follow user mutation
  const followUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest('POST', `/api/users/${userId}/follow`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to follow user');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/discover/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/search/users'] });
      toast({ title: "Successfully followed user!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to follow user", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleFollowUser = (userId: string) => {
    if (!isAuthenticated) {
      toast({ 
        title: "Please log in", 
        description: "You need to be logged in to follow users",
        variant: "destructive" 
      });
      return;
    }

    followUserMutation.mutate(userId);
  };

  const UserCard = ({ user, showFollowButton = true }: { user: any; showFollowButton?: boolean }) => (
    <Card className="bg-gaming-card border-gaming-card-hover hover:border-gaming-blue/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12 ring-2 ring-gaming-card-hover">
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback className="bg-gaming-darker text-white">
              {user.displayName?.charAt(0) || user.email?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white truncate">{user.displayName}</h3>
              {user.isVerified && <Crown className="w-4 h-4 text-gaming-blue" />}
            </div>
            
            <p className="text-sm text-gaming-text-dim mb-2 line-clamp-2">
              {user.bio || "No bio available"}
            </p>

            <div className="flex items-center gap-4 text-xs text-gaming-text-dim mb-3">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {user.followersCount || 0} followers
              </div>
              {user.mutualFollowers > 0 && (
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {user.mutualFollowers} mutual
                </div>
              )}
              <div className="flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                Level {user.level || 1}
              </div>
            </div>

            {user.commonGames && user.commonGames.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {user.commonGames.slice(0, 3).map((game: string) => (
                  <Badge key={game} variant="outline" className="text-xs">
                    {game}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {showFollowButton && !user.isFollowing && (
              <Button
                size="sm"
                onClick={() => handleFollowUser(user.id)}
                disabled={followUserMutation.isPending}
                className="bg-gaming-blue hover:bg-blue-600"
              >
                {followUserMutation.isPending ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-1" />
                    Follow
                  </>
                )}
              </Button>
            )}
            
            {user.isFollowing && (
              <Badge variant="outline" className="text-xs">
                Following
              </Badge>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.href = `/profile/${user.id}`}
              className="border-gaming-card-hover hover:border-gaming-blue"
            >
              View Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ActivityCard = ({ activity }: { activity: any }) => {
    const getActivityIcon = () => {
      switch (activity.type) {
        case 'post': return <MessageCircle className="w-4 h-4" />;
        case 'like': return <Heart className="w-4 h-4" />;
        case 'follow': return <UserPlus className="w-4 h-4" />;
        case 'achievement': return <Trophy className="w-4 h-4" />;
        case 'tournament_join': return <Crown className="w-4 h-4" />;
        case 'clan_join': return <Users className="w-4 h-4" />;
        default: return <Star className="w-4 h-4" />;
      }
    };

    const getActivityText = () => {
      switch (activity.type) {
        case 'post':
          return activity.action === 'created' ? 'created a new post' : 'updated a post';
        case 'like':
          return 'liked a post';
        case 'follow':
          return `started following ${activity.targetUser?.displayName}`;
        case 'achievement':
          return `unlocked "${activity.metadata?.badgeTitle}" achievement`;
        case 'tournament_join':
          return `joined ${activity.targetTournament?.name}`;
        case 'clan_join':
          return `joined ${activity.targetClan?.name}`;
        default:
          return activity.action;
      }
    };

    return (
      <Card className="bg-gaming-card border-gaming-card-hover">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={activity.user.avatarUrl} />
              <AvatarFallback className="bg-gaming-darker text-white text-sm">
                {activity.user.displayName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-gaming-blue/20 rounded-full flex items-center justify-center text-gaming-blue">
                  {getActivityIcon()}
                </div>
                <span className="font-medium text-white">{activity.user.displayName}</span>
                <span className="text-gaming-text-dim">{getActivityText()}</span>
              </div>

              <div className="text-xs text-gaming-text-dim flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(activity.createdAt).toLocaleDateString()}
              </div>

              {activity.targetPost && (
                <div className="mt-2 p-3 bg-gaming-darker rounded-lg">
                  <p className="text-sm text-gaming-text-dim line-clamp-2">
                    {activity.targetPost.content}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gaming-dark text-gaming-text">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header title="Discover" />
          
          <div className="max-w-7xl mx-auto p-6">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Discover Gaming Community</h1>
              <p className="text-gaming-text-dim">
                Find new players, follow gaming content, and stay updated with community activity
              </p>
            </div>

            {/* Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="bg-gaming-card border-gaming-card-hover">
                <TabsTrigger value="discover">Discover Users</TabsTrigger>
                <TabsTrigger value="search">Search</TabsTrigger>
                {isAuthenticated && <TabsTrigger value="activity">Activity Feed</TabsTrigger>}
              </TabsList>

              {/* Discover Users Tab */}
              <TabsContent value="discover" className="space-y-6">
                {/* Filters */}
                <div className="flex gap-4 flex-wrap">
                  <Select value={gameFilter} onValueChange={setGameFilter}>
                    <SelectTrigger className="w-48 bg-gaming-darker border-gaming-card-hover text-white">
                      <SelectValue placeholder="Filter by game" />
                    </SelectTrigger>
                    <SelectContent className="bg-gaming-card border-gaming-card-hover">
                      <SelectItem value="">All Games</SelectItem>
                      <SelectItem value="Valorant">Valorant</SelectItem>
                      <SelectItem value="League of Legends">League of Legends</SelectItem>
                      <SelectItem value="CS2">CS2</SelectItem>
                      <SelectItem value="Overwatch 2">Overwatch 2</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={regionFilter} onValueChange={setRegionFilter}>
                    <SelectTrigger className="w-48 bg-gaming-darker border-gaming-card-hover text-white">
                      <SelectValue placeholder="Filter by region" />
                    </SelectTrigger>
                    <SelectContent className="bg-gaming-card border-gaming-card-hover">
                      <SelectItem value="">All Regions</SelectItem>
                      <SelectItem value="North America">North America</SelectItem>
                      <SelectItem value="Europe">Europe</SelectItem>
                      <SelectItem value="Asia Pacific">Asia Pacific</SelectItem>
                    </SelectContent>
                  </Select>

                  {(gameFilter || regionFilter) && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setGameFilter("");
                        setRegionFilter("");
                      }}
                      className="border-gaming-card-hover hover:border-gaming-blue"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>

                {/* Users Grid */}
                {isLoadingDiscover ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <Card key={i} className="bg-gaming-card border-gaming-card-hover animate-pulse">
                        <CardContent className="p-4">
                          <div className="h-16 bg-gaming-darker rounded" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : discoveredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gaming-text-dim" />
                    <h3 className="text-xl font-semibold text-white mb-2">No users found</h3>
                    <p className="text-gaming-text-dim">
                      Try adjusting your filters or check back later for new users to discover
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {discoveredUsers.map((user: any) => (
                      <UserCard key={user.id} user={user} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Search Tab */}
              <TabsContent value="search" className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gaming-text-dim" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for users by name, email, or bio..."
                    className="pl-10 bg-gaming-darker border-gaming-card-hover text-white"
                  />
                </div>

                {searchQuery.length < 2 ? (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 mx-auto mb-4 text-gaming-text-dim" />
                    <h3 className="text-xl font-semibold text-white mb-2">Search Users</h3>
                    <p className="text-gaming-text-dim">
                      Enter at least 2 characters to search for users
                    </p>
                  </div>
                ) : isLoadingSearch ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Card key={i} className="bg-gaming-card border-gaming-card-hover animate-pulse">
                        <CardContent className="p-4">
                          <div className="h-16 bg-gaming-darker rounded" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gaming-text-dim" />
                    <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                    <p className="text-gaming-text-dim">
                      No users found matching "{searchQuery}"
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {searchResults.map((user: any) => (
                      <UserCard key={user.id} user={user} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Activity Feed Tab */}
              {isAuthenticated && (
                <TabsContent value="activity" className="space-y-6">
                  {isLoadingActivity ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Card key={i} className="bg-gaming-card border-gaming-card-hover animate-pulse">
                          <CardContent className="p-4">
                            <div className="h-20 bg-gaming-darker rounded" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : activityFeed.length === 0 ? (
                    <div className="text-center py-12">
                      <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gaming-text-dim" />
                      <h3 className="text-xl font-semibold text-white mb-2">No recent activity</h3>
                      <p className="text-gaming-text-dim">
                        Follow more users to see their activity in your feed
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activityFeed.map((activity: any) => (
                        <ActivityCard key={activity.id} activity={activity} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}