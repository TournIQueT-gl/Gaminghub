import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Trophy, 
  Calendar,
  Clock,
  Star,
  MapPin,
  Gamepad2,
  DollarSign,
  Crown,
  Target
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TournamentCardProps {
  tournament: {
    id: number;
    name: string;
    description?: string;
    game: string;
    format: string;
    type: string;
    maxParticipants: number;
    participantCount: number;
    teamSize: number;
    prizePool?: string;
    entryFee?: string;
    region?: string;
    skill_level?: string;
    bannerUrl?: string;
    status: string;
    registrationEnd?: Date;
    startDate?: Date;
    endDate?: Date;
    isFeatured: boolean;
    createdBy: string;
  };
  currentUserId?: string;
  onJoin?: (tournamentId: number) => void;
  isJoining?: boolean;
}

export default function TournamentCard({ tournament, currentUserId, onJoin, isJoining }: TournamentCardProps) {
  const registrationProgress = (tournament.participantCount / tournament.maxParticipants) * 100;
  const isRegistering = tournament.status === 'registering';
  const isActive = tournament.status === 'active';
  const isCompleted = tournament.status === 'completed';
  const isFull = tournament.participantCount >= tournament.maxParticipants;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registering': return 'bg-gaming-blue';
      case 'active': return 'bg-gaming-emerald';
      case 'completed': return 'bg-gaming-purple';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gaming-text-dim';
    }
  };

  const getSkillLevelColor = (level?: string) => {
    switch (level) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-orange-400';
      case 'professional': return 'text-red-400';
      default: return 'text-gaming-text-dim';
    }
  };

  const formatTimeLeft = (date?: Date) => {
    if (!date) return null;
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return null;
    }
  };

  return (
    <Card className="bg-gaming-card border-gaming-card-hover hover:border-gaming-blue/50 transition-all duration-200 group relative overflow-hidden">
      {/* Featured Badge */}
      {tournament.isFeatured && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
            <Star className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        </div>
      )}

      {/* Banner */}
      {tournament.bannerUrl ? (
        <div className="h-32 relative overflow-hidden">
          <img 
            src={tournament.bannerUrl} 
            alt={`${tournament.name} banner`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gaming-card/80 to-transparent" />
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-r from-gaming-blue/20 to-gaming-purple/20 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <Gamepad2 className="w-12 h-12 text-gaming-blue/40" />
          </div>
        </div>
      )}

      <CardContent className="p-4 -mt-6 relative z-10">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white truncate mb-1">
                {tournament.name}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {tournament.game}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {tournament.format}
                </Badge>
                <Badge 
                  className={`text-xs text-white border-0 ${getStatusColor(tournament.status)}`}
                >
                  {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          {tournament.description && (
            <p className="text-sm text-gaming-text-dim line-clamp-2 mb-3">
              {tournament.description}
            </p>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-gaming-blue" />
              <span className="text-white font-medium">
                {tournament.participantCount}/{tournament.maxParticipants}
              </span>
              <span className="text-gaming-text-dim">players</span>
            </div>
            
            {tournament.teamSize > 1 && (
              <div className="flex items-center gap-2 text-sm text-gaming-text-dim">
                <Target className="w-4 h-4" />
                <span>Teams of {tournament.teamSize}</span>
              </div>
            )}

            {tournament.region && (
              <div className="flex items-center gap-2 text-sm text-gaming-text-dim">
                <MapPin className="w-4 h-4" />
                <span>{tournament.region}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {tournament.prizePool && parseFloat(tournament.prizePool) > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="w-4 h-4 text-gaming-emerald" />
                <span className="text-gaming-emerald font-medium">
                  ${parseFloat(tournament.prizePool).toLocaleString()}
                </span>
              </div>
            )}

            {tournament.skill_level && (
              <div className="flex items-center gap-2 text-sm">
                <Crown className={`w-4 h-4 ${getSkillLevelColor(tournament.skill_level)}`} />
                <span className={`font-medium ${getSkillLevelColor(tournament.skill_level)}`}>
                  {tournament.skill_level.charAt(0).toUpperCase() + tournament.skill_level.slice(1)}
                </span>
              </div>
            )}

            {tournament.entryFee && parseFloat(tournament.entryFee) > 0 && (
              <div className="flex items-center gap-2 text-sm text-gaming-text-dim">
                <DollarSign className="w-4 h-4" />
                <span>${parseFloat(tournament.entryFee)} entry</span>
              </div>
            )}
          </div>
        </div>

        {/* Registration Progress */}
        {isRegistering && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gaming-text-dim mb-1">
              <span>Registration Progress</span>
              <span>{registrationProgress.toFixed(0)}%</span>
            </div>
            <Progress 
              value={registrationProgress} 
              className="h-2 bg-gaming-darker"
            />
          </div>
        )}

        {/* Timing Info */}
        <div className="mb-4 space-y-1">
          {isRegistering && tournament.registrationEnd && (
            <div className="flex items-center gap-2 text-sm text-gaming-text-dim">
              <Clock className="w-4 h-4" />
              <span>Registration ends {formatTimeLeft(tournament.registrationEnd)}</span>
            </div>
          )}
          
          {tournament.startDate && (
            <div className="flex items-center gap-2 text-sm text-gaming-text-dim">
              <Calendar className="w-4 h-4" />
              <span>
                {isActive ? 'Started' : isCompleted ? 'Completed' : 'Starts'} {formatTimeLeft(tournament.startDate)}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/tournaments/${tournament.id}`} className="flex-1">
            <Button 
              variant="outline" 
              className="w-full border-gaming-card-hover hover:border-gaming-blue"
            >
              View Details
            </Button>
          </Link>
          
          {currentUserId && currentUserId !== tournament.createdBy && isRegistering && !isFull && (
            <Button
              onClick={() => onJoin?.(tournament.id)}
              disabled={isJoining}
              className="bg-gaming-blue hover:bg-blue-600"
            >
              {isJoining ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                "Join"
              )}
            </Button>
          )}

          {isFull && isRegistering && (
            <Button disabled className="bg-gaming-text-dim">
              Full
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}