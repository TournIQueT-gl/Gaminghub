'use client'

import { useState } from 'react'
import { Post } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/common/user-avatar'
import { ReactionBar } from './reaction-bar'
import { CommentBox } from './comment-box'
import { formatTimeAgo } from '@/lib/utils'
import { MessageCircle, Share2, MoreHorizontal } from 'lucide-react'
import Image from 'next/image'

interface PostCardProps {
  post: Post
  onUpdate: (post: Post) => void
}

export function PostCard({ post, onUpdate }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)

  const handleLikeUpdate = (newLikeCount: number, isLiked: boolean) => {
    onUpdate({
      ...post,
      likeCount: newLikeCount,
      isLiked
    })
  }

  const handleCommentAdded = () => {
    onUpdate({
      ...post,
      commentCount: (post.commentCount || 0) + 1
    })
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <UserAvatar user={post.user!} size="md" />
            <div>
              <div className="font-semibold">
                {post.user?.username || post.user?.firstName || 'Anonymous'}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatTimeAgo(post.createdAt)}
              </div>
            </div>
          </div>
          
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Post Content */}
        <div className="text-sm whitespace-pre-wrap">
          {post.content}
        </div>

        {/* Post Image */}
        {post.imageUrl && (
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <Image
              src={post.imageUrl}
              alt="Post image"
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.hashtags.map((tag, index) => (
              <span
                key={index}
                className="text-sm text-gaming-primary hover:text-gaming-primary/80 cursor-pointer"
              >
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}

        {/* Reaction Bar */}
        <ReactionBar
          postId={post.id}
          initialLikeCount={post.likeCount || 0}
          initialIsLiked={post.isLiked || false}
          commentCount={post.commentCount || 0}
          shareCount={post.shareCount || 0}
          onLikeUpdate={handleLikeUpdate}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="text-muted-foreground hover:text-foreground flex-1 min-w-0"
          >
            <MessageCircle className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{post.commentCount || 0} comments</span>
            <span className="sm:hidden">{post.commentCount || 0}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground flex-1 min-w-0"
          >
            <Share2 className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="border-t pt-4">
            <CommentBox 
              postId={post.id} 
              onCommentAdded={handleCommentAdded}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}