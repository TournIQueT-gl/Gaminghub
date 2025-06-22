import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function TournamentWidget() {
  const { data: tournaments, isLoading } = useQuery({
    queryKey: ['/api/tournaments'],
    retry: false,
  });

  const activeTournaments = tournaments?.filter((t: any) => 
    t.status === 'active' || t.status === 'registering'
  ).slice(0, 3) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-gaming-emerald';
      case 'registering':
        return 'bg-gaming-blue';
      default:
        return 'bg-gaming-purple';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Live';
      case 'registering':
        return 'Registering';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className="bg-gaming-card border-gaming-card-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Active Tournaments</CardTitle>
          <Button variant="ghost" size="sm" className="text-gaming-blue hover:text-blue-400">
            View All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-gaming-darker rounded-lg p-4 border border-gaming-card-hover">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-gaming-card" />
                <Skeleton className="h-3 w-24 bg-gaming-card" />
                <Skeleton className="h-2 w-full bg-gaming-card" />
              </div>
            </div>
          ))
        ) : activeTournaments.length > 0 ? (
          activeTournaments.map((tournament: any) => (
            <div 
              key={tournament.id}
              className="bg-gaming-darker rounded-lg p-4 border border-gaming-card-hover hover:border-gaming-purple/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-white text-sm">{tournament.name}</h4>
                  <p className="text-xs text-gaming-text-dim">
                    {tournament.game} • {tournament.format === 'solo' ? 'Solo' : 'Team'}
                  </p>
                </div>
                <Badge className={`${getStatusColor(tournament.status)} text-white text-xs`}>
                  {getStatusLabel(tournament.status)}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gaming-text-dim mb-3">
                <span className="flex items-center space-x-1">
                  <DollarSign className="w-3 h-3" />
                  <span className="text-gaming-blue font-mono">
                    ${tournament.prizePool ? parseFloat(tournament.prizePool).toLocaleString() : '0'}
                  </span>
                </span>
                <span className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>{tournament.currentParticipants}/{tournament.maxParticipants}</span>
                </span>
              </div>
              
              <div className="bg-gaming-card rounded h-1">
                <div 
                  className="bg-gaming-purple h-1 rounded transition-all duration-300"
                  style={{ 
                    width: `${(tournament.currentParticipants / tournament.maxParticipants) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-gaming-text-dim mx-auto mb-2" />
            <p className="text-gaming-text-dim text-sm">No active tournaments</p>
          </div>
        )}
        
        <Button className="w-full bg-gaming-purple hover:bg-purple-600 text-white">
          <Trophy className="w-4 h-4 mr-2" />
          Create Tournament
        </Button>
      </CardContent>
    </Card>
  );
}
