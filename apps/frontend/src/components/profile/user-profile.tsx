import { User } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/common/user-avatar'
import { XPProgressBar } from '@/components/common/xp-progress-bar'
import { useAuth } from '@/hooks/useAuth'
import { getLevel, formatXP } from '@/lib/utils'
import { Trophy, Users, Calendar, Edit } from 'lucide-react'

interface UserProfileProps {
  user: User
  stats: any
}

export function UserProfile({ user, stats }: UserProfileProps) {
  const { user: currentUser } = useAuth()
  const isOwnProfile = currentUser?.id === user.id
  const level = getLevel(user.xp)

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col items-center lg:items-start">
            <UserAvatar user={user} size="lg" className="mb-4" />
            
            <div className="text-center lg:text-left">
              <h1 className="text-xl sm:text-2xl font-bold mb-1 break-words">
                {user.username || `${user.firstName} ${user.lastName}`.trim() || 'Anonymous'}
              </h1>
              
              <div className="text-muted-foreground mb-2 text-sm sm:text-base">
                Level {level} • {formatXP(user.xp)}
              </div>
              
              {user.bio && (
                <p className="text-sm text-muted-foreground max-w-md">
                  {user.bio}
                </p>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gaming-primary">
                  {user.totalPosts || 0}
                </div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gaming-secondary">
                  {user.totalWins || 0}
                </div>
                <div className="text-sm text-muted-foreground">Wins</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gaming-accent">
                  {stats?.followers || 0}
                </div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gaming-accent">
                  {stats?.following || 0}
                </div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
            </div>

            {/* XP Progress */}
            <div className="mb-6">
              <XPProgressBar currentXP={user.xp} showText />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {isOwnProfile ? (
                <Button variant="outline" className="w-full sm:w-auto">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button variant="gaming" className="w-full sm:w-auto">
                    <Users className="h-4 w-4 mr-2" />
                    Follow
                  </Button>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Message
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}