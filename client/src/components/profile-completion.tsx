import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Camera, 
  FileText, 
  MapPin, 
  Globe, 
  Gamepad2,
  CheckCircle,
  Circle
} from "lucide-react";

interface ProfileCompletionProps {
  user: any;
  onEditProfile: () => void;
}

export default function ProfileCompletion({ user, onEditProfile }: ProfileCompletionProps) {
  const completionItems = [
    {
      id: 'profile_picture',
      label: 'Profile Picture',
      icon: Camera,
      completed: !!user?.profileImage,
      points: 15,
    },
    {
      id: 'bio',
      label: 'Bio',
      icon: FileText,
      completed: !!(user?.bio && user.bio.length > 10),
      points: 10,
    },
    {
      id: 'location',
      label: 'Location',
      icon: MapPin,
      completed: !!user?.location,
      points: 5,
    },
    {
      id: 'website',
      label: 'Website',
      icon: Globe,
      completed: !!user?.website,
      points: 5,
    },
    {
      id: 'favorite_games',
      label: 'Favorite Games',
      icon: Gamepad2,
      completed: !!(user?.favoriteGames && user.favoriteGames.length >= 3),
      points: 10,
    },
  ];

  const completedItems = completionItems.filter(item => item.completed);
  const totalPoints = completionItems.reduce((sum, item) => sum + item.points, 0);
  const earnedPoints = completedItems.reduce((sum, item) => sum + item.points, 0);
  const completionPercentage = (earnedPoints / totalPoints) * 100;

  const getCompletionLevel = (percentage: number) => {
    if (percentage >= 90) return { level: 'Expert', color: 'text-gaming-gold', bg: 'bg-gaming-gold/20' };
    if (percentage >= 70) return { level: 'Advanced', color: 'text-gaming-purple', bg: 'bg-gaming-purple/20' };
    if (percentage >= 50) return { level: 'Intermediate', color: 'text-gaming-blue', bg: 'bg-gaming-blue/20' };
    return { level: 'Beginner', color: 'text-gaming-emerald', bg: 'bg-gaming-emerald/20' };
  };

  const completionLevel = getCompletionLevel(completionPercentage);

  if (completionPercentage >= 100) {
    return null; // Hide when profile is complete
  }

  return (
    <Card className="bg-gaming-card border-gaming-card-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <User className="w-5 h-5 mr-2" />
            Profile Completion
          </CardTitle>
          <Badge className={`${completionLevel.color} ${completionLevel.bg} border-current`}>
            {completionLevel.level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gaming-text-dim">
              {completedItems.length}/{completionItems.length} completed
            </span>
            <span className="text-gaming-blue font-mono">
              {Math.round(completionPercentage)}%
            </span>
          </div>
          <Progress value={completionPercentage} className="h-3" />
          <div className="text-xs text-gaming-text-dim">
            {earnedPoints}/{totalPoints} points earned
          </div>
        </div>

        <div className="space-y-2">
          {completionItems.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gaming-card-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  {item.completed ? (
                    <CheckCircle className="w-4 h-4 text-gaming-emerald" />
                  ) : (
                    <Circle className="w-4 h-4 text-gaming-text-dim" />
                  )}
                  <Icon className="w-4 h-4 text-gaming-text-dim" />
                  <span className={`text-sm ${item.completed ? 'text-white' : 'text-gaming-text-dim'}`}>
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gaming-blue">+{item.points}</span>
                  {item.completed && (
                    <Badge variant="outline" className="text-xs border-gaming-emerald text-gaming-emerald">
                      ✓
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Button 
          onClick={onEditProfile}
          className="w-full bg-gaming-purple hover:bg-purple-600"
        >
          Complete Profile
        </Button>
      </CardContent>
    </Card>
  );
}