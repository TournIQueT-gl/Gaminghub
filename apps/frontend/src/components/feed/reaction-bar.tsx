'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { postsAPI } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReactionBarProps {
  postId: number
  initialLikeCount: number
  initialIsLiked: boolean
  commentCount: number
  shareCount: number
  onLikeUpdate: (newLikeCount: number, isLiked: boolean) => void
}

export function ReactionBar({
  postId,
  initialLikeCount,
  initialIsLiked,
  commentCount,
  shareCount,
  onLikeUpdate
}: ReactionBarProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLiking, setIsLiking] = useState(false)
  const { toast } = useToast()

  const handleLike = async () => {
    if (isLiking) return

    setIsLiking(true)
    const newIsLiked = !isLiked
    const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1

    // Optimistic update
    setIsLiked(newIsLiked)
    setLikeCount(newLikeCount)
    onLikeUpdate(newLikeCount, newIsLiked)

    try {
      await postsAPI.likePost(postId)
    } catch (error) {
      // Revert on error
      setIsLiked(!newIsLiked)
      setLikeCount(newIsLiked ? newLikeCount - 1 : newLikeCount + 1)
      onLikeUpdate(!newIsLiked ? newLikeCount - 1 : newLikeCount + 1, !newIsLiked)
      
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLiking(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this post on GamingX',
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "Post link copied to clipboard",
      })
    }
  }

  return (
    <div className="flex items-center space-x-3 sm:space-x-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        disabled={isLiking}
        className={cn(
          "text-muted-foreground hover:text-foreground transition-colors p-2 sm:px-4",
          isLiked && "text-red-500 hover:text-red-600"
        )}
      >
        <Heart
          className={cn(
            "h-4 w-4 mr-1 sm:mr-2",
            isLiked && "fill-current"
          )}
        />
        <span className="text-xs sm:text-sm">{likeCount}</span>
      </Button>

      <div className="flex items-center text-muted-foreground text-xs sm:text-sm">
        <MessageCircle className="h-4 w-4 mr-1" />
        {commentCount}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className="text-muted-foreground hover:text-foreground p-2 sm:px-4"
      >
        <Share2 className="h-4 w-4 mr-1 sm:mr-2" />
        <span className="text-xs sm:text-sm">{shareCount}</span>
      </Button>
    </div>
  )
}