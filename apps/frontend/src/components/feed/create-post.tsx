'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Post } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { UserAvatar } from '@/components/common/user-avatar'
import { useAuth } from '@/hooks/useAuth'
import { postsAPI } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Image, Hash, Send } from 'lucide-react'

interface CreatePostProps {
  onPostCreated: (post: Post) => void
}

interface CreatePostForm {
  content: string
  imageUrl?: string
  hashtags?: string
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showImageInput, setShowImageInput] = useState(false)
  const [showHashtagInput, setShowHashtagInput] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<CreatePostForm>()

  const content = watch('content')
  const characterCount = content?.length || 0
  const maxCharacters = 500

  const onSubmit = async (data: CreatePostForm) => {
    if (!user) return

    setIsSubmitting(true)
    try {
      const hashtags = data.hashtags
        ? data.hashtags.split(/[,\s]+/).filter(tag => tag.trim())
        : []

      const response = await postsAPI.createPost({
        content: data.content,
        imageUrl: data.imageUrl || null,
        hashtags: hashtags.length > 0 ? hashtags : null
      })

      onPostCreated({ ...response.data, user })
      reset()
      setShowImageInput(false)
      setShowHashtagInput(false)
      
      toast({
        title: "Success",
        description: "Your post has been shared!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Share with the community</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-start space-x-3">
            <UserAvatar user={user} size="md" />
            <div className="flex-1 space-y-3">
              <div>
                <Textarea
                  {...register('content', {
                    required: 'Content is required',
                    maxLength: {
                      value: maxCharacters,
                      message: `Content must be ${maxCharacters} characters or less`
                    }
                  })}
                  placeholder="What's happening in your gaming world?"
                  className="min-h-[100px] resize-none border-0 bg-transparent p-0 text-base placeholder:text-muted-foreground focus-visible:ring-0"
                />
                {errors.content && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.content.message}
                  </p>
                )}
                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-muted-foreground">
                    {characterCount}/{maxCharacters}
                  </div>
                  {characterCount > maxCharacters * 0.8 && (
                    <div className={`text-xs ${
                      characterCount > maxCharacters ? 'text-destructive' : 'text-warning'
                    }`}>
                      {maxCharacters - characterCount} remaining
                    </div>
                  )}
                </div>
              </div>

              {showImageInput && (
                <Input
                  {...register('imageUrl')}
                  placeholder="Image URL (optional)"
                  type="url"
                />
              )}

              {showHashtagInput && (
                <Input
                  {...register('hashtags')}
                  placeholder="Add hashtags (comma separated)"
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowImageInput(!showImageInput)}
                className={showImageInput ? 'text-gaming-primary' : ''}
              >
                <Image className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Image</span>
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowHashtagInput(!showHashtagInput)}
                className={showHashtagInput ? 'text-gaming-primary' : ''}
              >
                <Hash className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Tags</span>
              </Button>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !content?.trim() || characterCount > maxCharacters}
              variant="gaming"
            >
              {isSubmitting ? (
                'Posting...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Post
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}