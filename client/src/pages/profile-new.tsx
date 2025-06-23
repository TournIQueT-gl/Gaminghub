import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { LoadingPage } from "@/components/loading-spinner";
import { ProfileSkeleton } from "@/components/profile-skeleton";
import PostCard from "@/components/post-card";
import AchievementCard from "@/components/achievement-card";
import GameStatsCard from "@/components/game-stats-card";
import ProfileCompletion from "@/components/profile-completion";
import ProfileAvatarUpload from "@/components/profile-avatar-upload";
import ProfileSettingsModal from "@/components/profile-settings-modal";
import ProfileSocialLinks from "@/components/profile-social-links";
import ProfileActivityFeed from "@/components/profile-activity-feed";
import ProfileStatsDashboard from "@/components/profile-stats-dashboard";
import ProfileFollowersModal from "@/components/profile-followers-modal";
import ProfileBadges from "@/components/profile-badges";
import ProfileQuickActions from "@/components/profile-quick-actions";
import { ProfileErrorBoundary } from "@/components/profile-error-boundary";
import { useProfileValidation } from "@/hooks/useProfileValidation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import ProfileAnalytics from "@/components/profile-analytics";
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
  Share2,
  Edit,
  MapPin,
  Globe,
  Clock,
  Award,
  Target,
  Gamepad2,
  Crown,
  Zap,
  Plus,
  X,
  BarChart3
} from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

interface GameStats {
  game: string;
  hoursPlayed: number;
  rank: string;
  level: number;
  winRate: number;
  lastPlayed: Date;
}

