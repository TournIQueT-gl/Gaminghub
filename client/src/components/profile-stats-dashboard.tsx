import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  Target, 
  Trophy, 
  Users, 
  Calendar,
  Zap,
  Star,
  Award,
  Clock,
  BarChart3
} from "lucide-react";

interface ProfileStatsDashboardProps {
  userId: string;
  userStats: any;
  isOwnProfile: boolean;
}

export default function ProfileStatsDashboard({ userId, userStats, isOwnProfile }: ProfileStatsDashboardProps) {
  const { data: detailedStats } = useQuery({
    queryKey: [`/api/users/${userId}/detailed-stats`],
    enabled: !!userId,
    retry: false,
  });

  // Enhanced stats with detailed metrics
  const enhancedStats = {
    level: userStats?.level || 1,
    xp: userStats?.xp || 0,
    postsCount: userStats?.postsCount || 0,
    followersCount: userStats?.followersCount || 0,
    followingCount: userStats?.followingCount || 0,
    achievementsCount: 5, // From mock data
    totalLikes: 127,
    totalComments: 45,
    totalViews: 2847,
    winRate: 67,
    hoursPlayed: 245,
    gamesPlayed: 3,
    streakDays: 7,
    rankPosition: 1247,
  };

  const currentLevelXP = (enhancedStats.level - 1) * 1000;
  const nextLevelXP = enhancedStats.level * 1000;
  const levelProgress = ((enhancedStats.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  const statCards = [
    {
      title: "Level Progress",
      value: `Level ${enhancedStats.level}`,
      subtitle: `${enhancedStats.xp.toLocaleString()} XP`,
      icon: TrendingUp,
      color: "text-gaming-emerald",
      bgColor: "bg-gaming-emerald/10",
      progress: levelProgress,
      details: `${(nextLevelXP - enhancedStats.xp).toLocaleString()} XP to next level`
    },
    {
      title: "Social Impact",
      value: enhancedStats.followersCount.toLocaleString(),
      subtitle: "Followers",
      icon: Users,
      color: "text-gaming-purple",
      bgColor: "bg-gaming-purple/10",
      trend: "+12% this month"
    },
    {
      title: "Content Stats",
      value: enhancedStats.postsCount.toLocaleString(),
      subtitle: "Posts Created",
      icon: BarChart3,
      color: "text-gaming-blue",
      bgColor: "bg-gaming-blue/10",
      additional: `${enhancedStats.totalLikes} likes, ${enhancedStats.totalComments} comments`
    },
    {
      title: "Gaming Performance",
      value: `${enhancedStats.winRate}%`,
      subtitle: "Win Rate",
      icon: Target,
      color: "text-gaming-gold",
      bgColor: "bg-gaming-gold/10",
      additional: `${enhancedStats.hoursPlayed}h played across ${enhancedStats.gamesPlayed} games`
    },
    {
      title: "Achievements",
      value: enhancedStats.achievementsCount.toLocaleString(),
      subtitle: "Unlocked",
      icon: Trophy,
      color: "text-gaming-gold",
      bgColor: "bg-gaming-gold/10",
      progress: (enhancedStats.achievementsCount / 20) * 100,
      details: `${20 - enhancedStats.achievementsCount} achievements remaining`
    },
    {
      title: "Activity Streak",
      value: `${enhancedStats.streakDays}`,
      subtitle: "Days",
      icon: Zap,
      color: "text-gaming-emerald",
      bgColor: "bg-gaming-emerald/10",
      trend: "🔥 On fire!"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-gaming-card border-gaming-card-hover hover:border-gaming-blue/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                {stat.trend && (
                  <Badge variant="outline" className="text-xs border-gaming-emerald text-gaming-emerald">
                    {stat.trend}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-gaming-text-dim text-sm font-medium">{stat.title}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                  <span className="text-gaming-text-dim text-sm">{stat.subtitle}</span>
                </div>
                
                {stat.progress !== undefined && (
                  <div className="space-y-1">
                    <Progress value={stat.progress} className="h-2" />
                    <p className="text-xs text-gaming-text-dim">{stat.details}</p>
                  </div>
                )}
                
                {stat.additional && (
                  <p className="text-xs text-gaming-text-dim">{stat.additional}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analytics - Only for own profile */}
      {isOwnProfile && (
        <Card className="bg-gaming-card border-gaming-card-hover">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gaming-darker rounded-lg">
                <div className="text-lg font-bold text-gaming-blue">{enhancedStats.totalViews.toLocaleString()}</div>
                <div className="text-xs text-gaming-text-dim">Profile Views</div>
              </div>
              <div className="text-center p-3 bg-gaming-darker rounded-lg">
                <div className="text-lg font-bold text-gaming-purple">#${enhancedStats.rankPosition.toLocaleString()}</div>
                <div className="text-xs text-gaming-text-dim">Global Rank</div>
              </div>
              <div className="text-center p-3 bg-gaming-darker rounded-lg">
                <div className="text-lg font-bold text-gaming-emerald">{enhancedStats.totalLikes}</div>
                <div className="text-xs text-gaming-text-dim">Total Likes</div>
              </div>
              <div className="text-center p-3 bg-gaming-darker rounded-lg">
                <div className="text-lg font-bold text-gaming-gold">{enhancedStats.streakDays}</div>
                <div className="text-xs text-gaming-text-dim">Day Streak</div>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white text-sm">Next Level Progress</span>
                  <span className="text-gaming-blue text-sm font-mono">{Math.round(levelProgress)}%</span>
                </div>
                <Progress value={levelProgress} className="h-3" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white text-sm">Achievement Completion</span>
                  <span className="text-gaming-gold text-sm font-mono">{enhancedStats.achievementsCount}/20</span>
                </div>
                <Progress value={(enhancedStats.achievementsCount / 20) * 100} className="h-3" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white text-sm">Profile Completeness</span>
                  <span className="text-gaming-emerald text-sm font-mono">85%</span>
                </div>
                <Progress value={85} className="h-3" />
              </div>
            </div>

            {/* Goals Section */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <Target className="w-4 h-4" />
                Current Goals
              </h4>
              <div className="space-y-2">
                {[
                  { name: "Reach Level 20", current: enhancedStats.level, target: 20, color: "gaming-emerald" },
                  { name: "Get 1000 Followers", current: enhancedStats.followersCount, target: 1000, color: "gaming-purple" },
                  { name: "Unlock 15 Achievements", current: enhancedStats.achievementsCount, target: 15, color: "gaming-gold" },
                ].map((goal, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gaming-darker rounded-lg">
                    <div>
                      <span className="text-white text-sm font-medium">{goal.name}</span>
                      <div className="text-xs text-gaming-text-dim mt-1">
                        {goal.current}/{goal.target} ({Math.round((goal.current / goal.target) * 100)}%)
                      </div>
                    </div>
                    <Progress value={(goal.current / goal.target) * 100} className="w-24 h-2" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}