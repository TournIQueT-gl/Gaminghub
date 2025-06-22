import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  Save,
  Camera,
  Mail,
  Lock
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [profileSettings, setProfileSettings] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    profileImage: user?.profileImage || '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    clanNotifications: true,
    tournamentNotifications: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowDirectMessages: true,
  });

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
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PATCH', '/api/users/notifications', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Notification settings updated!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update notifications",
        variant: "destructive",
      });
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileSettings);
  };

  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotificationsMutation.mutate(notificationSettings);
  };

  return (
    <div className="min-h-screen bg-gaming-dark text-gaming-text">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header title="Settings" />
          
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="bg-gaming-darker border-gaming-card-hover">
                  <TabsTrigger value="profile" className="data-[state=active]:bg-gaming-card">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="data-[state=active]:bg-gaming-card">
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger value="privacy" className="data-[state=active]:bg-gaming-card">
                    <Shield className="w-4 h-4 mr-2" />
                    Privacy
                  </TabsTrigger>
                  <TabsTrigger value="appearance" className="data-[state=active]:bg-gaming-card">
                    <Palette className="w-4 h-4 mr-2" />
                    Appearance
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                  <Card className="bg-gaming-card border-gaming-card-hover">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Profile Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="username" className="text-white">Username</Label>
                            <Input
                              id="username"
                              value={profileSettings.username}
                              onChange={(e) => setProfileSettings({...profileSettings, username: e.target.value})}
                              className="bg-gaming-darker border-gaming-card-hover text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-white">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={profileSettings.email}
                              onChange={(e) => setProfileSettings({...profileSettings, email: e.target.value})}
                              className="bg-gaming-darker border-gaming-card-hover text-white"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="bio" className="text-white">Bio</Label>
                          <Textarea
                            id="bio"
                            value={profileSettings.bio}
                            onChange={(e) => setProfileSettings({...profileSettings, bio: e.target.value})}
                            placeholder="Tell us about yourself..."
                            className="bg-gaming-darker border-gaming-card-hover text-white min-h-[100px]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="profileImage" className="text-white">Profile Image URL</Label>
                          <Input
                            id="profileImage"
                            value={profileSettings.profileImage}
                            onChange={(e) => setProfileSettings({...profileSettings, profileImage: e.target.value})}
                            placeholder="https://example.com/avatar.jpg"
                            className="bg-gaming-darker border-gaming-card-hover text-white"
                          />
                        </div>

                        <Button 
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                          className="bg-gaming-purple hover:bg-purple-600"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                  <Card className="bg-gaming-card border-gaming-card-hover">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Bell className="w-5 h-5 mr-2" />
                        Notification Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleNotificationSubmit} className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-white">Email Notifications</Label>
                              <p className="text-sm text-gaming-text-dim">Receive notifications via email</p>
                            </div>
                            <Switch
                              checked={notificationSettings.emailNotifications}
                              onCheckedChange={(checked) => 
                                setNotificationSettings({...notificationSettings, emailNotifications: checked})
                              }
                            />
                          </div>

                          <Separator className="bg-gaming-card-hover" />

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-white">Push Notifications</Label>
                              <p className="text-sm text-gaming-text-dim">Receive push notifications in browser</p>
                            </div>
                            <Switch
                              checked={notificationSettings.pushNotifications}
                              onCheckedChange={(checked) => 
                                setNotificationSettings({...notificationSettings, pushNotifications: checked})
                              }
                            />
                          </div>

                          <Separator className="bg-gaming-card-hover" />

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-white">Clan Notifications</Label>
                              <p className="text-sm text-gaming-text-dim">Get notified about clan activities</p>
                            </div>
                            <Switch
                              checked={notificationSettings.clanNotifications}
                              onCheckedChange={(checked) => 
                                setNotificationSettings({...notificationSettings, clanNotifications: checked})
                              }
                            />
                          </div>

                          <Separator className="bg-gaming-card-hover" />

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-white">Tournament Notifications</Label>
                              <p className="text-sm text-gaming-text-dim">Get notified about tournament updates</p>
                            </div>
                            <Switch
                              checked={notificationSettings.tournamentNotifications}
                              onCheckedChange={(checked) => 
                                setNotificationSettings({...notificationSettings, tournamentNotifications: checked})
                              }
                            />
                          </div>
                        </div>

                        <Button 
                          type="submit"
                          disabled={updateNotificationsMutation.isPending}
                          className="bg-gaming-purple hover:bg-purple-600"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {updateNotificationsMutation.isPending ? "Saving..." : "Save Preferences"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="privacy" className="space-y-6">
                  <Card className="bg-gaming-card border-gaming-card-hover">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Shield className="w-5 h-5 mr-2" />
                        Privacy Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-white">Show Online Status</Label>
                            <p className="text-sm text-gaming-text-dim">Let others see when you're online</p>
                          </div>
                          <Switch
                            checked={privacySettings.showOnlineStatus}
                            onCheckedChange={(checked) => 
                              setPrivacySettings({...privacySettings, showOnlineStatus: checked})
                            }
                          />
                        </div>

                        <Separator className="bg-gaming-card-hover" />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-white">Allow Direct Messages</Label>
                            <p className="text-sm text-gaming-text-dim">Allow other users to send you direct messages</p>
                          </div>
                          <Switch
                            checked={privacySettings.allowDirectMessages}
                            onCheckedChange={(checked) => 
                              setPrivacySettings({...privacySettings, allowDirectMessages: checked})
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-6">
                  <Card className="bg-gaming-card border-gaming-card-hover">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Palette className="w-5 h-5 mr-2" />
                        Appearance Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Palette className="w-12 h-12 text-gaming-text-dim mx-auto mb-2" />
                        <p className="text-gaming-text-dim">Theme customization coming soon</p>
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
  );
}