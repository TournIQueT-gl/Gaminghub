import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Gamepad2,
  Trophy,
  Clock,
  Plus,
  Star,
  TrendingUp,
  Award,
  Target,
  BarChart3,
  Calendar,
  Filter,
  Search,
  Play,
  Pause,
  Users,
  Medal,
  ChevronRight,
  Zap,
  Crown,
  Timer
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Gaming() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("library");
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const { toast } = useToast();

  // User game library query
  const { data: gameLibrary = [], isLoading: isLoadingLibrary } = useQuery({
    queryKey: ['/api/users/games', { platform: platformFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (platformFilter) params.append('platform', platformFilter);

      const response = await fetch(`/api/users/games?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch game library');
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // User game sessions query
  const { data: gameSessions = [], isLoading: isLoadingSessions } = useQuery({
    queryKey: ['/api/users/game-sessions'],
    queryFn: async () => {
      const response = await fetch('/api/users/game-sessions?limit=10');
      if (!response.ok) throw new Error('Failed to fetch game sessions');
      return response.json();
    },
    enabled: isAuthenticated && activeTab === 'sessions',
  });

  // User game achievements query
  const { data: gameAchievements = [], isLoading: isLoadingAchievements } = useQuery({
    queryKey: ['/api/users/game-achievements'],
    queryFn: async () => {
      const response = await fetch('/api/users/game-achievements');
      if (!response.ok) throw new Error('Failed to fetch game achievements');
      return response.json();
    },
    enabled: isAuthenticated && activeTab === 'achievements',
  });

  // User game statistics query
  const { data: gameStats = [], isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/users/game-statistics'],
    queryFn: async () => {
      const response = await fetch('/api/users/game-statistics');
      if (!response.ok) throw new Error('Failed to fetch game statistics');
      return response.json();
    },
    enabled: isAuthenticated && activeTab === 'statistics',
  });

  // Add game to library mutation
  const addGameMutation = useMutation({
    mutationFn: async (gameData: any) => {
      const response = await apiRequest('POST', '/api/users/games', gameData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add game');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/games'] });
      toast({ title: "Game added to library!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to add game", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Start game session mutation
  const startSessionMutation = useMutation({
    mutationFn: async (gameData: any) => {
      const response = await apiRequest('POST', '/api/users/game-sessions', {
        ...gameData,
        sessionStart: new Date().toISOString(),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start session');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/games'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/game-sessions'] });
      toast({ title: "Game session started!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to start session", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleStartSession = (game: any) => {
    startSessionMutation.mutate({
      gameId: game.gameId,
      gameName: game.gameName,
      platform: game.platform,
    });
  };

  const GameCard = ({ game }: { game: any }) => (
    <Card className="bg-gaming-card border-gaming-card-hover hover:border-gaming-blue/50 transition-colors group">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-16 h-16 bg-gaming-darker rounded-lg flex items-center justify-center">
            <Gamepad2 className="w-8 h-8 text-gaming-blue" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white truncate">{game.gameName}</h3>
              {game.isFavorite && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
              {game.isPlaying && <Badge className="bg-gaming-emerald text-white">Playing</Badge>}
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gaming-text-dim mb-2">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {parseFloat(game.hoursPlayed).toFixed(1)}h
              </div>
              <Badge variant="outline" className="text-xs">
                {game.platform}
              </Badge>
              {game.skillLevel && (
                <Badge variant="outline" className="text-xs">
                  {game.skillLevel}
                </Badge>
              )}
            </div>

            {game.lastPlayed && (
              <p className="text-xs text-gaming-text-dim">
                Last played: {new Date(game.lastPlayed).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {!game.isPlaying ? (
              <Button
                size="sm"
                onClick={() => handleStartSession(game)}
                disabled={startSessionMutation.isPending}
                className="bg-gaming-emerald hover:bg-green-600"
              >
                <Play className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="border-gaming-card-hover"
              >
                <Pause className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SessionCard = ({ session }: { session: any }) => (
    <Card className="bg-gaming-card border-gaming-card-hover">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-medium text-white">{session.gameName}</h3>
            <p className="text-sm text-gaming-text-dim">{session.platform}</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {session.duration}m
          </Badge>
        </div>

        {(session.score || session.kills || session.wins) && (
          <div className="grid grid-cols-3 gap-2 text-xs">
            {session.score && (
              <div className="text-center">
                <div className="text-gaming-blue font-medium">{session.score}</div>
                <div className="text-gaming-text-dim">Score</div>
              </div>
            )}
            {session.kills && (
              <div className="text-center">
                <div className="text-gaming-emerald font-medium">{session.kills}</div>
                <div className="text-gaming-text-dim">Kills</div>
              </div>
            )}
            {session.wins > 0 && (
              <div className="text-center">
                <div className="text-yellow-400 font-medium">{session.wins}</div>
                <div className="text-gaming-text-dim">Wins</div>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gaming-text-dim mt-2">
          {new Date(session.sessionStart).toLocaleDateString()} at{' '}
          {new Date(session.sessionStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </CardContent>
    </Card>
  );

  const AchievementCard = ({ achievement }: { achievement: any }) => {
    const getRarityColor = (rarity: string) => {
      switch (rarity) {
        case 'legendary': return 'text-yellow-400';
        case 'epic': return 'text-purple-400';
        case 'rare': return 'text-blue-400';
        case 'uncommon': return 'text-green-400';
        default: return 'text-gray-400';
      }
    };

    return (
      <Card className="bg-gaming-card border-gaming-card-hover">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gaming-darker rounded-lg flex items-center justify-center">
              <Trophy className={`w-6 h-6 ${getRarityColor(achievement.rarity)}`} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-white">{achievement.title}</h3>
                <Badge variant="outline" className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                  {achievement.rarity}
                </Badge>
                {achievement.points > 0 && (
                  <Badge className="bg-gaming-blue text-white text-xs">
                    {achievement.points}pts
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-gaming-text-dim mb-2">{achievement.description}</p>
              
              {achievement.progress < achievement.maxProgress && (
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gaming-text-dim mb-1">
                    <span>Progress</span>
                    <span>{achievement.progress}/{achievement.maxProgress}</span>
                  </div>
                  <Progress 
                    value={(achievement.progress / achievement.maxProgress) * 100} 
                    className="h-1 bg-gaming-darker"
                  />
                </div>
              )}

              <div className="text-xs text-gaming-text-dim">
                Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const StatCard = ({ stat }: { stat: any }) => (
    <Card className="bg-gaming-card border-gaming-card-hover">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-gaming-darker rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-gaming-purple" />
          </div>

          <div className="flex-1">
            <h3 className="font-medium text-white mb-2">{stat.gameName}</h3>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-gaming-blue font-medium">{parseFloat(stat.totalHours).toFixed(1)}h</div>
                <div className="text-gaming-text-dim">Total Time</div>
              </div>
              <div>
                <div className="text-gaming-emerald font-medium">{stat.totalSessions}</div>
                <div className="text-gaming-text-dim">Sessions</div>
              </div>
              {stat.totalWins > 0 && (
                <>
                  <div>
                    <div className="text-yellow-400 font-medium">{parseFloat(stat.winRate).toFixed(1)}%</div>
                    <div className="text-gaming-text-dim">Win Rate</div>
                  </div>
                  <div>
                    <div className="text-gaming-purple font-medium">{stat.bestStreak}</div>
                    <div className="text-gaming-text-dim">Best Streak</div>
                  </div>
                </>
              )}
              {stat.totalKills > 0 && (
                <>
                  <div>
                    <div className="text-red-400 font-medium">{parseFloat(stat.killDeathRatio).toFixed(2)}</div>
                    <div className="text-gaming-text-dim">K/D Ratio</div>
                  </div>
                  <div>
                    <div className="text-gaming-blue font-medium">{stat.bestScore.toLocaleString()}</div>
                    <div className="text-gaming-text-dim">Best Score</div>
                  </div>
                </>
              )}
            </div>

            {stat.lastPlayed && (
              <div className="text-xs text-gaming-text-dim mt-2">
                Last played: {new Date(stat.lastPlayed).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gaming-dark text-gaming-text">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header title="Gaming" />
          
          <div className="max-w-7xl mx-auto p-6">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Gaming Dashboard</h1>
                  <p className="text-gaming-text-dim">
                    Track your gaming progress, achievements, and statistics
                  </p>
                </div>
                <Button className="bg-gaming-blue hover:bg-blue-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Game
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gaming-card border-gaming-card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gaming-blue/20 rounded-lg flex items-center justify-center">
                        <Gamepad2 className="w-5 h-5 text-gaming-blue" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{gameLibrary.length}</div>
                        <div className="text-sm text-gaming-text-dim">Games</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gaming-card border-gaming-card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gaming-emerald/20 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-gaming-emerald" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {gameStats.reduce((acc: number, stat: any) => acc + parseFloat(stat.totalHours), 0).toFixed(0)}h
                        </div>
                        <div className="text-sm text-gaming-text-dim">Total Hours</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gaming-card border-gaming-card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gaming-purple/20 rounded-lg flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-gaming-purple" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{gameAchievements.length}</div>
                        <div className="text-sm text-gaming-text-dim">Achievements</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gaming-card border-gaming-card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{gameSessions.length}</div>
                        <div className="text-sm text-gaming-text-dim">Sessions</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="bg-gaming-card border-gaming-card-hover">
                <TabsTrigger value="library">Game Library</TabsTrigger>
                <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="statistics">Statistics</TabsTrigger>
              </TabsList>

              {/* Game Library Tab */}
              <TabsContent value="library" className="space-y-6">
                {/* Filters */}
                <div className="flex gap-4 flex-wrap">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gaming-text-dim" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search your games..."
                      className="pl-10 bg-gaming-darker border-gaming-card-hover text-white"
                    />
                  </div>

                  <Select value={platformFilter} onValueChange={setPlatformFilter}>
                    <SelectTrigger className="w-48 bg-gaming-darker border-gaming-card-hover text-white">
                      <SelectValue placeholder="Filter by platform" />
                    </SelectTrigger>
                    <SelectContent className="bg-gaming-card border-gaming-card-hover">
                      <SelectItem value="">All Platforms</SelectItem>
                      <SelectItem value="pc">PC</SelectItem>
                      <SelectItem value="xbox">Xbox</SelectItem>
                      <SelectItem value="playstation">PlayStation</SelectItem>
                      <SelectItem value="nintendo">Nintendo</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                    </SelectContent>
                  </Select>

                  {(searchQuery || platformFilter) && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery("");
                        setPlatformFilter("");
                      }}
                      className="border-gaming-card-hover hover:border-gaming-blue"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>

                {/* Games Grid */}
                {isLoadingLibrary ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <Card key={i} className="bg-gaming-card border-gaming-card-hover animate-pulse">
                        <CardContent className="p-4">
                          <div className="h-16 bg-gaming-darker rounded" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : gameLibrary.length === 0 ? (
                  <div className="text-center py-12">
                    <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-gaming-text-dim" />
                    <h3 className="text-xl font-semibold text-white mb-2">No games in library</h3>
                    <p className="text-gaming-text-dim mb-4">
                      Add your first game to start tracking your gaming progress
                    </p>
                    <Button className="bg-gaming-blue hover:bg-blue-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Game
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gameLibrary
                      .filter((game: any) => 
                        !searchQuery || game.gameName.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((game: any) => (
                        <GameCard key={`${game.gameId}-${game.platform}`} game={game} />
                      ))}
                  </div>
                )}
              </TabsContent>

              {/* Recent Sessions Tab */}
              <TabsContent value="sessions" className="space-y-6">
                {isLoadingSessions ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Card key={i} className="bg-gaming-card border-gaming-card-hover animate-pulse">
                        <CardContent className="p-4">
                          <div className="h-20 bg-gaming-darker rounded" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : gameSessions.length === 0 ? (
                  <div className="text-center py-12">
                    <Timer className="w-16 h-16 mx-auto mb-4 text-gaming-text-dim" />
                    <h3 className="text-xl font-semibold text-white mb-2">No game sessions yet</h3>
                    <p className="text-gaming-text-dim">
                      Start playing games to see your session history here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {gameSessions.map((session: any) => (
                      <SessionCard key={session.id} session={session} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="space-y-6">
                {isLoadingAchievements ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <Card key={i} className="bg-gaming-card border-gaming-card-hover animate-pulse">
                        <CardContent className="p-4">
                          <div className="h-20 bg-gaming-darker rounded" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : gameAchievements.length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 mx-auto mb-4 text-gaming-text-dim" />
                    <h3 className="text-xl font-semibold text-white mb-2">No achievements unlocked</h3>
                    <p className="text-gaming-text-dim">
                      Play games and complete challenges to unlock achievements
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gameAchievements.map((achievement: any) => (
                      <AchievementCard key={achievement.id} achievement={achievement} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Statistics Tab */}
              <TabsContent value="statistics" className="space-y-6">
                {isLoadingStats ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <Card key={i} className="bg-gaming-card border-gaming-card-hover animate-pulse">
                        <CardContent className="p-4">
                          <div className="h-32 bg-gaming-darker rounded" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : gameStats.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gaming-text-dim" />
                    <h3 className="text-xl font-semibold text-white mb-2">No statistics available</h3>
                    <p className="text-gaming-text-dim">
                      Play games to generate detailed statistics and insights
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gameStats.map((stat: any) => (
                      <StatCard key={`${stat.userId}-${stat.gameId}`} stat={stat} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}