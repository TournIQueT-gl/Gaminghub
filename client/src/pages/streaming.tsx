import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Video,
  VideoOff,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share,
  Settings,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  MoreHorizontal,
  Radio,
  Wifi,
  WifiOff,
  Clock,
  Calendar,
  Trophy,
  Star,
  Plus,
  Search,
  Filter,
  CircleDot
} from "lucide-react";

export default function Streaming() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("browse");
  const [isCreateStreamOpen, setIsCreateStreamOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Live streams query
  const { data: liveStreams = [], isLoading } = useQuery({
    queryKey: ['/api/streams', { status: 'live' }],
    queryFn: async () => {
      const response = await fetch('/api/streams?status=live&limit=20');
      if (!response.ok) throw new Error('Failed to fetch live streams');
      return response.json();
    },
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // User's streams query
  const { data: userStreams = [] } = useQuery({
    queryKey: ['/api/streams', { streamerId: user?.id }],
    queryFn: async () => {
      const response = await fetch(`/api/streams?streamerId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch user streams');
      return response.json();
    },
    enabled: isAuthenticated && activeTab === 'my-streams',
  });

  // Create stream mutation
  const createStreamMutation = useMutation({
    mutationFn: async (streamData: any) => {
      const response = await apiRequest('POST', '/api/streams', streamData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create stream');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/streams'] });
      setIsCreateStreamOpen(false);
      toast({ title: "Stream created successfully!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create stream", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Follow stream mutation
  const followMutation = useMutation({
    mutationFn: async (streamId: number) => {
      const response = await apiRequest('POST', `/api/streams/${streamId}/follow`);
      if (!response.ok) throw new Error('Failed to follow stream');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/streams'] });
      toast({ title: "Following stream!" });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      case 'starting': return 'bg-yellow-500';
      case 'ending': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live': return 'LIVE';
      case 'offline': return 'OFFLINE';
      case 'starting': return 'STARTING';
      case 'ending': return 'ENDING';
      default: return 'UNKNOWN';
    }
  };

  const formatViewerCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const StreamCard = ({ stream }: { stream: any }) => (
    <Card className="bg-gaming-card border-gaming-card-hover hover:border-gaming-blue/50 transition-colors group cursor-pointer">
      <CardContent className="p-0">
        <div className="relative">
          {stream.thumbnailUrl ? (
            <img 
              src={stream.thumbnailUrl} 
              alt={stream.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-48 bg-gaming-darker rounded-t-lg flex items-center justify-center">
              <Video className="w-16 h-16 text-gaming-text-dim" />
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <Badge className={`${getStatusColor(stream.status)} text-white px-2 py-1 text-xs font-bold`}>
              <CircleDot className="w-2 h-2 mr-1 animate-pulse" />
              {getStatusText(stream.status)}
            </Badge>
          </div>

          {/* Viewer Count */}
          {stream.status === 'live' && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-black/50 text-white">
                <Eye className="w-3 h-3 mr-1" />
                {formatViewerCount(stream.viewerCount)}
              </Badge>
            </div>
          )}

          {/* Duration for offline streams */}
          {stream.duration && stream.status === 'offline' && (
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="bg-black/50 text-white text-xs">
                {Math.floor(stream.duration / 60)}h {stream.duration % 60}m
              </Badge>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gaming-purple rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white line-clamp-2 group-hover:text-gaming-blue transition-colors mb-1">
                {stream.title}
              </h3>
              
              <p className="text-sm text-gaming-text-dim mb-2">
                Streamer • {stream.game || 'Just Chatting'}
              </p>

              {stream.description && (
                <p className="text-xs text-gaming-text-dim line-clamp-2 mb-3">
                  {stream.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gaming-text-dim">
                  {stream.status === 'live' ? (
                    <>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {stream.viewerCount.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Live
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(stream.updatedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {stream.status === 'live' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      followMutation.mutate(stream.id);
                    }}
                    className="h-6 text-xs border-gaming-card-hover hover:border-gaming-blue"
                  >
                    Follow
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CreateStreamDialog = () => (
    <Dialog open={isCreateStreamOpen} onOpenChange={setIsCreateStreamOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red-600 hover:bg-red-700">
          <Radio className="w-4 h-4 mr-2" />
          Go Live
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gaming-card border-gaming-card-hover max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Stream</DialogTitle>
          <DialogDescription>
            Set up your stream details before going live
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          createStreamMutation.mutate({
            title: formData.get('title'),
            description: formData.get('description'),
            game: formData.get('game'),
            category: formData.get('category'),
            isPublic: formData.get('isPublic') === 'on',
            allowChat: formData.get('allowChat') === 'on',
            allowDonations: formData.get('allowDonations') === 'on',
          });
        }} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-white">Stream Title</label>
            <Input
              name="title"
              required
              placeholder="Enter stream title..."
              className="bg-gaming-darker border-gaming-card-hover text-white"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-white">Description</label>
            <Textarea
              name="description"
              placeholder="What's your stream about?"
              className="bg-gaming-darker border-gaming-card-hover text-white"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-white">Game</label>
              <Input
                name="game"
                placeholder="e.g., Valorant, CS2..."
                className="bg-gaming-darker border-gaming-card-hover text-white"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-white">Category</label>
              <Select name="category" defaultValue="gaming">
                <SelectTrigger className="bg-gaming-darker border-gaming-card-hover text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gaming-card border-gaming-card-hover">
                  <SelectItem value="gaming">Gaming</SelectItem>
                  <SelectItem value="just_chatting">Just Chatting</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="art">Art</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                defaultChecked
                className="rounded border-gaming-card-hover"
              />
              <label htmlFor="isPublic" className="text-sm text-white">
                Public Stream
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allowChat"
                name="allowChat"
                defaultChecked
                className="rounded border-gaming-card-hover"
              />
              <label htmlFor="allowChat" className="text-sm text-white">
                Allow Chat
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allowDonations"
                name="allowDonations"
                defaultChecked
                className="rounded border-gaming-card-hover"
              />
              <label htmlFor="allowDonations" className="text-sm text-white">
                Allow Donations
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateStreamOpen(false)}
              className="border-gaming-card-hover"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createStreamMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {createStreamMutation.isPending ? 'Creating...' : 'Go Live'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gaming-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please log in</h1>
          <p className="text-gaming-text-dim">You need to be logged in to access streaming</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gaming-dark text-gaming-text">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header title="Streaming" />
          
          <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Live Streaming</h1>
                <p className="text-gaming-text-dim">
                  Watch live streams and broadcast your gameplay
                </p>
              </div>
              <CreateStreamDialog />
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <Card className="bg-gaming-card border-gaming-card-hover">
                <CardContent className="p-4 text-center">
                  <Radio className="w-8 h-8 mx-auto mb-2 text-red-500" />
                  <div className="text-2xl font-bold text-white">{liveStreams.length}</div>
                  <div className="text-sm text-gaming-text-dim">Live Streams</div>
                </CardContent>
              </Card>
              <Card className="bg-gaming-card border-gaming-card-hover">
                <CardContent className="p-4 text-center">
                  <Eye className="w-8 h-8 mx-auto mb-2 text-gaming-blue" />
                  <div className="text-2xl font-bold text-white">
                    {liveStreams.reduce((sum, stream) => sum + stream.viewerCount, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gaming-text-dim">Total Viewers</div>
                </CardContent>
              </Card>
              <Card className="bg-gaming-card border-gaming-card-hover">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gaming-purple" />
                  <div className="text-2xl font-bold text-white">247</div>
                  <div className="text-sm text-gaming-text-dim">Active Streamers</div>
                </CardContent>
              </Card>
              <Card className="bg-gaming-card border-gaming-card-hover">
                <CardContent className="p-4 text-center">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                  <div className="text-2xl font-bold text-white">12</div>
                  <div className="text-sm text-gaming-text-dim">Featured</div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gaming-text-dim w-4 h-4" />
                <Input
                  placeholder="Search streams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gaming-card border-gaming-card-hover text-white"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 bg-gaming-card border-gaming-card-hover text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gaming-card border-gaming-card-hover">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="gaming">Gaming</SelectItem>
                  <SelectItem value="just_chatting">Just Chatting</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="art">Art</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Streaming Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-gaming-card border-gaming-card-hover mb-6">
                <TabsTrigger value="browse" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Browse
                </TabsTrigger>
                <TabsTrigger value="live" className="flex items-center gap-2">
                  <Radio className="w-4 h-4" />
                  Live Now
                </TabsTrigger>
                <TabsTrigger value="my-streams" className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  My Streams
                </TabsTrigger>
                <TabsTrigger value="following" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Following
                </TabsTrigger>
              </TabsList>

              <TabsContent value="browse">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <Card key={i} className="bg-gaming-card border-gaming-card-hover">
                        <CardContent className="p-0">
                          <div className="space-y-3 animate-pulse">
                            <div className="h-48 bg-gaming-darker rounded-t-lg" />
                            <div className="p-4">
                              <div className="h-4 bg-gaming-darker rounded w-3/4 mb-2" />
                              <div className="h-3 bg-gaming-darker rounded w-1/2" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : liveStreams.length === 0 ? (
                  <div className="text-center py-12">
                    <VideoOff className="w-16 h-16 mx-auto mb-4 text-gaming-text-dim" />
                    <h3 className="text-xl font-semibold text-white mb-2">No live streams</h3>
                    <p className="text-gaming-text-dim">Be the first to go live!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {liveStreams.map((stream: any) => (
                      <StreamCard key={stream.id} stream={stream} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="live">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {liveStreams.filter((stream: any) => stream.status === 'live').map((stream: any) => (
                    <StreamCard key={stream.id} stream={stream} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="my-streams">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {userStreams.map((stream: any) => (
                    <StreamCard key={stream.id} stream={stream} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="following">
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-gaming-text-dim" />
                  <h3 className="text-xl font-semibold text-white mb-2">Following</h3>
                  <p className="text-gaming-text-dim">Streams from people you follow will appear here</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}