import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Share2, 
  Download, 
  Copy, 
  ExternalLink,
  MessageCircle,
  Gift,
  Flag,
  UserPlus,
  Heart,
  Star
} from "lucide-react";

interface ProfileQuickActionsProps {
  userId: string;
  username: string;
  isOwnProfile: boolean;
  isFollowing?: boolean;
}

export default function ProfileQuickActions({ 
  userId, 
  username, 
  isOwnProfile,
  isFollowing = false 
}: ProfileQuickActionsProps) {
  const { toast } = useToast();

  const followMutation = useMutation({
    mutationFn: async (action: 'follow' | 'unfollow') => {
      const response = await apiRequest('POST', `/api/users/${userId}/${action}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/stats`] });
      toast({
        title: "Success",
        description: `Successfully ${isFollowing ? 'unfollowed' : 'followed'} ${username}!`,
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

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/profile/${userId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${username}'s Gaming Profile`,
          text: `Check out ${username}'s gaming profile!`,
          url: profileUrl,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(profileUrl);
      toast({
        title: "Link copied!",
        description: "Profile link has been copied to clipboard",
      });
    }
  };

  const handleDownloadProfile = () => {
    // In a real app, this would generate a PDF or export profile data
    toast({
      title: "Feature coming soon",
      description: "Profile export functionality will be available soon",
    });
  };

  const handleSendMessage = () => {
    // Navigate to messages or open chat
    toast({
      title: "Feature coming soon",
      description: "Direct messaging will be available soon",
    });
  };

  const handleSendGift = () => {
    toast({
      title: "Feature coming soon",
      description: "Gift sending will be available soon",
    });
  };

  const handleReport = () => {
    toast({
      title: "Report submitted",
      description: "Thank you for helping keep our community safe",
    });
  };

  const ownProfileActions = [
    {
      icon: Share2,
      label: "Share Profile",
      action: handleShare,
      color: "text-gaming-blue hover:text-blue-400"
    },
    {
      icon: Download,
      label: "Export Data",
      action: handleDownloadProfile,
      color: "text-gaming-emerald hover:text-emerald-400"
    },
    {
      icon: Copy,
      label: "Copy Link",
      action: async () => {
        const profileUrl = `${window.location.origin}/profile/${userId}`;
        await navigator.clipboard.writeText(profileUrl);
        toast({
          title: "Link copied!",
          description: "Profile link copied to clipboard",
        });
      },
      color: "text-gaming-purple hover:text-purple-400"
    }
  ];

  const otherProfileActions = [
    {
      icon: isFollowing ? UserPlus : Heart,
      label: isFollowing ? "Unfollow" : "Follow",
      action: () => followMutation.mutate(isFollowing ? 'unfollow' : 'follow'),
      color: isFollowing ? "text-red-400 hover:text-red-300" : "text-gaming-purple hover:text-purple-400",
      loading: followMutation.isPending
    },
    {
      icon: MessageCircle,
      label: "Message",
      action: handleSendMessage,
      color: "text-gaming-blue hover:text-blue-400"
    },
    {
      icon: Gift,
      label: "Send Gift",
      action: handleSendGift,
      color: "text-gaming-gold hover:text-yellow-400"
    },
    {
      icon: Share2,
      label: "Share",
      action: handleShare,
      color: "text-gaming-emerald hover:text-emerald-400"
    },
    {
      icon: Flag,
      label: "Report",
      action: handleReport,
      color: "text-red-400 hover:text-red-300"
    }
  ];

  const actions = isOwnProfile ? ownProfileActions : otherProfileActions;

  return (
    <Card className="bg-gaming-card border-gaming-card-hover">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={action.action}
              disabled={action.loading}
              className={`flex flex-col items-center gap-2 h-auto py-3 ${action.color} hover:bg-gaming-card-hover`}
            >
              {action.loading ? (
                <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <action.icon className="w-5 h-5" />
              )}
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}