export default function ProfileNew() {
  const params = useParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const { validateProfile, getFieldError, clearFieldError } = useProfileValidation();
  
  // Handle URL params properly
  const targetUserId = params.userId && params.userId !== user?.id ? params.userId : null;
  const profileUserId = targetUserId || user?.id;
  const isOwnProfile = !targetUserId;

  const [editMode, setEditMode] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<'followers' | 'following'>('followers');
  const [profileData, setProfileData] = useState({
    username: '',
    bio: '',
    location: '',
    website: '',
    favoriteGames: [] as string[],
    gameInput: '',
  });

  // Fetch profile user data
  const { data: profileUser, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: isOwnProfile ? [`/api/auth/user`] : [`/api/users/${profileUserId}`],
    queryFn: async () => {
      if (!profileUserId) return null;
      const endpoint = isOwnProfile ? '/api/auth/user' : `/api/users/${profileUserId}`;
      const response = await fetch(endpoint);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        throw new Error('Failed to fetch user');
      }
      return response.json();
    },
    enabled: !!profileUserId && isAuthenticated,
    retry: false,
  });

  // Fetch user stats
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: [`/api/users/${profileUserId}/stats`],
    enabled: !!profileUserId && isAuthenticated,
  });

  // Fetch user posts
  const { data: userPosts, isLoading: postsLoading } = useQuery({
    queryKey: [`/api/users/${profileUserId}/posts`],
    enabled: !!profileUserId && isAuthenticated,
  });

  // Fetch user achievements
  const { data: achievements } = useQuery({
    queryKey: [`/api/users/${profileUserId}/achievements`],
    enabled: !!profileUserId && isAuthenticated,
    retry: false,
  });

  // Fetch user game stats
  const { data: gameStats } = useQuery({
    queryKey: [`/api/users/${profileUserId}/game-stats`],
    enabled: !!profileUserId && isAuthenticated,
    retry: false,
  });

  // Fetch user analytics (own profile only)
  const { data: analytics } = useQuery({
    queryKey: [`/api/users/${profileUserId}/analytics`],
    enabled: !!profileUserId && isAuthenticated && isOwnProfile,
    retry: false,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PATCH', '/api/users/profile', data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/auth/user`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${profileUserId}/stats`] });
      setEditMode(false);
      
      // Update profile data state with response
      if (data) {
        setProfileData(prev => ({ ...prev, ...data }));
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Follow/Unfollow mutation
  const followMutation = useMutation({
    mutationFn: async (action: 'follow' | 'unfollow') => {
      const response = await apiRequest('POST', `/api/users/${profileUserId}/${action}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${profileUserId}/stats`] });
      toast({
        title: "Success",
        description: `Successfully ${followMutation.variables === 'follow' ? 'followed' : 'unfollowed'} user!`,
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

  useEffect(() => {
    if (profileUser && isOwnProfile) {
      setProfileData({
        username: profileUser.username || '',
        bio: profileUser.bio || '',
        location: profileUser.location || '',
        website: profileUser.website || '',
        favoriteGames: profileUser.favoriteGames || [],
        gameInput: '',
      });
    }
  }, [profileUser, isOwnProfile]);

  // Handle error states
  if (profileError && !profileLoading) {
    return (
      <div className="min-h-screen bg-gaming-dark text-gaming-text">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 ml-64">
            <Header title="Profile Not Found" />
            <div className="p-6">
              <Card className="bg-gaming-card border-gaming-card-hover">
                <CardContent className="p-8 text-center">
                  <User className="w-16 h-16 text-gaming-text-dim mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-white mb-2">User Not Found</h2>
                  <p className="text-gaming-text-dim mb-4">
                    The profile you're looking for doesn't exist or has been removed.
                  </p>
                  <Link href="/">
                    <Button className="bg-gaming-blue hover:bg-blue-600">
                      Return to Feed
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || profileLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gaming-dark text-gaming-text">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 ml-64">
            <Header title="Loading Profile..." />
            <div className="p-6">
              <ProfileSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoadingPage text="Please log in to view profiles" />;
  }

  if (!profileUserId) {
    return <LoadingPage text="Loading user data..." />;
  }

  // Enhanced leveling calculation
  const calculateLevel = (xp: number): number => {
    let level = 1;
    let requiredXP = 0;
    
    while (xp >= requiredXP) {
      level++;
      requiredXP += level * 50;
    }
    
    return level - 1;
  };

  const getXPForLevel = (level: number): number => {
    let totalXP = 0;
    for (let i = 2; i <= level; i++) {
      totalXP += i * 50;
    }
    return totalXP;
  };

  const getNextLevelXP = (level: number): number => {
    return getXPForLevel(level + 1);
  };

  // Calculate level properly
  const currentXP = statsData?.xp || profileUser?.xp || 0;
  const currentLevel = calculateLevel(currentXP);
  const currentLevelXP = getXPForLevel(currentLevel);
  const nextLevelXP = getXPForLevel(currentLevel + 1);
  const levelProgress = nextLevelXP > currentLevelXP ? 
    ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100 : 100;

  const displayUser = profileUser || user;
  const displayStats = {
    level: currentLevel,
    xp: currentXP,
    postsCount: statsData?.postsCount || 0,
    followersCount: statsData?.followersCount || 0,
    followingCount: statsData?.followingCount || 0,
    achievementsCount: achievements?.filter(a => a.unlockedAt).length || 0,
    winRate: statsData?.winRate || 0.75,
    hoursPlayed: statsData?.hoursPlayed || 156,
    favoriteGame: profileUser?.favoriteGames?.[0] || 'Valorant',
    rank: statsData?.rank || 'Diamond III',
    lastActive: new Date(statsData?.lastActive || Date.now()),
    streakDays: statsData?.streakDays || 12,
    tournamentsWon: statsData?.tournamentsWon || 3,
    clanMembership: statsData?.clanMembership || null 
  };

  // Level progress is now calculated above in displayStats

  const handleSaveProfile = async () => {
    const isValid = await validateProfile({
      username: profileData.username,
      bio: profileData.bio,
      location: profileData.location,
      website: profileData.website,
      favoriteGames: profileData.favoriteGames,
    });

    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving",
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate({
      username: profileData.username,
      bio: profileData.bio,
      location: profileData.location,
      website: profileData.website,
      favoriteGames: profileData.favoriteGames,
    });
  };

  const handleAddGame = () => {
    if (profileData.gameInput.trim() && !profileData.favoriteGames.includes(profileData.gameInput.trim())) {
      setProfileData(prev => ({
        ...prev,
        favoriteGames: [...prev.favoriteGames, prev.gameInput.trim()],
        gameInput: '',
      }));
    }
  };

  const handleRemoveGame = (game: string) => {
    setProfileData(prev => ({
      ...prev,
      favoriteGames: prev.favoriteGames.filter(g => g !== game),
    }));
  };

  const handleCoverPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Cover photo must be under 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        updateProfileMutation.mutate({ 
          coverImageUrl: base64String 
        });
      };
      reader.readAsDataURL(file);

      toast({
        title: "Uploading cover photo",
        description: "Your cover photo is being updated...",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload cover photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-gaming-gold';
      case 'epic': return 'text-gaming-purple';
      case 'rare': return 'text-gaming-blue';
      default: return 'text-gaming-emerald';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gaming-gold/20 border-gaming-gold';
      case 'epic': return 'bg-gaming-purple/20 border-gaming-purple';
      case 'rare': return 'bg-gaming-blue/20 border-gaming-blue';
      default: return 'bg-gaming-emerald/20 border-gaming-emerald';
    }
  };

  return (
    <div className="min-h-screen bg-gaming-dark text-gaming-text">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header title={isOwnProfile ? "Your Profile" : `${profileUser?.username || 'User'}'s Profile`} />
          
          <div className="p-6 space-y-6">
            {/* Profile Header */}
            <Card className="bg-gaming-card border-gaming-card-hover overflow-hidden">
              <div className="relative h-48 bg-gradient-to-r from-gaming-purple via-gaming-blue to-gaming-emerald">
                {profileUser?.coverImageUrl && (
                  <img 
                    src={profileUser.coverImageUrl} 
                    alt="Cover" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                {isOwnProfile && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => document.getElementById('cover-photo-input')?.click()}
                    className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
                <input
                  id="cover-photo-input"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverPhotoUpload}
                  className="hidden"
                />
              </div>
              
              <CardContent className="pt-0 pb-6">
                <div className="flex flex-col lg:flex-row items-start gap-6 -mt-20">
                  {/* Profile Picture */}
                  <div className="relative z-10">
                    <ProfileAvatarUpload
                      currentImage={profileUser?.profileImageUrl}
                      username={profileUser?.username}
                      editable={isOwnProfile}
                      onImageUpdate={(imageUrl) => {
                        if (isOwnProfile) {
                          updateProfileMutation.mutate({ profileImageUrl: imageUrl });
                        }
                      }}
                    />
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 space-y-4 relative z-10 mt-4 lg:mt-0">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h1 className="text-3xl font-bold text-white drop-shadow-lg">{profileUser?.username || 'Anonymous Gamer'}</h1>
                          {profileUser?.isVerified && (
                            <Badge className="bg-gaming-blue text-white">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {displayStats.clanMembership?.role === 'leader' && (
                            <Badge className="bg-gaming-gold text-black">
                              <Crown className="w-3 h-3 mr-1" />
                              Clan Leader
                            </Badge>
                          )}
                        </div>
                        <p className="text-gaming-text-dim text-lg drop-shadow">{profileUser?.email}</p>
                        {profileUser?.bio && (
                          <p className="text-gaming-text mt-2 max-w-2xl drop-shadow">{profileUser.bio}</p>
                        )}
                        
                        {/* Additional Info */}
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gaming-text-dim">
                          {displayUser?.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {displayUser.location}
                            </div>
                          )}
                          {displayUser?.website && (
                            <a 
                              href={displayUser.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-gaming-blue transition-colors"
                            >
                              <Globe className="w-4 h-4" />
                              Website
                            </a>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Joined {displayUser?.createdAt ? new Date(displayUser.createdAt).toLocaleDateString() : 'Recently'}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        {isOwnProfile ? (
                          <>
                            <Button 
                              onClick={() => setEditMode(!editMode)}
                              variant="outline" 
                              className="border-gaming-card-hover bg-gaming-darker text-white hover:bg-gaming-card"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              {editMode ? 'Cancel' : 'Quick Edit'}
                            </Button>
                            <Button 
                              onClick={() => setSettingsModalOpen(true)}
                              className="bg-gaming-purple hover:bg-purple-600"
                            >
                              <Settings className="w-4 h-4 mr-2" />
                              Settings
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              onClick={() => followMutation.mutate('follow')}
                              disabled={followMutation.isPending}
                              className="bg-gaming-purple hover:bg-purple-600"
                            >
                              <Heart className="w-4 h-4 mr-2" />
                              Follow
                            </Button>
                            <Button variant="outline" className="border-gaming-card-hover">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Message
                            </Button>
                            <Button variant="outline" className="border-gaming-card-hover">
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Level Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gaming-text-dim">Level Progress</span>
                        <span className="text-gaming-blue font-mono">
                          Level {displayStats.level} ({displayStats.xp.toLocaleString()} XP)
                        </span>
                      </div>
                      <Progress 
                        value={levelProgress} 
                        className="h-3 bg-gaming-darker"
                      />
                      <div className="flex justify-between text-xs text-gaming-text-dim">
                        <span>{currentLevelXP.toLocaleString()} XP</span>
                        <span>{nextLevelXP.toLocaleString()} XP</span>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gaming-darker rounded-lg hover:bg-gaming-card-hover transition-colors cursor-pointer">
                        <div className="text-2xl font-bold text-gaming-blue">{displayStats.postsCount || 0}</div>
                        <div className="text-xs text-gaming-text-dim">Posts</div>
                      </div>
                      <div 
                        className="text-center p-3 bg-gaming-darker rounded-lg hover:bg-gaming-card-hover transition-colors cursor-pointer"
                        onClick={() => {
                          setFollowersModalTab('followers');
                          setFollowersModalOpen(true);
                        }}
                      >
                        <div className="text-2xl font-bold text-gaming-purple">{displayStats.followersCount || 0}</div>
                        <div className="text-xs text-gaming-text-dim">Followers</div>
                      </div>
                      <div 
                        className="text-center p-3 bg-gaming-darker rounded-lg hover:bg-gaming-card-hover transition-colors cursor-pointer"
                        onClick={() => {
                          setFollowersModalTab('following');
                          setFollowersModalOpen(true);
                        }}
                      >
                        <div className="text-2xl font-bold text-gaming-emerald">{displayStats.followingCount || 0}</div>
                        <div className="text-xs text-gaming-text-dim">Following</div>
                      </div>
                      <div className="text-center p-3 bg-gaming-darker rounded-lg hover:bg-gaming-card-hover transition-colors cursor-pointer">
                        <div className="text-2xl font-bold text-gaming-gold">{achievements?.filter((a: Achievement) => a.unlockedAt).length || 0}</div>
                        <div className="text-xs text-gaming-text-dim">Achievements</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Mode */}
                {editMode && isOwnProfile && (
                  <div className="mt-6 pt-6 border-t border-gaming-card-hover">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="username" className="text-white">Username</Label>
                          <Input
                            id="username"
                            value={profileData.username}
                            onChange={(e) => {
                              setProfileData(prev => ({ ...prev, username: e.target.value }));
                              clearFieldError('username');
                            }}
                            className={`bg-gaming-darker border-gaming-card-hover text-white mt-1 ${
                              getFieldError('username') ? 'border-red-500' : ''
                            }`}
                          />
                          {getFieldError('username') && (
                            <p className="text-red-400 text-xs mt-1">{getFieldError('username')}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="location" className="text-white">Location</Label>
                          <Input
                            id="location"
                            value={profileData.location}
                            onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                            className="bg-gaming-darker border-gaming-card-hover text-white mt-1"
                            placeholder="e.g., San Francisco, CA"
                          />
                        </div>
                        <div>
                          <Label htmlFor="website" className="text-white">Website</Label>
                          <Input
                            id="website"
                            value={profileData.website}
                            onChange={(e) => {
                              setProfileData(prev => ({ ...prev, website: e.target.value }));
                              clearFieldError('website');
                            }}
                            className={`bg-gaming-darker border-gaming-card-hover text-white mt-1 ${
                              getFieldError('website') ? 'border-red-500' : ''
                            }`}
                            placeholder="https://your-website.com"
                          />
                          {getFieldError('website') && (
                            <p className="text-red-400 text-xs mt-1">{getFieldError('website')}</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="bio" className="text-white">Bio</Label>
                          <Textarea
                            id="bio"
                            value={profileData.bio}
                            onChange={(e) => {
                              setProfileData(prev => ({ ...prev, bio: e.target.value }));
                              clearFieldError('bio');
                            }}
                            className={`bg-gaming-darker border-gaming-card-hover text-white mt-1 min-h-[100px] ${
                              getFieldError('bio') ? 'border-red-500' : ''
                            }`}
                            placeholder="Tell the gaming community about yourself..."
                          />
                          {getFieldError('bio') && (
                            <p className="text-red-400 text-xs mt-1">{getFieldError('bio')}</p>
                          )}
                        </div>
                        <div>
                          <Label className="text-white">Favorite Games</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              value={profileData.gameInput}
                              onChange={(e) => setProfileData(prev => ({ ...prev, gameInput: e.target.value }))}
                              placeholder="Add a game..."
                              className="bg-gaming-darker border-gaming-card-hover text-white"
                              onKeyPress={(e) => e.key === 'Enter' && handleAddGame()}
                            />
                            <Button 
                              onClick={handleAddGame}
                              size="icon"
                              className="bg-gaming-blue hover:bg-blue-600"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {profileData.favoriteGames.map((game) => (
                              <Badge 
                                key={game} 
                                variant="outline" 
                                className="border-gaming-card-hover bg-gaming-darker text-white"
                              >
                                {game}
                                <button 
                                  onClick={() => handleRemoveGame(game)}
                                  className="ml-2 hover:text-red-400"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={updateProfileMutation.isPending}
                        className="bg-gaming-emerald hover:bg-emerald-600"
                      >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button 
                        onClick={() => setEditMode(false)}
                        variant="outline"
                        className="border-gaming-card-hover"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile Completion - Only show for own profile */}
            {isOwnProfile && (
              <ProfileErrorBoundary>
                <ProfileCompletion 
                  user={profileUser} 
                  onEditProfile={() => setEditMode(true)} 
                />
              </ProfileErrorBoundary>
            )}

            {/* Clan Membership */}
            {displayStats.clanMembership && (
              <Card className="bg-gaming-card border-gaming-card-hover">
                <CardContent className="p-6">
                  <Link href={`/clan/${displayStats.clanMembership.id}`}>
                    <div className="flex items-center space-x-4 hover:bg-gaming-card-hover p-4 rounded-lg transition-colors cursor-pointer">
                      <div className="w-16 h-16 bg-gradient-to-br from-gaming-purple to-gaming-blue rounded-xl flex items-center justify-center">
                        <Shield className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-white">{displayStats.clanMembership.name}</h3>
                          <Badge className={displayStats.clanMembership.role === 'leader' ? 'bg-gaming-gold text-black' : 'bg-gaming-blue text-white'}>
                            {displayStats.clanMembership.role === 'leader' && <Crown className="w-3 h-3 mr-1" />}
                            {displayStats.clanMembership.role}
                          </Badge>
                        </div>
                        <p className="text-gaming-text-dim">
                          Clan member
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gaming-text-dim">Member</div>
                        <div className="text-white">Active</div>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Social Links */}
            <ProfileErrorBoundary>
              <ProfileSocialLinks 
                userId={profileUserId!}
                socialLinks={displayUser?.socialLinks || []}
                editable={isOwnProfile}
              />
            </ProfileErrorBoundary>

            {/* Quick Actions */}
            <ProfileQuickActions
              userId={profileUserId!}
              username={displayUser?.username || 'User'}
              isOwnProfile={isOwnProfile}
            />

            {/* Enhanced Stats Dashboard */}
            <ProfileErrorBoundary>
              <ProfileStatsDashboard 
                userId={profileUserId!}
                userStats={displayStats}
                isOwnProfile={isOwnProfile}
              />
            </ProfileErrorBoundary>

            {/* Profile Settings Modal */}
            {isOwnProfile && (
              <ProfileSettingsModal
                open={settingsModalOpen}
                onOpenChange={setSettingsModalOpen}
                user={profileUser}
              />
            )}

            {/* Followers Modal */}
            <ProfileFollowersModal
              open={followersModalOpen}
              onOpenChange={setFollowersModalOpen}
              userId={profileUserId!}
              initialTab={followersModalTab}
            />

            {/* Profile Content Tabs */}
            <Tabs defaultValue="posts" className="space-y-6">
              <TabsList className="bg-gaming-darker border-gaming-card-hover">
                <TabsTrigger value="posts" className="data-[state=active]:bg-gaming-card">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Posts ({displayStats.postsCount || 0})
                </TabsTrigger>
                <TabsTrigger value="achievements" className="data-[state=active]:bg-gaming-card">
                  <Trophy className="w-4 h-4 mr-2" />
                  Achievements
                </TabsTrigger>
                <TabsTrigger value="games" className="data-[state=active]:bg-gaming-card">
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Game Stats
                </TabsTrigger>
                <TabsTrigger value="activity" className="data-[state=active]:bg-gaming-card">
                  <Zap className="w-4 h-4 mr-2" />
                  Activity
                </TabsTrigger>
                {isOwnProfile && (
                  <TabsTrigger value="analytics" className="data-[state=active]:bg-gaming-card">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                )}
                <TabsTrigger value="badges" className="data-[state=active]:bg-gaming-card">
                  <Award className="w-4 h-4 mr-2" />
                  Badges
                </TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="space-y-4">
                {postsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="bg-gaming-card border-gaming-card-hover animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-4 bg-gaming-darker rounded w-3/4 mb-2" />
                          <div className="h-3 bg-gaming-darker rounded w-1/2" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : userPosts && userPosts.length > 0 ? (
                  <div className="space-y-4">
                    {userPosts.map((post: any) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <Card className="bg-gaming-card border-gaming-card-hover">
                    <CardContent className="p-8">
                      <div className="text-center">
                        <TrendingUp className="w-12 h-12 text-gaming-text-dim mx-auto mb-2" />
                        <p className="text-gaming-text-dim">
                          {isOwnProfile ? "You haven't posted anything yet" : "This user hasn't posted anything yet"}
                        </p>
                        {isOwnProfile && (
                          <p className="text-sm text-gaming-text-dim mt-1">Start sharing your gaming experiences!</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="achievements" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements && achievements.length > 0 ? (
                    achievements.map((achievement: Achievement) => (
                      <AchievementCard key={achievement.id} achievement={achievement} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <Trophy className="w-12 h-12 text-gaming-text-dim mx-auto mb-2" />
                      <p className="text-gaming-text-dim">No achievements yet</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="games" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gameStats && gameStats.length > 0 ? (
                    gameStats.map((stats: GameStats, index: number) => (
                      <GameStatsCard key={index} stats={stats} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <Gamepad2 className="w-12 h-12 text-gaming-text-dim mx-auto mb-2" />
                      <p className="text-gaming-text-dim">No game statistics available</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <ProfileActivityFeed userId={profileUserId!} isOwnProfile={isOwnProfile} />
              </TabsContent>

              {isOwnProfile && (
                <TabsContent value="analytics" className="space-y-4">
                  {analytics ? (
                    <ProfileAnalytics data={analytics} isOwnProfile={isOwnProfile} />
                  ) : (
                    <Card className="bg-gaming-card border-gaming-card-hover">
                      <CardContent className="p-8">
                        <div className="text-center">
                          <BarChart3 className="w-12 h-12 text-gaming-text-dim mx-auto mb-2" />
                          <p className="text-gaming-text-dim">Loading analytics...</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              )}

              <TabsContent value="badges" className="space-y-4">
                <ProfileBadges userId={profileUserId!} isOwnProfile={isOwnProfile} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}