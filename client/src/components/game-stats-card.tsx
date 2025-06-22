import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Clock, Target, TrendingUp } from "lucide-react";

interface GameStats {
  game: string;
  hoursPlayed: number;
  rank: string;
  level: number;
  winRate: number;
  lastPlayed: Date;
}

interface GameStatsCardProps {
  stats: GameStats;
}

export default function GameStatsCard({ stats }: GameStatsCardProps) {
  const getGameIcon = (game: string) => {
    // In a real app, you'd have actual game icons
    return <Gamepad2 className="w-6 h-6 text-white" />;
  };

  const getRankColor = (rank: string) => {
    const rankLower = rank.toLowerCase();
    if (rankLower.includes('diamond') || rankLower.includes('immortal')) return 'text-gaming-blue';
    if (rankLower.includes('gold') || rankLower.includes('platinum')) return 'text-gaming-gold';
    if (rankLower.includes('silver')) return 'text-gray-400';
    if (rankLower.includes('bronze')) return 'text-orange-400';
    return 'text-gaming-emerald';
  };

  const getTimeSinceLastPlayed = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <Card className="bg-gaming-card border-gaming-card-hover hover:border-gaming-blue/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gaming-purple rounded-lg flex items-center justify-center">
            {getGameIcon(stats.game)}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-white text-lg">{stats.game}</h4>
            <div className="flex items-center gap-2 text-sm text-gaming-text-dim">
              <Clock className="w-3 h-3" />
              <span>Last played {getTimeSinceLastPlayed(stats.lastPlayed)}</span>
            </div>
          </div>
          <Badge className={`${getRankColor(stats.rank)} bg-transparent border-current`}>
            {stats.rank}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gaming-darker rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-gaming-blue" />
            </div>
            <div className="text-lg font-bold text-gaming-blue">{stats.hoursPlayed}h</div>
            <div className="text-xs text-gaming-text-dim">Hours Played</div>
          </div>
          
          <div className="text-center p-3 bg-gaming-darker rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-4 h-4 text-gaming-emerald" />
            </div>
            <div className="text-lg font-bold text-gaming-emerald">{stats.level}</div>
            <div className="text-xs text-gaming-text-dim">Level</div>
          </div>
          
          <div className="text-center p-3 bg-gaming-darker rounded-lg col-span-2">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-gaming-gold" />
            </div>
            <div className="text-lg font-bold text-gaming-gold">{stats.winRate}%</div>
            <div className="text-xs text-gaming-text-dim">Win Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}