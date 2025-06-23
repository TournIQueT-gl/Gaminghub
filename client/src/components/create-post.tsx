import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, Gamepad2, Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { checkGuestLimitation } from "@/lib/authUtils";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [gameTag, setGameTag] = useState("");
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string; gameTag?: string }) => {
      await apiRequest('POST', '/api/posts', postData);
    },
    onSuccess: () => {
      setContent("");
      setGameTag("");
      toast({
        title: "Post created!",
        description: "Your post has been shared with the community.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const generateHashtagsMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', '/api/ai/hashtags', { content });
      return response.json();
    },
    onSuccess: (data) => {
      const hashtags = data.hashtags.map((tag: string) => `#${tag}`).join(' ');
      setContent(prev => `${prev}\n\n${hashtags}`);
      toast({
        title: "Hashtags generated!",
        description: "AI-powered hashtags have been added to your post.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate hashtags",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to create posts",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Post content cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    createPostMutation.mutate({
      content: content.trim(),
      gameTag: gameTag || undefined,
    });
  };

  const handleGenerateHashtags = () => {
    if (!content.trim()) {
      toast({
        title: "Add content first",
        description: "Write some content before generating hashtags.",
        variant: "destructive",
      });
      return;
    }
    generateHashtagsMutation.mutate(content);
  };

  return (
    <div className="bg-gaming-card rounded-xl p-6 border border-gaming-card-hover">
      <div className="flex items-start space-x-4">
        <img 
          src={user?.profileImageUrl || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50"} 
          alt="Your avatar" 
          className="w-12 h-12 rounded-lg object-cover"
        />
        <div className="flex-1">
          <Textarea
            placeholder="Share your gaming moment, achievement, or thoughts with the community..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-gaming-darker border-gaming-card-hover rounded-lg p-4 resize-none focus:outline-none focus:border-gaming-blue transition-colors min-h-[120px]"
          />
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-gaming-text-dim hover:text-gaming-blue">
                <Image className="w-4 h-4 mr-2" />
                <span className="text-sm">Photo/Video</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-gaming-text-dim hover:text-gaming-purple">
                <Gamepad2 className="w-4 h-4 mr-2" />
                <span className="text-sm">Game</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleGenerateHashtags}
                disabled={generateHashtagsMutation.isPending}
                className="text-gaming-text-dim hover:text-gaming-emerald"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {generateHashtagsMutation.isPending ? 'Generating...' : 'AI Hashtags'}
                </span>
              </Button>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || createPostMutation.isPending}
              className="bg-gaming-blue hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {createPostMutation.isPending ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
