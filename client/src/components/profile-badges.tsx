import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, 
  Crown, 
  Star, 
  Zap, 
  Trophy,
  Target,
  Award,
  Flame,
  Heart,
  Users
} from "lucide-react";

interface ProfileBadge {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  earned: boolean;
  earnedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

interface ProfileBadgesProps {
  userId: string;
  isOwnProfile: boolean;
}

export default function ProfileBadges({ userId, isOwnProfile }: ProfileBadgesProps) {
  const badges: ProfileBadge[] = [
    {
      id: 'verified',
      name: 'Verified Gamer',
      description: 'Verified gaming profile',
      icon: Shield,
      color: 'text-gaming-blue',
      bgColor: 'bg-gaming-blue/20 border-gaming-blue',
      earned: true,
      earnedAt: new Date('2024-01-15')
    },
    {
      id: 'level_master',
      name: 'Level Master',
      description: 'Reached level 50',
      icon: Crown,
      color: 'text-gaming-gold',
      bgColor: 'bg-gaming-gold/20 border-gaming-gold',
      earned: false,
      progress: 15,
      maxProgress: 50
    },
    {
      id: 'social_star',
      name: 'Social Star',
      description: 'Get 1000 followers',
      icon: Star,
      color: 'text-gaming-purple',
      bgColor: 'bg-gaming-purple/20 border-gaming-purple',
      earned: false,
      progress: 250,
      maxProgress: 1000
    },
    {
      id: 'streak_legend',
      name: 'Streak Legend',
      description: '30-day activity streak',
      icon: Flame,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/20 border-orange-400',
      earned: false,
      progress: 7,
      maxProgress: 30
    },
    {
      id: 'tournament_winner',
      name: 'Tournament Champion',
      description: 'Won first tournament',
      icon: Trophy,
      color: 'text-gaming-gold',
      bgColor: 'bg-gaming-gold/20 border-gaming-gold',
      earned: false
    },
    {
      id: 'community_hero',
      name: 'Community Hero',
      description: 'Helped 100 community members',
      icon: Heart,
      color: 'text-red-400',
      bgColor: 'bg-red-400/20 border-red-400',
      earned: true,
      earnedAt: new Date('2024-02-01')
    }
  ];

  const earnedBadges = badges.filter(badge => badge.earned);
  const inProgressBadges = badges.filter(badge => !badge.earned && badge.progress !== undefined);
  const lockedBadges = badges.filter(badge => !badge.earned && badge.progress === undefined);

  const BadgeCard = ({ badge }: { badge: ProfileBadge }) => {
    const Icon = badge.icon;
    const progressPercentage = badge.progress && badge.maxProgress 
      ? (badge.progress / badge.maxProgress) * 100 
      : 0;

    return (
      <div 
        className={`relative p-4 rounded-lg border transition-all hover:scale-105 ${
          badge.earned 
            ? badge.bgColor
            : 'border-gaming-card-hover bg-gaming-darker/50 opacity-60'
        }`}
      >
        <div className="text-center">
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
            badge.earned ? 'bg-gaming-darker' : 'bg-gaming-card'
          }`}>
            <Icon className={`w-6 h-6 ${badge.earned ? badge.color : 'text-gaming-text-dim'}`} />
          </div>
          
          <h4 className={`font-semibold text-sm mb-1 ${
            badge.earned ? 'text-white' : 'text-gaming-text-dim'
          }`}>
            {badge.name}
          </h4>
          
          <p className="text-xs text-gaming-text-dim mb-3">
            {badge.description}
          </p>

          {badge.earned && badge.earnedAt && (
            <Badge variant="outline" className="text-xs border-gaming-emerald text-gaming-emerald">
              Earned {badge.earnedAt.toLocaleDateString()}
            </Badge>
          )}

          {!badge.earned && badge.progress !== undefined && badge.maxProgress && (
            <div className="space-y-2">
              <div className="w-full bg-gaming-card rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${badge.color.replace('text-', 'bg-')}`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="text-xs text-gaming-blue">
                {badge.progress}/{badge.maxProgress}
              </div>
            </div>
          )}

          {!badge.earned && badge.progress === undefined && (
            <Badge variant="outline" className="text-xs border-gaming-text-dim text-gaming-text-dim">
              Locked
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-gaming-card border-gaming-card-hover">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Award className="w-5 h-5" />
          Badges & Recognition
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Earned Badges */}
        {earnedBadges.length > 0 && (
          <div>
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-gaming-gold" />
              Earned ({earnedBadges.length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {earnedBadges.map(badge => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          </div>
        )}

        {/* In Progress Badges */}
        {inProgressBadges.length > 0 && (
          <div>
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-gaming-blue" />
              In Progress ({inProgressBadges.length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {inProgressBadges.map(badge => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          </div>
        )}

        {/* Locked Badges */}
        {lockedBadges.length > 0 && isOwnProfile && (
          <div>
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-gaming-text-dim" />
              Locked ({lockedBadges.length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {lockedBadges.map(badge => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {earnedBadges.length === 0 && inProgressBadges.length === 0 && (
          <div className="text-center py-8 text-gaming-text-dim">
            <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{isOwnProfile ? "No badges earned yet" : "No badges to display"}</p>
            {isOwnProfile && (
              <p className="text-sm mt-1">Complete achievements to earn your first badge!</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}