import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { 
  Trophy, 
  Heart, 
  MessageCircle, 
  Users, 
  GamepadIcon,
  Calendar,
  Clock,
  TrendingUp,
  Star,
  Target
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: 'post_like' | 'comment' | 'achievement' | 'follow' | 'clan_join' | 'tournament_join' | 'level_up';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: any;
}

interface ProfileActivityFeedProps {
  userId: string;
  isOwnProfile: boolean;
}

export default function ProfileActivityFeed({ userId, isOwnProfile }: ProfileActivityFeedProps) {
  const { data: activities, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}/activity`],
    enabled: !!userId,
    retry: false,
  });

  // Mock activities for demonstration
  const mockActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'achievement',
      title: 'New Achievement Unlocked!',
      description: 'Earned "First Victory" achievement',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      metadata: { achievement: 'First Victory', rarity: 'common' }
    },
    {
      id: '2',
      type: 'level_up',
      title: 'Level Up!',
      description: 'Reached level 15',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      metadata: { level: 15, xp: 1500 }
    },
    {
      id: '3',
      type: 'post_like',
      title: 'Post Popular',
      description: 'Your post about "Epic Valorant Clutch" received 50 likes',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      metadata: { likes: 50, postId: 1 }
    },
    {
      id: '4',
      type: 'follow',
      title: 'New Follower',
      description: 'GamerPro123 started following you',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      metadata: { follower: 'GamerPro123' }
    },
    {
      id: '5',
      type: 'tournament_join',
      title: 'Tournament Joined',
      description: 'Joined "Weekly CS:GO Championship"',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      metadata: { tournament: 'Weekly CS:GO Championship' }
    },
    {
      id: '6',
      type: 'comment',
      title: 'New Comment',
      description: 'Someone commented on your post about gaming setup',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
      metadata: { postId: 2, commenter: 'TechGuru' }
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="w-5 h-5 text-gaming-gold" />;
      case 'level_up':
        return <TrendingUp className="w-5 h-5 text-gaming-emerald" />;
      case 'post_like':
        return <Heart className="w-5 h-5 text-red-400" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-gaming-blue" />;
      case 'follow':
        return <Users className="w-5 h-5 text-gaming-purple" />;
      case 'clan_join':
        return <Users className="w-5 h-5 text-gaming-gold" />;
      case 'tournament_join':
        return <Target className="w-5 h-5 text-gaming-blue" />;
      default:
        return <Star className="w-5 h-5 text-gaming-text-dim" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'border-gaming-gold bg-gaming-gold/10';
      case 'level_up':
        return 'border-gaming-emerald bg-gaming-emerald/10';
      case 'post_like':
        return 'border-red-400 bg-red-400/10';
      case 'comment':
        return 'border-gaming-blue bg-gaming-blue/10';
      case 'follow':
        return 'border-gaming-purple bg-gaming-purple/10';
      case 'clan_join':
        return 'border-gaming-gold bg-gaming-gold/10';
      case 'tournament_join':
        return 'border-gaming-blue bg-gaming-blue/10';
      default:
        return 'border-gaming-card-hover bg-gaming-darker/50';
    }
  };

  const formatTimeAgo = (date: Date) => {
    if (!date || !(date instanceof Date)) {
      return 'Unknown';
    }
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const displayActivities = Array.isArray(activities) ? activities : mockActivities;

  return (
    <Card className="bg-gaming-card border-gaming-card-hover">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-gaming-darker rounded-lg">
                <div className="w-10 h-10 bg-gaming-card rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gaming-card rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gaming-card rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : Array.isArray(displayActivities) && displayActivities.length > 0 ? (
          <div className="space-y-3">
            {displayActivities.map((activity) => (
              <div 
                key={activity.id} 
                className={`flex items-start gap-3 p-3 rounded-lg border ${getActivityColor(activity.type)} hover:bg-gaming-card-hover/30 transition-colors`}
              >
                <div className="w-10 h-10 rounded-full bg-gaming-darker flex items-center justify-center flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium text-sm">{activity.title}</h4>
                  <p className="text-gaming-text-dim text-sm mt-1">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs border-gaming-card-hover">
                      {formatTimeAgo(activity.timestamp)}
                    </Badge>
                    {activity.metadata?.rarity && (
                      <Badge variant="outline" className={`text-xs ${
                        activity.metadata.rarity === 'legendary' ? 'text-gaming-gold border-gaming-gold' :
                        activity.metadata.rarity === 'epic' ? 'text-gaming-purple border-gaming-purple' :
                        activity.metadata.rarity === 'rare' ? 'text-gaming-blue border-gaming-blue' :
                        'text-gaming-emerald border-gaming-emerald'
                      }`}>
                        {activity.metadata.rarity}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gaming-text-dim">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{isOwnProfile ? "No activity yet" : "No recent activity"}</p>
            <p className="text-sm mt-1">
              {isOwnProfile ? "Start gaming to see your activity here!" : "Check back later for updates"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}