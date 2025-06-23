import { useState } from "react";
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: {
    id: number;
    content: string;
    hashtags?: string[];
    mediaUrls?: string[];
    gameTag?: string;
    likeCount: number;
    commentCount: number;
    shareCount: number;
    createdAt: string;
    user: {
      id: string;
      username?: string;
      firstName?: string;
      profileImageUrl?: string;
      isVerified?: boolean;
    };
  };
}

export default function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: comments } = useQuery({
    queryKey: [`/api/posts/${post.id}/comments`],
    enabled: showComments,
    retry: false,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', `/api/posts/${post.id}/like`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest('POST', `/api/posts/${post.id}/comments`, { content });
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/comments`] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: "Comment added!",
        description: "Your comment has been posted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    commentMutation.mutate(newComment.trim());
  };

  const formatHashtags = (content: string, hashtags?: string[]) => {
    if (!hashtags || hashtags.length === 0) return content;
    
    let formattedContent = content;
    hashtags.forEach(tag => {
      const hashtagRegex = new RegExp(`#${tag}`, 'gi');
      formattedContent = formattedContent.replace(hashtagRegex, `<span class="text-gaming-blue">#${tag}</span>`);
    });
    
    return formattedContent;
  };

  return (
    <article className="bg-gaming-card rounded-xl border border-gaming-card-hover hover:border-gaming-blue/30 transition-colors">
      <div className="p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img 
              src={post.user.profileImageUrl || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50"} 
              alt="User avatar" 
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-white">
                  {post.user.username || post.user.firstName || 'Anonymous'}
                </h4>
                {post.user.isVerified && (
                  <span className="bg-gaming-purple text-white text-xs px-2 py-1 rounded-full">
                    Verified
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gaming-text-dim">
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                {post.gameTag && (
                  <>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM4 7h16v11H4zm1-3h2l1 2H4zm12 0h2l1 2h-3z"/>
                      </svg>
                      <span>{post.gameTag}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-gaming-text-dim hover:text-white">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <div 
            className="text-gaming-text mb-3 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ 
              __html: formatHashtags(post.content, post.hashtags) 
            }}
          />
          
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.hashtags.map((tag, index) => (
                <span key={index} className="text-gaming-blue text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          {post.mediaUrls && post.mediaUrls.length > 0 && (
            <img 
              src={post.mediaUrls[0]} 
              alt="Post media" 
              className="w-full rounded-xl object-cover max-h-96"
            />
          )}
        </div>

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gaming-card-hover">
          <div className="flex items-center space-x-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                if (!isAuthenticated) {
                  toast({
                    title: "Sign in required",
                    description: "Sign in to like posts",
                    variant: "destructive",
                  });
                  return;
                }
                likeMutation.mutate();
              }}
              disabled={likeMutation.isPending}
              className="flex items-center space-x-2 text-gaming-text-dim hover:text-gaming-red transition-colors"
            >
              <Heart className="w-4 h-4" />
              <span className="font-mono text-sm">{post.likeCount}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                if (!isAuthenticated) {
                  toast({
                    title: "Sign in required",
                    description: "Sign in to view comments",
                    variant: "destructive",
                  });
                  return;
                }
                setShowComments(!showComments);
              }}
              className="flex items-center space-x-2 text-gaming-text-dim hover:text-gaming-blue transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="font-mono text-sm">{post.commentCount}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="flex items-center space-x-2 text-gaming-text-dim hover:text-gaming-emerald transition-colors"
            >
              <Share className="w-4 h-4" />
              <span className="font-mono text-sm">{post.shareCount}</span>
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-gaming-text-dim hover:text-gaming-purple transition-colors"
          >
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gaming-card-hover p-6 bg-gaming-darker/30">
          <div className="space-y-4">
            {comments && comments.length > 0 ? (
              comments.slice(0, 3).map((comment: any) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <img 
                    src={comment.user?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40"} 
                    alt="Commenter avatar" 
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-white text-sm">
                        {comment.user?.username || comment.user?.firstName || 'Anonymous'}
                      </span>
                      <span className="text-xs text-gaming-text-dim">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gaming-text text-sm">{comment.content}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <button className="text-gaming-text-dim hover:text-gaming-red text-xs transition-colors">
                        <Heart className="w-3 h-3 inline mr-1" />
                        {comment.likeCount || 0}
                      </button>
                      <button className="text-gaming-text-dim hover:text-gaming-blue text-xs transition-colors">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gaming-text-dim text-sm">No comments yet. Be the first to comment!</p>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gaming-card-hover">
            <div className="flex items-start space-x-3">
              <img 
                src={user?.profileImageUrl || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40"} 
                alt="Your avatar" 
                className="w-8 h-8 rounded-lg object-cover"
              />
              <div className="flex-1 flex space-x-2">
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-gaming-card border-gaming-card-hover rounded-lg text-sm focus:border-gaming-blue transition-colors"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || commentMutation.isPending}
                  size="sm"
                  className="bg-gaming-blue hover:bg-blue-600"
                >
                  {commentMutation.isPending ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
