'use client'

import { useState, useEffect } from 'react'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { PostCard } from '@/components/feed/post-card'
import { CreatePost } from '@/components/feed/create-post'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { postsAPI } from '@/lib/api'
import { Post } from '@/types'
import { useInView } from 'react-intersection-observer'

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const { ref, inView } = useInView()

  useEffect(() => {
    loadPosts()
  }, [])

  useEffect(() => {
    if (inView && hasMore && !loadingMore) {
      loadMorePosts()
    }
  }, [inView])

  const loadPosts = async () => {
    try {
      const response = await postsAPI.getPosts(20, 0)
      setPosts(response.data)
      setHasMore(response.data.length === 20)
    } catch (error) {
      console.error('Failed to load posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMorePosts = async () => {
    setLoadingMore(true)
    try {
      const response = await postsAPI.getPosts(20, posts.length)
      setPosts(prev => [...prev, ...response.data])
      setHasMore(response.data.length === 20)
    } catch (error) {
      console.error('Failed to load more posts:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  const handlePostCreated = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev])
  }

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ))
  }

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gaming Feed</h1>
          <p className="text-muted-foreground">
            Share your gaming moments and connect with the community
          </p>
        </div>

        <div className="mb-8">
          <CreatePost onPostCreated={handlePostCreated} />
        </div>

        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-muted-foreground mb-4">No posts yet</div>
              <p className="text-sm text-muted-foreground">
                Be the first to share something with the community!
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onUpdate={handlePostUpdate}
              />
            ))
          )}
          
          {hasMore && (
            <div ref={ref} className="flex justify-center py-4">
              {loadingMore && <LoadingSpinner />}
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  )
}