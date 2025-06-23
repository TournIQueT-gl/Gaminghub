import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ProfileAvatarUpload from "./profile-avatar-upload";
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Eye, 
  Globe, 
  GamepadIcon,
  Plus,
  X,
  Save,
  Trash2
} from "lucide-react";

interface ProfileSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}

export default function ProfileSettingsModal({ open, onOpenChange, user }: ProfileSettingsModalProps) {
  const { toast } = useToast();
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    favoriteGames: user?.favoriteGames || [],
    profileImageUrl: user?.profileImageUrl || '',
    gameInput: '',
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showLocation: true,
    showGames: true,
    allowFollows: true,
    showOnlineStatus: true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    followNotifications: true,
    commentNotifications: true,
    likeNotifications: false,
    tournamentNotifications: true,
    clanNotifications: true,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PATCH', '/api/users/profile', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/auth/user`] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      username: profileData.username,
      bio: profileData.bio,
      location: profileData.location,
      website: profileData.website,
      favoriteGames: profileData.favoriteGames,
      profileImageUrl: profileData.profileImageUrl,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gaming-card border-gaming-card-hover">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Profile Settings
          </DialogTitle>
          <DialogDescription className="text-gaming-text-dim">
            Manage your profile information, privacy settings, and notifications
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gaming-darker">
            <TabsTrigger value="profile" className="data-[state=active]:bg-gaming-card">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-gaming-card">
              <Shield className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-gaming-card">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="games" className="data-[state=active]:bg-gaming-card">
              <GamepadIcon className="w-4 h-4 mr-2" />
              Gaming
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-6">
            <Card className="bg-gaming-darker border-gaming-card-hover">
              <CardHeader>
                <CardTitle className="text-white">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <ProfileAvatarUpload
                    currentImage={profileData.profileImageUrl}
                    username={profileData.username}
                    onImageUpdate={(imageUrl) => setProfileData(prev => ({ ...prev, profileImageUrl: imageUrl }))}
                    editable={true}
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-2">Profile Picture</h3>
                    <p className="text-gaming-text-dim text-sm mb-3">
                      Upload a profile picture to personalize your account. Recommended size: 400x400px
                    </p>
                  </div>
                </div>

                <Separator className="border-gaming-card-hover" />

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">Username</Label>
                  <Input
                    id="username"
                    value={profileData.username}
                    onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                    className="bg-gaming-card border-gaming-card-hover text-white"
                    placeholder="Enter your username"
                  />
                  <p className="text-xs text-gaming-text-dim">
                    Your username is how other users will find and identify you
                  </p>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-white">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    className="bg-gaming-card border-gaming-card-hover text-white min-h-[100px]"
                    placeholder="Tell the gaming community about yourself..."
                    maxLength={500}
                  />
                  <p className="text-xs text-gaming-text-dim">
                    {profileData.bio.length}/500 characters
                  </p>
                </div>

                {/* Location & Website */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-white">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      className="bg-gaming-card border-gaming-card-hover text-white"
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-white">Website</Label>
                    <Input
                      id="website"
                      value={profileData.website}
                      onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                      className="bg-gaming-card border-gaming-card-hover text-white"
                      placeholder="https://your-website.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6 mt-6">
            <Card className="bg-gaming-darker border-gaming-card-hover">
              <CardHeader>
                <CardTitle className="text-white">Privacy & Visibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Profile Visibility</Label>
                      <p className="text-sm text-gaming-text-dim">Control who can see your profile</p>
                    </div>
                    <Select 
                      value={privacySettings.profileVisibility} 
                      onValueChange={(value) => setPrivacySettings(prev => ({ ...prev, profileVisibility: value }))}
                    >
                      <SelectTrigger className="w-32 bg-gaming-card border-gaming-card-hover text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gaming-card border-gaming-card-hover">
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator className="border-gaming-card-hover" />

                  {[
                    { key: 'showEmail', label: 'Show Email Address', desc: 'Display your email on your profile' },
                    { key: 'showLocation', label: 'Show Location', desc: 'Display your location on your profile' },
                    { key: 'showGames', label: 'Show Favorite Games', desc: 'Display your gaming preferences' },
                    { key: 'allowFollows', label: 'Allow Follows', desc: 'Let other users follow you' },
                    { key: 'showOnlineStatus', label: 'Show Online Status', desc: 'Show when you\'re online' },
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">{setting.label}</Label>
                        <p className="text-sm text-gaming-text-dim">{setting.desc}</p>
                      </div>
                      <Switch
                        checked={privacySettings[setting.key as keyof typeof privacySettings] as boolean}
                        onCheckedChange={(checked) => 
                          setPrivacySettings(prev => ({ ...prev, [setting.key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card className="bg-gaming-darker border-gaming-card-hover">
              <CardHeader>
                <CardTitle className="text-white">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                    { key: 'pushNotifications', label: 'Push Notifications', desc: 'Receive push notifications in browser' },
                    { key: 'followNotifications', label: 'New Followers', desc: 'Notify when someone follows you' },
                    { key: 'commentNotifications', label: 'Comments', desc: 'Notify when someone comments on your posts' },
                    { key: 'likeNotifications', label: 'Likes', desc: 'Notify when someone likes your content' },
                    { key: 'tournamentNotifications', label: 'Tournament Updates', desc: 'Notify about tournament events' },
                    { key: 'clanNotifications', label: 'Clan Activities', desc: 'Notify about clan events and updates' },
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">{setting.label}</Label>
                        <p className="text-sm text-gaming-text-dim">{setting.desc}</p>
                      </div>
                      <Switch
                        checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, [setting.key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="games" className="space-y-6 mt-6">
            <Card className="bg-gaming-darker border-gaming-card-hover">
              <CardHeader>
                <CardTitle className="text-white">Gaming Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-white">Favorite Games</Label>
                  <div className="flex gap-2">
                    <Input
                      value={profileData.gameInput}
                      onChange={(e) => setProfileData(prev => ({ ...prev, gameInput: e.target.value }))}
                      placeholder="Add a game..."
                      className="bg-gaming-card border-gaming-card-hover text-white"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddGame()}
                    />
                    <Button 
                      onClick={handleAddGame}
                      className="bg-gaming-blue hover:bg-blue-600 px-3"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profileData.favoriteGames.map((game) => (
                      <Badge 
                        key={game} 
                        variant="outline" 
                        className="border-gaming-card-hover bg-gaming-card text-white px-3 py-1"
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-6 border-t border-gaming-card-hover">
          <Button 
            onClick={handleSaveProfile}
            disabled={updateProfileMutation.isPending}
            className="bg-gaming-emerald hover:bg-emerald-600 flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button 
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="border-gaming-card-hover"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}