'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Comment } from '@/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { UserAvatar } from '@/components/common/user-avatar'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuth } from '@/hooks/useAuth'
import { postsAPI } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { formatTimeAgo } from '@/lib/utils'
import { Send } from 'lucide-react'

interface CommentBoxProps {
  postId: number
  onCommentAdded: () => void
}

interface CommentForm {
  content: string
}

export function CommentBox({ postId, onCommentAdded }: CommentBoxProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CommentForm>()

  useEffect(() => {
    loadComments()
  }, [postId])

  const loadComments = async () => {
    try {
      const response = await postsAPI.getComments(postId)
      setComments(response.data)
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: CommentForm) => {
    if (!user) return

    setSubmitting(true)
    try {
      const response = await postsAPI.addComment(postId, data.content)
      const newComment = { ...response.data, user }
      setComments(prev => [...prev, newComment])
      onCommentAdded()
      reset()
      
      toast({
        title: "Success",
        description: "Comment added successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <LoadingSpinner size="sm" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Add Comment Form */}
      {user && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="flex items-start space-x-3">
            <UserAvatar user={user} size="sm" />
            <div className="flex-1">
              <Textarea
                {...register('content', {
                  required: 'Comment content is required',
                  maxLength: {
                    value: 280,
                    message: 'Comment must be 280 characters or less'
                  }
                })}
                placeholder="Add a comment..."
                className="min-h-[60px] resize-none"
                rows={2}
              />
              {errors.content && (
                <p className="text-sm text-destructive mt-1">
                  {errors.content.message}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={submitting}
              size="sm"
              variant="gaming"
            >
              {submitting ? (
                'Posting...'
              ) : (
                <>
                  <Send className="h-3 w-3 mr-2" />
                  Comment
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-3">
              <UserAvatar user={comment.user!} size="sm" />
              <div className="flex-1">
                <div className="bg-muted rounded-lg p-3">
                  <div className="font-medium text-sm mb-1">
                    {comment.user?.username || comment.user?.firstName || 'Anonymous'}
                  </div>
                  <div className="text-sm">
                    {comment.content}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1 ml-3">
                  {formatTimeAgo(comment.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}