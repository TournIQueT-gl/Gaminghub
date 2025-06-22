'use client'

import { useState, useEffect } from 'react'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Shield, Users, MessageSquare, AlertTriangle, Trophy, Eye } from 'lucide-react'

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    // Check if user has admin access
    if (!isLoading && (!user || user.id !== 'admin')) {
      router.push('/')
      return
    }
    
    if (user) {
      loadAdminStats()
    }
  }, [user, isLoading, router])

  const loadAdminStats = async () => {
    // Simulate loading admin stats
    setTimeout(() => {
      setStats({
        totalUsers: 1247,
        activeUsers: 423,
        totalPosts: 3892,
        flaggedPosts: 12,
        totalTournaments: 67,
        activeTournaments: 8,
        totalClans: 89,
        reportsToReview: 5
      })
      setLoadingStats(false)
    }, 1000)
  }

  if (isLoading || loadingStats) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </AuthenticatedLayout>
    )
  }

  if (!user || user.id !== 'admin') {
    return null
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center mb-8">
          <Shield className="h-8 w-8 text-gaming-primary mr-3" />
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Platform management and moderation tools
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{stats?.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-gaming-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{stats?.activeUsers}</p>
                </div>
                <Eye className="h-8 w-8 text-gaming-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Posts</p>
                  <p className="text-2xl font-bold">{stats?.totalPosts}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-gaming-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reports</p>
                  <p className="text-2xl font-bold">{stats?.reportsToReview}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-gaming-danger" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-gaming-danger" />
                Content Moderation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <div className="font-medium">Flagged Posts</div>
                  <div className="text-sm text-muted-foreground">
                    {stats?.flaggedPosts} posts need review
                  </div>
                </div>
                <Badge variant="destructive">{stats?.flaggedPosts}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <div className="font-medium">User Reports</div>
                  <div className="text-sm text-muted-foreground">
                    {stats?.reportsToReview} reports pending
                  </div>
                </div>
                <Badge variant="outline">{stats?.reportsToReview}</Badge>
              </div>
              
              <Button className="w-full" variant="outline">
                Review Content
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-gaming-accent" />
                Tournament Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <div className="font-medium">Active Tournaments</div>
                  <div className="text-sm text-muted-foreground">
                    {stats?.activeTournaments} currently running
                  </div>
                </div>
                <Badge variant="secondary">{stats?.activeTournaments}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <div className="font-medium">Total Tournaments</div>
                  <div className="text-sm text-muted-foreground">
                    {stats?.totalTournaments} all time
                  </div>
                </div>
                <Badge variant="outline">{stats?.totalTournaments}</Badge>
              </div>
              
              <Button className="w-full" variant="outline">
                Manage Tournaments
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div>
                  <div className="font-medium text-green-700 dark:text-green-300">API Status</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Operational</div>
                </div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div>
                  <div className="font-medium text-green-700 dark:text-green-300">Database</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Healthy</div>
                </div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div>
                  <div className="font-medium text-green-700 dark:text-green-300">WebSocket</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Connected</div>
                </div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}