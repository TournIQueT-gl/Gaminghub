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
  Image,
  FileText,
  Upload,
  Plus,
  Eye,
  Heart,
  Download,
  Share,
  Edit,
  Trash2,
  Play,
  Pause,
  MoreHorizontal,
  Filter,
  Search,
  Calendar,
  User,
  Clock,
  Star,
  Bookmark
} from "lucide-react";

export default function Content() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("browse");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  // Content query
  const { data: content = [], isLoading } = useQuery({
    queryKey: ['/api/content', { type: selectedType === 'all' ? undefined : selectedType }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);
      if (searchQuery) params.append('search', searchQuery);
      params.append('limit', '20');

      const response = await fetch(`/api/content?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch content');
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // User's content query
  const { data: userContent = [] } = useQuery({
    queryKey: ['/api/content', { creatorId: user?.id }],
    queryFn: async () => {
      const response = await fetch(`/api/content?creatorId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch user content');
      return response.json();
    },
    enabled: isAuthenticated && activeTab === 'my-content',
  });

  // Upload content mutation
  const uploadMutation = useMutation({
    mutationFn: async (contentData: any) => {
      const response = await apiRequest('POST', '/api/content', contentData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload content');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content'] });
      setIsUploadOpen(false);
      toast({ title: "Content uploaded successfully!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to upload content", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Like content mutation
  const likeMutation = useMutation({
    mutationFn: async (contentId: number) => {
      const response = await apiRequest('POST', `/api/content/${contentId}/like`);
      if (!response.ok) throw new Error('Failed to like content');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content'] });
    },
  });

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'clip': return <Play className="w-4 h-4" />;
      case 'screenshot': return <Image className="w-4 h-4" />;
      case 'guide': return <FileText className="w-4 h-4" />;
      case 'review': return <Star className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleUpload = (data: any) => {
    uploadMutation.mutate(data);
  };

  const ContentCard = ({ item }: { item: any }) => (
    <Card className="bg-gaming-card border-gaming-card-hover hover:border-gaming-blue/50 transition-colors group">
      <CardContent className="p-4">
        <div className="relative mb-3">
          {item.thumbnailUrl ? (
            <img 
              src={item.thumbnailUrl} 
              alt={item.title}
              className="w-full h-32 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-32 bg-gaming-darker rounded-lg flex items-center justify-center">
              {getContentIcon(item.type)}
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge className="bg-gaming-purple/80 text-white text-xs">
              {getContentIcon(item.type)}
              <span className="ml-1 capitalize">{item.type}</span>
            </Badge>
          </div>
          {item.duration && (
            <div className="absolute bottom-2 right-2">
              <Badge variant="secondary" className="text-xs">
                {formatDuration(item.duration)}
              </Badge>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-white line-clamp-2 group-hover:text-gaming-blue transition-colors">
            {item.title}
          </h3>
          
          {item.description && (
            <p className="text-sm text-gaming-text-dim line-clamp-2">
              {item.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-gaming-text-dim">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {item.viewCount.toLocaleString()}
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {item.likeCount.toLocaleString()}
            </div>
            {item.downloadCount > 0 && (
              <div className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                {item.downloadCount.toLocaleString()}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gaming-purple rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs text-gaming-text-dim">
                {item.creatorId === user?.id ? 'You' : 'Creator'}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => likeMutation.mutate(item.id)}
                className="h-6 w-6 p-0 hover:text-red-400"
              >
                <Heart className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:text-gaming-blue"
              >
                <Bookmark className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:text-gaming-emerald"
              >
                <Share className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const UploadDialog = () => (
    <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gaming-blue hover:bg-gaming-blue/90">
          <Plus className="w-4 h-4 mr-2" />
          Upload Content
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gaming-card border-gaming-card-hover max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Upload New Content</DialogTitle>
          <DialogDescription>
            Share your gaming content with the community
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleUpload({
            type: formData.get('type'),
            title: formData.get('title'),
            description: formData.get('description'),
            game: formData.get('game'),
            tags: formData.get('tags')?.toString().split(',').map(tag => tag.trim()),
            visibility: formData.get('visibility'),
          });
        }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-white">Content Type</label>
              <Select name="type" defaultValue="video">
                <SelectTrigger className="bg-gaming-darker border-gaming-card-hover text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gaming-card border-gaming-card-hover">
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="clip">Clip</SelectItem>
                  <SelectItem value="screenshot">Screenshot</SelectItem>
                  <SelectItem value="guide">Guide</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-white">Visibility</label>
              <Select name="visibility" defaultValue="public">
                <SelectTrigger className="bg-gaming-darker border-gaming-card-hover text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gaming-card border-gaming-card-hover">
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="unlisted">Unlisted</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-white">Title</label>
            <Input
              name="title"
              required
              placeholder="Enter content title..."
              className="bg-gaming-darker border-gaming-card-hover text-white"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-white">Description</label>
            <Textarea
              name="description"
              placeholder="Describe your content..."
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
              <label className="text-sm font-medium text-white">Tags</label>
              <Input
                name="tags"
                placeholder="gameplay, tips, funny (comma separated)"
                className="bg-gaming-darker border-gaming-card-hover text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUploadOpen(false)}
              className="border-gaming-card-hover"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploadMutation.isPending}
              className="bg-gaming-blue hover:bg-gaming-blue/90"
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
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
          <p className="text-gaming-text-dim">You need to be logged in to access content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gaming-dark text-gaming-text">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header title="Content" />
          
          <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Content Library</h1>
                <p className="text-gaming-text-dim">
                  Discover and share amazing gaming content
                </p>
              </div>
              <UploadDialog />
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gaming-text-dim w-4 h-4" />
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gaming-card border-gaming-card-hover text-white"
                />
              </div>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-48 bg-gaming-card border-gaming-card-hover text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gaming-card border-gaming-card-hover">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="clip">Clips</SelectItem>
                  <SelectItem value="screenshot">Screenshots</SelectItem>
                  <SelectItem value="guide">Guides</SelectItem>
                  <SelectItem value="review">Reviews</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-gaming-card border-gaming-card-hover mb-6">
                <TabsTrigger value="browse" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Browse
                </TabsTrigger>
                <TabsTrigger value="my-content" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  My Content
                </TabsTrigger>
                <TabsTrigger value="liked" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Liked
                </TabsTrigger>
                <TabsTrigger value="saved" className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4" />
                  Saved
                </TabsTrigger>
              </TabsList>

              <TabsContent value="browse">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <Card key={i} className="bg-gaming-card border-gaming-card-hover">
                        <CardContent className="p-4">
                          <div className="space-y-3 animate-pulse">
                            <div className="h-32 bg-gaming-darker rounded-lg" />
                            <div className="h-4 bg-gaming-darker rounded w-3/4" />
                            <div className="h-3 bg-gaming-darker rounded w-1/2" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : content.length === 0 ? (
                  <div className="text-center py-12">
                    <Video className="w-16 h-16 mx-auto mb-4 text-gaming-text-dim" />
                    <h3 className="text-xl font-semibold text-white mb-2">No content found</h3>
                    <p className="text-gaming-text-dim">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {content.map((item: any) => (
                      <ContentCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="my-content">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {userContent.map((item: any) => (
                    <ContentCard key={item.id} item={item} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="liked">
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-gaming-text-dim" />
                  <h3 className="text-xl font-semibold text-white mb-2">Liked Content</h3>
                  <p className="text-gaming-text-dim">Content you've liked will appear here</p>
                </div>
              </TabsContent>

              <TabsContent value="saved">
                <div className="text-center py-12">
                  <Bookmark className="w-16 h-16 mx-auto mb-4 text-gaming-text-dim" />
                  <h3 className="text-xl font-semibold text-white mb-2">Saved Content</h3>
                  <p className="text-gaming-text-dim">Content you've saved will appear here</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}