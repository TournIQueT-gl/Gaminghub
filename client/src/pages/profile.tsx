import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { LoadingPage } from "@/components/loading-spinner";
import PostCard from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { checkGuestLimitation } from "@/lib/authUtils";
import { 
  User, 
  Trophy, 
  Users, 
  Star, 
  Settings, 
  Camera,
  Sparkles,
  TrendingUp,
  Calendar,
  Shield,
  Heart,
  MessageCircle,
  Share2
} from "lucide-react";

export default function Profile() {
  const params = useParams();
  const targetUserId = params.userId || null;
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  
  // Use current user if no userId param, otherwise use the param
  const profileUserId = targetUserId || user?.id;
  const isOwnProfile = !targetUserId || targetUserId === user?.id;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        bio: user.bio || '',
        gamePreferences: [], // Would be loaded from user preferences
      });
    }
  }, [user]);

  const { data: userPosts } = useQuery({
    queryKey: [`/api/users/${user?.id}/posts`],
    enabled: !!user,
    retry: false,
  });

  const { data: userStats } = useQuery({
    queryKey: [`/api/users/${user?.id}/stats`],
    enabled: !!user,
    retry: false,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      await apiRequest('PUT', '/api/users/profile', data);
    },
    onSuccess: () => {
      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      if (error.message.includes("401")) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const generateBioMutation = useMutation({
    mutationFn: async (gamePreferences: string[]) => {
      const response = await apiRequest('POST', '/api/ai/bio', { gamePreferences });
      return response.json();
    },
    onSuccess: (data) => {
      setProfileData(prev => ({ ...prev, bio: data.bio }));
      toast({
        title: "Bio generated!",
        description: "AI has generated a personalized bio for you.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate bio",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleAddGame = () => {
    if (gameInput.trim() && !profileData.gamePreferences.includes(gameInput.trim())) {
      setProfileData(prev => ({
        ...prev,
        gamePreferences: [...prev.gamePreferences, gameInput.trim()]
      }));
      setGameInput('');
    }
  };

  const handleRemoveGame = (game: string) => {
    setProfileData(prev => ({
      ...prev,
      gamePreferences: prev.gamePreferences.filter(g => g !== game)
    }));
  };

  const handleGenerateBio = () => {
    if (profileData.gamePreferences.length === 0) {
      toast({
        title: "Add games first",
        description: "Add some favorite games before generating a bio.",
        variant: "destructive",
      });
      return;
    }
    generateBioMutation.mutate(profileData.gamePreferences);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gaming-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-gaming-blue to-gaming-purple rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <User className="w-8 h-8 text-white" />
          </div>
          <p className="text-gaming-text-dim">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveLayout title="Profile">
      <div className="p-3 sm:p-4 md:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 md:gap-6">
          {/* Profile Overview */}
          <div className="xl:col-span-1 space-y-4 md:space-y-6">
            <Card className="bg-gaming-card border-gaming-card-hover">
              <CardHeader className="text-center p-4 md:p-6">
                <div className="relative mx-auto">
                  <img 
                    src={user?.profileImageUrl || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"} 
                    alt="Profile" 
                    className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover mx-auto border-4 border-gaming-blue"
                  />
                      <Button 
                        size="icon" 
                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-gaming-blue hover:bg-blue-600 rounded-full"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <CardTitle className="text-white">
                          {user?.username || user?.firstName || 'Gamer'}
                        </CardTitle>
                        {user?.isVerified && (
                          <Badge className="bg-gaming-purple text-white">Verified</Badge>
                        )}
                      </div>
                      <CardDescription>
                        Level {user?.level || 1} • {user?.xp || 0} XP
                      </CardDescription>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gaming-text-dim">Level Progress</span>
                        <span className="text-gaming-blue font-mono">
                          {user?.level || 1} → {(user?.level || 1) + 1}
                        </span>
                      </div>
                      <div className="bg-gaming-darker rounded-full h-2">
                        <div className="bg-gradient-to-r from-gaming-blue to-gaming-purple h-2 rounded-full w-3/4"></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-gaming-blue">
                          {userStats?.posts || 0}
                        </div>
                        <div className="text-xs text-gaming-text-dim">Posts</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gaming-purple">
                          {userStats?.followers || 0}
                        </div>
                        <div className="text-xs text-gaming-text-dim">Followers</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gaming-emerald">
                          {userStats?.tournamentWins || 0}
                        </div>
                        <div className="text-xs text-gaming-text-dim">Wins</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gaming-blue">
                          {userStats?.clanXp || 0}
                        </div>
                        <div className="text-xs text-gaming-text-dim">Clan XP</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-gaming-card border-gaming-card-hover">
                  <CardHeader>
                    <CardTitle className="text-white">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full bg-gaming-blue hover:bg-blue-600">
                      <Trophy className="w-4 h-4 mr-2" />
                      Join Tournament
                    </Button>
                    <Button className="w-full bg-gaming-purple hover:bg-purple-600">
                      <Users className="w-4 h-4 mr-2" />
                      Find Clan
                    </Button>
                    <Button className="w-full bg-gaming-emerald hover:bg-emerald-600">
                      <Star className="w-4 h-4 mr-2" />
                      Share Achievement
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Details */}
              <div className="lg:col-span-2">
                <Tabs defaultValue="edit" className="space-y-6">
                  <TabsList className="bg-gaming-card border border-gaming-card-hover">
                    <TabsTrigger value="edit" className="data-[state=active]:bg-gaming-blue">
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </TabsTrigger>
                    <TabsTrigger value="posts" className="data-[state=active]:bg-gaming-blue">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      My Posts
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="data-[state=active]:bg-gaming-blue">
                      <Calendar className="w-4 h-4 mr-2" />
                      Activity
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="edit">
                    <Card className="bg-gaming-card border-gaming-card-hover">
                      <CardHeader>
                        <CardTitle className="text-white">Edit Profile</CardTitle>
                        <CardDescription>
                          Update your profile information and gaming preferences
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="username" className="text-gaming-text">Username</Label>
                          <Input
                            id="username"
                            value={profileData.username}
                            onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                            className="bg-gaming-darker border-gaming-card-hover focus:border-gaming-blue"
                            placeholder="Enter your username"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="bio" className="text-gaming-text">Bio</Label>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleGenerateBio}
                              disabled={generateBioMutation.isPending}
                              className="text-gaming-emerald hover:text-emerald-400"
                            >
                              <Sparkles className="w-4 h-4 mr-1" />
                              {generateBioMutation.isPending ? 'Generating...' : 'AI Generate'}
                            </Button>
                          </div>
                          <Textarea
                            id="bio"
                            value={profileData.bio}
                            onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                            className="bg-gaming-darker border-gaming-card-hover focus:border-gaming-blue min-h-[100px]"
                            placeholder="Tell the gaming community about yourself..."
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gaming-text">Favorite Games</Label>
                          <div className="flex space-x-2">
                            <Input
                              value={gameInput}
                              onChange={(e) => setGameInput(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddGame()}
                              className="bg-gaming-darker border-gaming-card-hover focus:border-gaming-blue"
                              placeholder="Add a game"
                            />
                            <Button onClick={handleAddGame} className="bg-gaming-blue hover:bg-blue-600">
                              Add
                            </Button>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-3">
                            {profileData.gamePreferences.map((game) => (
                              <Badge 
                                key={game}
                                variant="secondary"
                                className="bg-gaming-purple/20 text-gaming-purple border border-gaming-purple/30 cursor-pointer hover:bg-gaming-purple/30"
                                onClick={() => handleRemoveGame(game)}
                              >
                                {game} ×
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Button
                          onClick={handleSaveProfile}
                          disabled={updateProfileMutation.isPending}
                          className="w-full bg-gaming-blue hover:bg-blue-600"
                        >
                          {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="posts">
                    <Card className="bg-gaming-card border-gaming-card-hover">
                      <CardHeader>
                        <CardTitle className="text-white">My Posts</CardTitle>
                        <CardDescription>
                          Your recent gaming posts and achievements
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        {userPosts && userPosts.length > 0 ? (
                          <div className="space-y-4">
                            {userPosts.map((post: any) => (
                              <div key={post.id} className="p-4 bg-gaming-darker rounded-lg border border-gaming-card-hover">
                                <p className="text-gaming-text mb-2">{post.content}</p>
                                <div className="flex items-center space-x-4 text-sm text-gaming-text-dim">
                                  <span>{post.likeCount} likes</span>
                                  <span>{post.commentCount} comments</span>
                                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <TrendingUp className="w-12 h-12 text-gaming-text-dim mx-auto mb-4" />
                            <p className="text-gaming-text-dim">No posts yet. Share your first gaming moment!</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="activity">
                    <Card className="bg-gaming-card border-gaming-card-hover">
                      <CardHeader>
                        <CardTitle className="text-white">Recent Activity</CardTitle>
                        <CardDescription>
                          Your gaming activity and achievements
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="text-center py-12">
                          <Calendar className="w-12 h-12 text-gaming-text-dim mx-auto mb-4" />
                          <p className="text-gaming-text-dim">Activity tracking coming soon!</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
