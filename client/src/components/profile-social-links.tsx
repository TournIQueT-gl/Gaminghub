import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Twitter, 
  Youtube, 
  Twitch, 
  Instagram, 
  Github, 
  Linkedin,
  Globe,
  Plus,
  X,
  Edit,
  ExternalLink
} from "lucide-react";

interface SocialLink {
  platform: string;
  url: string;
  username: string;
}

interface ProfileSocialLinksProps {
  userId: string;
  socialLinks?: SocialLink[];
  editable?: boolean;
}

const PLATFORM_CONFIGS = {
  twitter: {
    name: 'Twitter',
    icon: Twitter,
    color: 'text-blue-400',
    placeholder: 'https://twitter.com/username',
    baseUrl: 'https://twitter.com/',
  },
  youtube: {
    name: 'YouTube',
    icon: Youtube,
    color: 'text-red-500',
    placeholder: 'https://youtube.com/c/channel',
    baseUrl: 'https://youtube.com/c/',
  },
  twitch: {
    name: 'Twitch',
    icon: Twitch,
    color: 'text-purple-500',
    placeholder: 'https://twitch.tv/username',
    baseUrl: 'https://twitch.tv/',
  },
  instagram: {
    name: 'Instagram',
    icon: Instagram,
    color: 'text-pink-500',
    placeholder: 'https://instagram.com/username',
    baseUrl: 'https://instagram.com/',
  },
  github: {
    name: 'GitHub',
    icon: Github,
    color: 'text-gray-400',
    placeholder: 'https://github.com/username',
    baseUrl: 'https://github.com/',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'text-blue-600',
    placeholder: 'https://linkedin.com/in/username',
    baseUrl: 'https://linkedin.com/in/',
  },
  website: {
    name: 'Website',
    icon: Globe,
    color: 'text-gaming-emerald',
    placeholder: 'https://your-website.com',
    baseUrl: '',
  },
};

export default function ProfileSocialLinks({ userId, socialLinks = [], editable = false }: ProfileSocialLinksProps) {
  const [editMode, setEditMode] = useState(false);
  const [links, setLinks] = useState<SocialLink[]>(socialLinks || []);
  const [newLink, setNewLink] = useState({ platform: '', url: '', username: '' });
  const { toast } = useToast();

  // Update links when socialLinks prop changes
  useEffect(() => {
    setLinks(socialLinks || []);
  }, [socialLinks]);

  const updateSocialLinksMutation = useMutation({
    mutationFn: async (data: { socialLinks: SocialLink[] }) => {
      const response = await apiRequest('PATCH', '/api/users/social-links', data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update social links');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Social links updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/auth/user`] });
      setEditMode(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update social links",
        variant: "destructive",
      });
    },
  });

  const extractUsername = (url: string, platform: string): string => {
    try {
      const config = PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS];
      if (config.baseUrl && url.includes(config.baseUrl)) {
        return url.replace(config.baseUrl, '').split('/')[0].split('?')[0];
      }
      // Fallback: extract from URL path
      const urlObj = new URL(url);
      return urlObj.pathname.split('/')[1] || '';
    } catch {
      return '';
    }
  };

  const addSocialLink = () => {
    if (!newLink.platform || !newLink.url) {
      toast({
        title: "Missing information",
        description: "Please select a platform and enter a URL",
        variant: "destructive",
      });
      return;
    }

    // Check if platform already exists
    if (links.some(link => link.platform === newLink.platform)) {
      toast({
        title: "Platform already added",
        description: "You've already added this platform. Edit the existing link instead.",
        variant: "destructive",
      });
      return;
    }

    const username = extractUsername(newLink.url, newLink.platform);
    const updatedLinks = [...links, { ...newLink, username }];
    setLinks(updatedLinks);
    setNewLink({ platform: '', url: '', username: '' });
  };

  const removeSocialLink = (platform: string) => {
    setLinks(links.filter(link => link.platform !== platform));
  };

  const saveSocialLinks = () => {
    updateSocialLinksMutation.mutate({ socialLinks: links });
  };

  if (!editable && links.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gaming-card border-gaming-card-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Social Links
          </CardTitle>
          {editable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditMode(!editMode)}
              className="text-gaming-text-dim hover:text-white"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display existing links */}
        <div className="space-y-3">
          {links.map((link) => {
            const config = PLATFORM_CONFIGS[link.platform as keyof typeof PLATFORM_CONFIGS];
            if (!config) return null;
            
            const Icon = config.icon;
            
            return (
              <div key={link.platform} className="flex items-center justify-between p-3 bg-gaming-darker rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${config.color}`} />
                  <div>
                    <div className="text-white font-medium">{config.name}</div>
                    <div className="text-gaming-text-dim text-sm">
                      {link.username || 'Profile'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(link.url, '_blank')}
                    className="text-gaming-text-dim hover:text-white"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  {editMode && editable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSocialLink(link.platform)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add new link form */}
        {editMode && editable && (
          <div className="space-y-3 pt-4 border-t border-gaming-card-hover">
            <h4 className="text-white font-medium">Add Social Link</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select 
                value={newLink.platform}
                onValueChange={(value) => setNewLink(prev => ({ ...prev, platform: value }))}
              >
                <SelectTrigger className="bg-gaming-darker border-gaming-card-hover text-white">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent className="bg-gaming-card border-gaming-card-hover">
                  {Object.entries(PLATFORM_CONFIGS)
                    .filter(([key]) => !links.some(link => link.platform === key))
                    .map(([key, config]) => (
                    <SelectItem key={key} value={key} className="text-white hover:bg-gaming-card-hover">
                      <div className="flex items-center gap-2">
                        <config.icon className={`w-4 h-4 ${config.color}`} />
                        {config.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                placeholder={newLink.platform ? PLATFORM_CONFIGS[newLink.platform as keyof typeof PLATFORM_CONFIGS]?.placeholder || "Profile URL" : "Profile URL"}
                value={newLink.url}
                onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                className="bg-gaming-darker border-gaming-card-hover text-white"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={addSocialLink}
                size="sm"
                disabled={!newLink.platform || !newLink.url}
                className="bg-gaming-blue hover:bg-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Link
              </Button>
            </div>
          </div>
        )}

        {/* Save/Cancel buttons */}
        {editMode && editable && (
          <div className="flex gap-2 pt-4 border-t border-gaming-card-hover">
            <Button
              onClick={saveSocialLinks}
              disabled={updateSocialLinksMutation.isPending}
              className="bg-gaming-emerald hover:bg-emerald-600"
              size="sm"
            >
              {updateSocialLinksMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditMode(false);
                setLinks(socialLinks || []);
                setNewLink({ platform: '', url: '', username: '' });
              }}
              size="sm"
              className="border-gaming-card-hover hover:bg-gaming-card-hover"
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Empty state */}
        {links.length === 0 && !editMode && editable && (
          <div className="text-center py-6 text-gaming-text-dim">
            <Globe className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No social links added yet</p>
            <Button
              onClick={() => setEditMode(true)}
              variant="ghost"
              className="mt-2 text-gaming-blue hover:text-blue-400"
            >
              Add your first link
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}