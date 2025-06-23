import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Crown, 
  Trophy, 
  Star,
  Lock,
  Globe,
  MapPin,
  Gamepad2
} from "lucide-react";

interface ClanCardProps {
  clan: {
    id: number;
    name: string;
    tag: string;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
    isPrivate: boolean;
    memberLimit: number;
    level: number;
    xp: number;
    trophies: number;
    wins?: number;
    losses?: number;
    region?: string;
    games?: string[];
    memberCount: number;
    createdBy: string;
  };
  currentUserId?: string;
  onJoin?: (clanId: number) => void;
  onApply?: (clanId: number) => void;
  isJoining?: boolean;
}

export default function ClanCard({ clan, currentUserId, onJoin, onApply, isJoining }: ClanCardProps) {
  const winRate = clan.wins && clan.losses ? 
    (clan.wins / (clan.wins + clan.losses)) * 100 : 0;

  const nextLevelXP = (clan.level + 1) * 1000;
  const currentLevelXP = clan.level * 1000;
  const levelProgress = ((clan.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  const getRarityColor = (level: number) => {
    if (level >= 50) return "text-yellow-400"; // Legendary
    if (level >= 25) return "text-purple-400"; // Epic  
    if (level >= 10) return "text-blue-400"; // Rare
    return "text-gray-400"; // Common
  };

  return (
    <Card className="bg-gaming-card border-gaming-card-hover hover:border-gaming-blue/50 transition-all duration-200 group">
      {/* Banner */}
      {clan.bannerUrl && (
        <div className="h-20 bg-gradient-to-r from-gaming-blue/20 to-gaming-purple/20 rounded-t-lg relative overflow-hidden">
          <img 
            src={clan.bannerUrl} 
            alt={`${clan.name} banner`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="relative">
            <Avatar className="w-12 h-12 ring-2 ring-gaming-card-hover">
              <AvatarImage src={clan.logoUrl} />
              <AvatarFallback className="bg-gaming-darker text-white font-bold">
                {clan.tag}
              </AvatarFallback>
            </Avatar>
            {clan.isPrivate && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gaming-card rounded-full flex items-center justify-center">
                <Lock className="w-2 h-2 text-gaming-text-dim" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white truncate">
                {clan.name}
              </h3>
              <Badge variant="outline" className="text-xs">
                [{clan.tag}]
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gaming-text-dim">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {clan.memberCount}/{clan.memberLimit}
              </div>
              <div className="flex items-center gap-1">
                <Crown className={`w-3 h-3 ${getRarityColor(clan.level)}`} />
                Level {clan.level}
              </div>
              {clan.region && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {clan.region}
                </div>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 text-gaming-emerald">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-medium">{clan.trophies.toLocaleString()}</span>
            </div>
            {winRate > 0 && (
              <div className="text-xs text-gaming-text-dim">
                {winRate.toFixed(1)}% WR
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {clan.description && (
          <p className="text-sm text-gaming-text-dim mb-3 line-clamp-2">
            {clan.description}
          </p>
        )}

        {/* Level Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gaming-text-dim mb-1">
            <span>Level {clan.level}</span>
            <span>{clan.xp.toLocaleString()} / {nextLevelXP.toLocaleString()} XP</span>
          </div>
          <Progress 
            value={levelProgress} 
            className="h-1 bg-gaming-darker"
          />
        </div>

        {/* Games */}
        {clan.games && clan.games.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1 mb-1">
              <Gamepad2 className="w-3 h-3 text-gaming-text-dim" />
              <span className="text-xs text-gaming-text-dim">Games</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {clan.games.slice(0, 3).map((game) => (
                <Badge key={game} variant="outline" className="text-xs py-0">
                  {game}
                </Badge>
              ))}
              {clan.games.length > 3 && (
                <Badge variant="outline" className="text-xs py-0">
                  +{clan.games.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="flex justify-between items-center text-xs text-gaming-text-dim mb-3">
          <div className="flex gap-3">
            {clan.wins !== undefined && (
              <div>
                <span className="text-gaming-emerald">{clan.wins}W</span>
                {clan.losses !== undefined && (
                  <span className="text-gaming-text-dim"> / {clan.losses}L</span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {clan.isPrivate ? (
              <>
                <Lock className="w-3 h-3" />
                <span>Private</span>
              </>
            ) : (
              <>
                <Globe className="w-3 h-3" />
                <span>Public</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/clans/${clan.id}`} className="flex-1">
            <Button 
              variant="outline" 
              className="w-full border-gaming-card-hover hover:border-gaming-blue"
            >
              View Details
            </Button>
          </Link>
          
          {currentUserId && currentUserId !== clan.createdBy && (
            <Button
              onClick={() => clan.isPrivate ? onApply?.(clan.id) : onJoin?.(clan.id)}
              disabled={isJoining || clan.memberCount >= clan.memberLimit}
              className="bg-gaming-blue hover:bg-blue-600"
            >
              {isJoining ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : clan.isPrivate ? (
                "Apply"
              ) : (
                "Join"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}