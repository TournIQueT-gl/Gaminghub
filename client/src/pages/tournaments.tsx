import { useEffect } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { LoadingPage } from "@/components/loading-spinner";
import CreateTournamentForm from "@/components/forms/create-tournament-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Trophy, Users, Calendar, DollarSign } from "lucide-react";

export default function Tournaments() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: tournaments, isLoading: tournamentsLoading, error } = useQuery({
    queryKey: ['/api/tournaments'],
    retry: false,
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  const joinTournamentMutation = useMutation({
    mutationFn: async ({ tournamentId }: { tournamentId: number }) => {
      await apiRequest('POST', `/api/tournaments/${tournamentId}/join`, {});
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Successfully joined tournament!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to join tournament",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registering':
        return 'bg-gaming-blue';
      case 'active':
        return 'bg-gaming-emerald';
      case 'completed':
        return 'bg-gaming-text-dim';
      default:
        return 'bg-gaming-purple';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'registering':
        return 'Registering';
      case 'active':
        return 'Live';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  if (isLoading) {
    return <LoadingPage text="Loading tournaments..." />;
  }

  return (
    <div className="min-h-screen bg-gaming-dark text-gaming-text">
      <div className="flex">
        <Sidebar />
        
        <div className="flex-1 ml-64">
          <Header title="Tournaments" />
          
          <div className="p-6">
            {/* Tournament Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gaming-card border-gaming-card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gaming-text-dim">Total Tournaments</CardTitle>
                  <Trophy className="h-4 w-4 text-gaming-blue" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{tournaments?.length || 0}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gaming-card border-gaming-card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gaming-text-dim">Active Now</CardTitle>
                  <Users className="h-4 w-4 text-gaming-emerald" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {tournaments?.filter((t: any) => t.status === 'active').length || 0}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gaming-card border-gaming-card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gaming-text-dim">Registering</CardTitle>
                  <Calendar className="h-4 w-4 text-gaming-purple" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {tournaments?.filter((t: any) => t.status === 'registering').length || 0}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gaming-card border-gaming-card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gaming-text-dim">Total Prize Pool</CardTitle>
                  <DollarSign className="h-4 w-4 text-gaming-blue" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    ${tournaments?.reduce((sum: number, t: any) => sum + (parseFloat(t.prizePool) || 0), 0).toLocaleString() || '0'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tournaments List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">All Tournaments</h2>
                <CreateTournamentForm />
              </div>
              
              {tournamentsLoading ? (
                <div className="grid gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="bg-gaming-card border-gaming-card-hover">
                      <CardHeader>
                        <div className="animate-pulse">
                          <div className="h-6 bg-gaming-darker rounded w-48 mb-2" />
                          <div className="h-4 bg-gaming-darker rounded w-32" />
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : tournaments && tournaments.length > 0 ? (
                <div className="grid gap-6">
                  {tournaments.map((tournament: any) => (
                    <Card key={tournament.id} className="bg-gaming-card border-gaming-card-hover hover:border-gaming-blue/30 transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <CardTitle className="text-white text-xl">{tournament.name}</CardTitle>
                              <Badge className={`${getStatusColor(tournament.status)} text-white`}>
                                {getStatusLabel(tournament.status)}
                              </Badge>
                            </div>
                            <CardDescription className="text-gaming-text-dim">
                              {tournament.description}
                            </CardDescription>
                            <div className="flex items-center space-x-4 text-sm text-gaming-text-dim">
                              <span className="flex items-center space-x-1">
                                <Trophy className="w-4 h-4" />
                                <span>{tournament.game}</span>
                              </span>
                              <span>{tournament.format === 'solo' ? 'Solo' : 'Team'}</span>
                              {tournament.prizePool && (
                                <span className="text-gaming-blue font-mono">
                                  ${parseFloat(tournament.prizePool).toLocaleString()} Prize Pool
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {tournament.status === 'registering' && (
                            <Button
                              onClick={() => joinTournamentMutation.mutate({ tournamentId: tournament.id })}
                              disabled={joinTournamentMutation.isPending}
                              className="bg-gaming-blue hover:bg-blue-600"
                            >
                              {joinTournamentMutation.isPending ? 'Joining...' : 'Join Tournament'}
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gaming-text-dim">Participants</span>
                            <span className="font-mono text-gaming-blue">
                              {tournament.currentParticipants}/{tournament.maxParticipants}
                            </span>
                          </div>
                          
                          <Progress 
                            value={(tournament.currentParticipants / tournament.maxParticipants) * 100}
                            className="h-2"
                          />
                          
                          {tournament.startDate && (
                            <div className="flex items-center justify-between text-sm text-gaming-text-dim">
                              <span>Start Date</span>
                              <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-gaming-card border-gaming-card-hover">
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gaming-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-8 h-8 text-gaming-purple" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">No tournaments yet</h3>
                      <p className="text-gaming-text-dim mb-4">
                        Be the first to create a tournament and start competing!
                      </p>
                      <CreateTournamentForm />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
