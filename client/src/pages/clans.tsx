import { useEffect } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { LoadingPage } from "@/components/loading-spinner";
import CreateClanForm from "@/components/forms/create-clan-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { checkGuestLimitation, GUEST_LIMITATIONS } from "@/lib/authUtils";
import GuestLimitationBanner from "@/components/guest-limitation-banner";
import { Shield, Users, Crown, Star, TrendingUp } from "lucide-react";

export default function Clans() {
  const { toast } = useToast();
  const { isAuthenticated, isGuest, isLoading } = useAuth();

  const { data: clans, isLoading: clansLoading, error } = useQuery({
    queryKey: ['/api/clans'],
    retry: false,
  });

  // Limit clans for guests
  const displayClans = isGuest && clans ? clans.slice(0, GUEST_LIMITATIONS.maxViewableItems) : clans;

  const joinClanMutation = useMutation({
    mutationFn: async ({ clanId }: { clanId: number }) => {
      await apiRequest('POST', `/api/clans/${clanId}/join`, {});
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Successfully joined clan!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clans'] });
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
        description: error.message || "Failed to join clan",
        variant: "destructive",
      });
    },
  });

  const getClanInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 1:
        return <Star className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Star className="w-5 h-5 text-amber-600" />;
      default:
        return <Shield className="w-5 h-5 text-gaming-blue" />;
    }
  };

  if (isLoading) {
    return <LoadingPage text="Loading clans..." />;
  }

  return (
    <div className="min-h-screen bg-gaming-dark text-gaming-text">
      <div className="flex">
        <Sidebar />
        
        <div className="flex-1 ml-64">
          <Header title="Clans" />
          
          <div className="p-6">
            {/* Clan Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gaming-card border-gaming-card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gaming-text-dim">Total Clans</CardTitle>
                  <Shield className="h-4 w-4 text-gaming-purple" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{clans?.length || 0}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gaming-card border-gaming-card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gaming-text-dim">Top Clan XP</CardTitle>
                  <TrendingUp className="h-4 w-4 text-gaming-emerald" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {clans?.[0]?.xp?.toLocaleString() || '0'}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gaming-card border-gaming-card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gaming-text-dim">Active Members</CardTitle>
                  <Users className="h-4 w-4 text-gaming-blue" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {clans?.reduce((sum: number, clan: any) => sum + clan.memberCount, 0) || 0}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gaming-card border-gaming-card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gaming-text-dim">Public Clans</CardTitle>
                  <Shield className="h-4 w-4 text-gaming-emerald" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {clans?.filter((clan: any) => clan.isPublic).length || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Clans Leaderboard */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Clan Leaderboard</h2>
                {isAuthenticated && <CreateClanForm />}
              </div>
              
              {/* Guest Banner */}
              {isGuest && (
                <GuestLimitationBanner 
                  message="Viewing in guest mode - limited to 10 clans"
                  feature="full clan access"
                />
              )}
              
              {clansLoading ? (
                <div className="grid gap-6">
                  {[...Array(5)].map((_, i) => (
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
              ) : displayClans && displayClans.length > 0 ? (
                <div className="grid gap-4">
                  {displayClans.map((clan: any, index: number) => (
                    <Card key={clan.id} className="bg-gaming-card border-gaming-card-hover hover:border-gaming-purple/30 transition-colors">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                {getRankIcon(index)}
                                <span className="text-lg font-bold text-gaming-text-dim">
                                  #{index + 1}
                                </span>
                              </div>
                              <div className="w-12 h-12 clan-badge rounded-lg flex items-center justify-center text-white font-bold">
                                {getClanInitials(clan.name)}
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex items-center space-x-3">
                                <CardTitle className="text-white text-xl">{clan.name}</CardTitle>
                                {clan.isPublic ? (
                                  <Badge className="bg-gaming-emerald text-white">Open</Badge>
                                ) : (
                                  <Badge className="bg-gaming-red text-white">Invite Only</Badge>
                                )}
                              </div>
                              {clan.description && (
                                <CardDescription className="text-gaming-text-dim">
                                  {clan.description}
                                </CardDescription>
                              )}
                              <div className="flex items-center space-x-4 text-sm text-gaming-text-dim">
                                <span className="flex items-center space-x-1">
                                  <Users className="w-4 h-4" />
                                  <span>{clan.memberCount} members</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <TrendingUp className="w-4 h-4" />
                                  <span className="text-gaming-emerald font-mono">
                                    {clan.xp.toLocaleString()} XP
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {clan.isPublic && (
                            <Button
                              onClick={() => {
        if (!checkGuestLimitation('canJoinClans', isAuthenticated)) {
          toast({
            title: "Sign in required",
            description: "Sign in to join clans",
            variant: "destructive",
          });
          return;
        }
        joinClanMutation.mutate({ clanId: clan.id });
      }}
                              disabled={joinClanMutation.isPending}
                              className="bg-gaming-blue hover:bg-blue-600"
                            >
                              {joinClanMutation.isPending ? 'Joining...' : 'Join Clan'}
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-gaming-card border-gaming-card-hover">
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gaming-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-gaming-purple" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">No clans yet</h3>
                      <p className="text-gaming-text-dim mb-4">
                        Be the first to create a clan and start building your gaming community!
                      </p>
                      <CreateClanForm />
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
