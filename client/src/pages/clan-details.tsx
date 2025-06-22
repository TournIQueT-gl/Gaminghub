import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { LoadingPage } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Trophy, Crown, Star, Calendar, TrendingUp } from "lucide-react";

export default function ClanDetails() {
  const params = useParams();
  const clanId = parseInt(params.id || "0");
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: clan, isLoading: clanLoading } = useQuery({
    queryKey: ['/api/clans', clanId],
    queryFn: async () => {
      const response = await fetch(`/api/clans/${clanId}`);
      if (!response.ok) throw new Error('Failed to fetch clan');
      return response.json();
    },
    enabled: !!clanId,
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['/api/clans', clanId, 'members'],
    queryFn: async () => {
      const response = await fetch(`/api/clans/${clanId}/members`);
      if (!response.ok) throw new Error('Failed to fetch members');
      return response.json();
    },
    enabled: !!clanId,
  });

  const { data: userMembership } = useQuery({
    queryKey: ['/api/users/clan-membership'],
    retry: false,
  });

  const joinClanMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/clans/${clanId}/join`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "You have joined the clan!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clans', clanId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/clan-membership'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join clan",
        variant: "destructive",
      });
    },
  });

  if (clanLoading) {
    return <LoadingPage text="Loading clan details..." />;
  }

  if (!clan) {
    return (
      <div className="min-h-screen bg-gaming-dark text-gaming-text">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 ml-64">
            <Header title="Clan Not Found" />
            <div className="p-6">
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gaming-text-dim mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Clan Not Found</h1>
                <p className="text-gaming-text-dim">The clan you're looking for doesn't exist.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isCurrentUserMember = userMembership?.clan?.id === clanId;
  const isLeader = clan.leaderId === user?.id;

  return (
    <div className="min-h-screen bg-gaming-dark text-gaming-text">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header title={clan.name} />
          
          <div className="p-6 space-y-6">
            {/* Clan Header */}
            <Card className="bg-gaming-card border-gaming-card-hover">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-gaming-purple to-gaming-blue rounded-xl flex items-center justify-center">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-2xl text-white">{clan.name}</CardTitle>
                        {isLeader && (
                          <Badge variant="outline" className="border-gaming-gold text-gaming-gold">
                            <Crown className="w-3 h-3 mr-1" />
                            Leader
                          </Badge>
                        )}
                      </div>
                      <p className="text-gaming-text-dim mt-1">
                        {clan.description || "No description provided"}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4 text-gaming-blue" />
                          <span className="text-sm text-gaming-text">{clan.memberCount || 0} members</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-4 h-4 text-gaming-emerald" />
                          <span className="text-sm text-gaming-text">{clan.xp || 0} XP</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-gaming-text-dim" />
                          <span className="text-sm text-gaming-text-dim">
                            Created {new Date(clan.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {!isCurrentUserMember && (
                    <Button 
                      onClick={() => joinClanMutation.mutate()}
                      disabled={joinClanMutation.isPending}
                      className="bg-gaming-purple hover:bg-purple-600"
                    >
                      {joinClanMutation.isPending ? "Joining..." : "Join Clan"}
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Clan Content */}
            <Tabs defaultValue="members" className="space-y-4">
              <TabsList className="bg-gaming-darker border-gaming-card-hover">
                <TabsTrigger value="members" className="data-[state=active]:bg-gaming-card">
                  <Users className="w-4 h-4 mr-2" />
                  Members
                </TabsTrigger>
                <TabsTrigger value="activity" className="data-[state=active]:bg-gaming-card">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Activity
                </TabsTrigger>
                <TabsTrigger value="tournaments" className="data-[state=active]:bg-gaming-card">
                  <Trophy className="w-4 h-4 mr-2" />
                  Tournaments
                </TabsTrigger>
              </TabsList>

              <TabsContent value="members" className="space-y-4">
                <Card className="bg-gaming-card border-gaming-card-hover">
                  <CardHeader>
                    <CardTitle className="text-white">Clan Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {membersLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center space-x-3 p-3 rounded-lg animate-pulse">
                            <div className="w-10 h-10 bg-gaming-darker rounded-full" />
                            <div className="flex-1 space-y-1">
                              <div className="h-4 bg-gaming-darker rounded w-24" />
                              <div className="h-3 bg-gaming-darker rounded w-16" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : members && members.length > 0 ? (
                      <div className="space-y-3">
                        {members.map((member: any) => (
                          <div 
                            key={member.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-gaming-card-hover transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={member.user.profileImage} />
                                <AvatarFallback className="bg-gaming-purple">
                                  {member.user.username[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium text-white">{member.user.username}</h4>
                                <p className="text-sm text-gaming-text-dim">
                                  Level {member.user.level || 1} • {member.user.xp || 0} XP
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant={member.role === 'leader' ? 'default' : 'outline'}
                                className={member.role === 'leader' ? 'bg-gaming-gold text-black' : ''}
                              >
                                {member.role === 'leader' && <Crown className="w-3 h-3 mr-1" />}
                                {member.role}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gaming-text-dim mx-auto mb-2" />
                        <p className="text-gaming-text-dim">No members yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <Card className="bg-gaming-card border-gaming-card-hover">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <TrendingUp className="w-12 h-12 text-gaming-text-dim mx-auto mb-2" />
                      <p className="text-gaming-text-dim">No recent activity</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tournaments" className="space-y-4">
                <Card className="bg-gaming-card border-gaming-card-hover">
                  <CardHeader>
                    <CardTitle className="text-white">Clan Tournaments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Trophy className="w-12 h-12 text-gaming-text-dim mx-auto mb-2" />
                      <p className="text-gaming-text-dim">No tournaments yet</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}