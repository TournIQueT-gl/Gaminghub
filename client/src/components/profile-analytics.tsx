import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar,
  BarChart3,
  PieChart,
  Users,
  Star
} from "lucide-react";

interface AnalyticsData {
  totalViews: number;
  viewsChange: number;
  engagement: number;
  engagementChange: number;
  followersGained: number;
  followersChange: number;
  postsThisWeek: number;
  postsChange: number;
  topPerformingPost: {
    id: number;
    title: string;
    likes: number;
    views: number;
  };
  monthlyStats: {
    month: string;
    posts: number;
    likes: number;
    views: number;
  }[];
}

interface ProfileAnalyticsProps {
  data: AnalyticsData;
  isOwnProfile: boolean;
}

export default function ProfileAnalytics({ data, isOwnProfile }: ProfileAnalyticsProps) {
  if (!isOwnProfile) {
    return null; // Only show analytics to profile owner
  }

  const getChangeIcon = (change: number) => {
    return change >= 0 ? (
      <TrendingUp className="w-4 h-4 text-gaming-emerald" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-400" />
    );
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-gaming-emerald' : 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gaming-card border-gaming-card-hover">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Profile Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gaming-darker rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gaming-text-dim">Profile Views</span>
                {getChangeIcon(data.viewsChange)}
              </div>
              <div className="text-2xl font-bold text-white">{data.totalViews.toLocaleString()}</div>
              <div className={`text-sm ${getChangeColor(data.viewsChange)}`}>
                {data.viewsChange >= 0 ? '+' : ''}{data.viewsChange}% this week
              </div>
            </div>

            <div className="p-4 bg-gaming-darker rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gaming-text-dim">Engagement Rate</span>
                {getChangeIcon(data.engagementChange)}
              </div>
              <div className="text-2xl font-bold text-white">{data.engagement}%</div>
              <div className={`text-sm ${getChangeColor(data.engagementChange)}`}>
                {data.engagementChange >= 0 ? '+' : ''}{data.engagementChange}% this week
              </div>
            </div>

            <div className="p-4 bg-gaming-darker rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gaming-text-dim">New Followers</span>
                {getChangeIcon(data.followersChange)}
              </div>
              <div className="text-2xl font-bold text-white">{data.followersGained}</div>
              <div className={`text-sm ${getChangeColor(data.followersChange)}`}>
                {data.followersChange >= 0 ? '+' : ''}{data.followersChange}% this week
              </div>
            </div>

            <div className="p-4 bg-gaming-darker rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gaming-text-dim">Posts This Week</span>
                {getChangeIcon(data.postsChange)}
              </div>
              <div className="text-2xl font-bold text-white">{data.postsThisWeek}</div>
              <div className={`text-sm ${getChangeColor(data.postsChange)}`}>
                {data.postsChange >= 0 ? '+' : ''}{data.postsChange}% vs last week
              </div>
            </div>
          </div>

          {/* Top Performing Post */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3">Top Performing Post</h4>
            <div className="p-4 bg-gaming-darker rounded-lg border border-gaming-gold/20">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-gaming-gold" />
                <span className="font-medium text-white">{data.topPerformingPost.title}</span>
              </div>
              <div className="flex gap-4 text-sm text-gaming-text-dim">
                <span>{data.topPerformingPost.likes} likes</span>
                <span>{data.topPerformingPost.views} views</span>
              </div>
            </div>
          </div>

          {/* Monthly Trends */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Monthly Trends</h4>
            <div className="space-y-3">
              {data.monthlyStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gaming-darker rounded-lg">
                  <span className="text-white font-medium">{stat.month}</span>
                  <div className="flex gap-6 text-sm">
                    <span className="text-gaming-blue">{stat.posts} posts</span>
                    <span className="text-gaming-purple">{stat.likes} likes</span>
                    <span className="text-gaming-emerald">{stat.views} views</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals and Achievements Progress */}
      <Card className="bg-gaming-card border-gaming-card-hover">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Goals & Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white">Reach 1000 followers</span>
                <span className="text-sm text-gaming-text-dim">650/1000</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white">Post 50 times this month</span>
                <span className="text-sm text-gaming-text-dim">32/50</span>
              </div>
              <Progress value={64} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white">Achieve 90% engagement rate</span>
                <span className="text-sm text-gaming-text-dim">{data.engagement}/90%</span>
              </div>
              <Progress value={(data.engagement / 90) * 100} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white">Join a tournament</span>
                <Badge variant="outline" className="border-gaming-gold text-gaming-gold">
                  Completed
                </Badge>
              </div>
              <Progress value={100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}