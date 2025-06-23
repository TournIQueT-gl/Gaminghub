import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Trash2,
  Download,
  Upload,
  Link,
  Eye,
  EyeOff,
  Save,
  RefreshCw
} from "lucide-react";

export default function Settings() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  // User preferences query
  const { data: preferences, isLoading: isLoadingPreferences } = useQuery({
    queryKey: ['/api/users/preferences'],
    queryFn: async () => {
      const response = await fetch('/api/users/preferences');
      if (!response.ok) throw new Error('Failed to fetch preferences');
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Social profiles query
  const { data: socialProfiles = [], isLoading: isLoadingSocials } = useQuery({
    queryKey: ['/api/users/socials'],
    queryFn: async () => {
      const response = await fetch('/api/users/socials');
      if (!response.ok) throw new Error('Failed to fetch social profiles');
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await apiRequest('PATCH', '/api/users/preferences', updates);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update preferences');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/preferences'] });
      toast({ title: "Settings updated successfully!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update settings", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await apiRequest('PATCH', '/api/users/profile', updates);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({ title: "Profile updated successfully!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update profile", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handlePreferenceChange = (key: string, value: any) => {
    updatePreferencesMutation.mutate({ [key]: value });
  };

  const handleProfileUpdate = (updates: any) => {
    updateProfileMutation.mutate(updates);
  };

  const ProfileSettings = () => (
    <div className="space-y-6">
      <Card className="bg-gaming-card border-gaming-card-hover">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="displayName" className="text-white">Display Name</Label>
              <Input
                id="displayName"
                defaultValue={user?.displayName}
                className="bg-gaming-darker border-gaming-card-hover text-white mt-1"
                onBlur={(e) => handleProfileUpdate({ displayName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user?.email}
                className="bg-gaming-darker border-gaming-card-hover text-white mt-1"
                onBlur={(e) => handleProfileUpdate({ email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio" className="text-white">Bio</Label>
            <Textarea
              id="bio"
              defaultValue={user?.bio || ""}
              placeholder="Tell us about yourself..."
              className="bg-gaming-darker border-gaming-card-hover text-white mt-1"
              rows={3}
              onBlur={(e) => handleProfileUpdate({ bio: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location" className="text-white">Location</Label>
              <Input
                id="location"
                defaultValue={user?.location || ""}
                placeholder="City, Country"
                className="bg-gaming-darker border-gaming-card-hover text-white mt-1"
                onBlur={(e) => handleProfileUpdate({ location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="website" className="text-white">Website</Label>
              <Input
                id="website"
                type="url"
                defaultValue={user?.website || ""}
                placeholder="https://your-website.com"
                className="bg-gaming-darker border-gaming-card-hover text-white mt-1"
                onBlur={(e) => handleProfileUpdate({ website: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gaming-card border-gaming-card-hover">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Link className="w-5 h-5" />
            Gaming Profiles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoadingSocials ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-gaming-darker rounded animate-pulse" />
                ))}
              </div>
            ) : socialProfiles.length === 0 ? (
              <div className="text-center py-6 text-gaming-text-dim">
                <Link className="w-8 h-8 mx-auto mb-2" />
                <p>No gaming profiles connected</p>
                <Button variant="outline" className="mt-2 border-gaming-card-hover">
                  <Link className="w-4 h-4 mr-2" />
                  Connect Profile
                </Button>
              </div>
            ) : (
              socialProfiles.map((profile: any) => (
                <div key={profile.id} className="flex items-center justify-between p-3 bg-gaming-darker rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gaming-blue/20 rounded-lg flex items-center justify-center">
                      <Link className="w-4 h-4 text-gaming-blue" />
                    </div>
                    <div>
                      <div className="font-medium text-white capitalize">{profile.platform}</div>
                      <div className="text-sm text-gaming-text-dim">{profile.username}</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-gaming-card-hover">
                    Edit
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const PrivacySettings = () => (
    <div className="space-y-6">
      <Card className="bg-gaming-card border-gaming-card-hover">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Profile Visibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Public Profile</Label>
              <p className="text-sm text-gaming-text-dim">Allow others to view your profile</p>
            </div>
            <Switch
              checked={preferences?.isProfilePublic ?? true}
              onCheckedChange={(value) => handlePreferenceChange('isProfilePublic', value)}
            />
          </div>

          <Separator className="bg-gaming-card-hover" />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Show Online Status</Label>
              <p className="text-sm text-gaming-text-dim">Let others see when you're online</p>
            </div>
            <Switch
              checked={preferences?.showOnlineStatus ?? true}
              onCheckedChange={(value) => handlePreferenceChange('showOnlineStatus', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Show Game Activity</Label>
              <p className="text-sm text-gaming-text-dim">Display what games you're playing</p>
            </div>
            <Switch
              checked={preferences?.showGameActivity ?? true}
              onCheckedChange={(value) => handlePreferenceChange('showGameActivity', value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gaming-card border-gaming-card-hover">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Social Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Allow Follow Requests</Label>
              <p className="text-sm text-gaming-text-dim">Let others follow your activities</p>
            </div>
            <Switch
              checked={preferences?.allowFollowRequests ?? true}
              onCheckedChange={(value) => handlePreferenceChange('allowFollowRequests', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Allow Friend Requests</Label>
              <p className="text-sm text-gaming-text-dim">Receive friend requests from other users</p>
            </div>
            <Switch
              checked={preferences?.allowFriendRequests ?? true}
              onCheckedChange={(value) => handlePreferenceChange('allowFriendRequests', value)}
            />
          </div>

          <div>
            <Label className="text-white">Who can message you</Label>
            <Select
              value={preferences?.allowMessages || 'everyone'}
              onValueChange={(value) => handlePreferenceChange('allowMessages', value)}
            >
              <SelectTrigger className="bg-gaming-darker border-gaming-card-hover text-white mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gaming-card border-gaming-card-hover">
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="friends">Friends only</SelectItem>
                <SelectItem value="none">No one</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const NotificationSettings = () => (
    <div className="space-y-6">
      <Card className="bg-gaming-card border-gaming-card-hover">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Email Notifications</Label>
              <p className="text-sm text-gaming-text-dim">Receive updates via email</p>
            </div>
            <Switch
              checked={preferences?.emailNotifications ?? true}
              onCheckedChange={(value) => handlePreferenceChange('emailNotifications', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Push Notifications</Label>
              <p className="text-sm text-gaming-text-dim">Get browser notifications</p>
            </div>
            <Switch
              checked={preferences?.pushNotifications ?? true}
              onCheckedChange={(value) => handlePreferenceChange('pushNotifications', value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const AppearanceSettings = () => (
    <div className="space-y-6">
      <Card className="bg-gaming-card border-gaming-card-hover">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Theme & Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white">Theme</Label>
            <Select
              value={preferences?.theme || 'dark'}
              onValueChange={(value) => handlePreferenceChange('theme', value)}
            >
              <SelectTrigger className="bg-gaming-darker border-gaming-card-hover text-white mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gaming-card border-gaming-card-hover">
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white">Language</Label>
            <Select
              value={preferences?.language || 'en'}
              onValueChange={(value) => handlePreferenceChange('language', value)}
            >
              <SelectTrigger className="bg-gaming-darker border-gaming-card-hover text-white mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gaming-card border-gaming-card-hover">
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
                <SelectItem value="ko">한국어</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white">Timezone</Label>
            <Select
              value={preferences?.timezone || 'UTC'}
              onValueChange={(value) => handlePreferenceChange('timezone', value)}
            >
              <SelectTrigger className="bg-gaming-darker border-gaming-card-hover text-white mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gaming-card border-gaming-card-hover">
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                <SelectItem value="Europe/London">GMT</SelectItem>
                <SelectItem value="Europe/Paris">CET</SelectItem>
                <SelectItem value="Asia/Tokyo">JST</SelectItem>
                <SelectItem value="Asia/Shanghai">CST</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const DataSettings = () => (
    <div className="space-y-6">
      <Card className="bg-gaming-card border-gaming-card-hover">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Download className="w-5 h-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Export Your Data</Label>
              <p className="text-sm text-gaming-text-dim">Download a copy of your account data</p>
            </div>
            <Button variant="outline" className="border-gaming-card-hover hover:border-gaming-blue">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          <Separator className="bg-gaming-card-hover" />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Import Data</Label>
              <p className="text-sm text-gaming-text-dim">Import your gaming data from other platforms</p>
            </div>
            <Button variant="outline" className="border-gaming-card-hover hover:border-gaming-blue">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>

          <Separator className="bg-gaming-card-hover" />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-red-400">Delete Account</Label>
              <p className="text-sm text-gaming-text-dim">Permanently delete your account and all data</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gaming-card border-gaming-card-hover">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Delete Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-gaming-card-hover">Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gaming-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please log in</h1>
          <p className="text-gaming-text-dim">You need to be logged in to access settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gaming-dark text-gaming-text">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header title="Settings" />
          
          <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
              <p className="text-gaming-text-dim">
                Manage your account preferences and privacy settings
              </p>
            </div>

            {/* Settings Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-gaming-card border-gaming-card-hover mb-6">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Privacy
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Appearance
                </TabsTrigger>
                <TabsTrigger value="data" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Data
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <ProfileSettings />
              </TabsContent>

              <TabsContent value="privacy">
                <PrivacySettings />
              </TabsContent>

              <TabsContent value="notifications">
                <NotificationSettings />
              </TabsContent>

              <TabsContent value="appearance">
                <AppearanceSettings />
              </TabsContent>

              <TabsContent value="data">
                <DataSettings />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}