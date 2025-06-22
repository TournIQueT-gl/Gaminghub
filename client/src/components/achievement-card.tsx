import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Lock } from "lucide-react";

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

interface AchievementCardProps {
  achievement: Achievement;
}

export default function AchievementCard({ achievement }: AchievementCardProps) {
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

  const isUnlocked = !!achievement.unlockedAt;
  const progressPercentage = achievement.maxProgress 
    ? ((achievement.progress || 0) / achievement.maxProgress) * 100 
    : 0;

  return (
    <Card 
      className={`bg-gaming-card border transition-all hover:scale-105 ${
        isUnlocked 
          ? getRarityBg(achievement.rarity)
          : 'border-gaming-card-hover opacity-60'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            isUnlocked 
              ? 'bg-gaming-darker' 
              : 'bg-gaming-darker/50'
          }`}>
            {isUnlocked ? (
              <Award className={`w-6 h-6 ${getRarityColor(achievement.rarity)}`} />
            ) : (
              <Lock className="w-6 h-6 text-gaming-text-dim" />
            )}
          </div>
          <div className="flex-1">
            <h4 className={`font-semibold ${
              isUnlocked ? 'text-white' : 'text-gaming-text-dim'
            }`}>
              {achievement.title}
            </h4>
            <Badge 
              variant="outline" 
              className={`text-xs ${getRarityColor(achievement.rarity)} border-current`}
            >
              {achievement.rarity}
            </Badge>
          </div>
        </div>
        
        <p className="text-sm text-gaming-text-dim mb-3">
          {achievement.description}
        </p>
        
        {achievement.maxProgress && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gaming-text-dim">Progress</span>
              <span className="text-gaming-blue">
                {achievement.progress || 0}/{achievement.maxProgress}
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2"
            />
          </div>
        )}
        
        {isUnlocked && achievement.unlockedAt && (
          <div className="text-xs text-gaming-text-dim mt-2 flex items-center gap-1">
            <Award className="w-3 h-3" />
            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}