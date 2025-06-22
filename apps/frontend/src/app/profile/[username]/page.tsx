'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { UserProfile } from '@/components/profile/user-profile'
import { UserPosts } from '@/components/profile/user-posts'
import { UserStats } from '@/components/profile/user-stats'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usersAPI } from '@/lib/api'
import { User, Post } from '@/types'

export default function ProfilePage() {
  const params = useParams()
  const username = params.username as string
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (username) {
      loadUserData()
    }
  }, [username])

  const loadUserData = async () => {
    try {
      const [userResponse, postsResponse, statsResponse] = await Promise.allSettled([
        usersAPI.getProfile(username),
        usersAPI.getUserPosts(username),
        usersAPI.getUserStats(username)
      ])

      if (userResponse.status === 'fulfilled') {
        setUser(userResponse.value.data)
      }

      if (postsResponse.status === 'fulfilled') {
        setPosts(postsResponse.value.data)
      }

      if (statsResponse.status === 'fulfilled') {
        setStats(statsResponse.value.data)
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setLoading(false)
    }
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

  if (!user) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-20">
          <div className="text-muted-foreground mb-4">User not found</div>
          <p className="text-sm text-muted-foreground">
            The user profile you're looking for doesn't exist.
          </p>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto px-4">
        <UserProfile user={user} stats={stats} />
        
        <Tabs defaultValue="posts" className="mt-8">
          <TabsList>
            <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
            <TabsTrigger value="stats">Gaming Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-6">
            <UserPosts posts={posts} user={user} />
          </TabsContent>
          
          <TabsContent value="stats" className="mt-6">
            <UserStats stats={stats} />
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  )
}