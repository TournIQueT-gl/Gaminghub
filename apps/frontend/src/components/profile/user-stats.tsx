import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Trophy, Target, Zap, Users } from 'lucide-react'

interface UserStatsProps {
  stats: any
}

export function UserStats({ stats }: UserStatsProps) {
  if (!stats) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">No gaming stats available</div>
      </div>
    )
  }

  const achievements = [
    { name: 'First Win', description: 'Win your first tournament', completed: true },
    { name: 'Social Butterfly', description: 'Make 10 friends', completed: true },
    { name: 'Content Creator', description: 'Share 50 posts', completed: false, progress: 32 },
    { name: 'Tournament Master', description: 'Win 5 tournaments', completed: false, progress: 2 },
  ]

  return (
    <div className="space-y-6">
      {/* Gaming Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-gaming-accent" />
            Gaming Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gaming-primary mb-1">
                {stats.tournamentsWon || 0}
              </div>
              <div className="text-sm text-muted-foreground">Tournaments Won</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-gaming-secondary mb-1">
                {stats.tournamentsPlayed || 0}
              </div>
              <div className="text-sm text-muted-foreground">Tournaments Played</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-gaming-accent mb-1">
                {stats.winRate || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                #{stats.ranking || 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Global Rank</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-gaming-secondary" />
            Social Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">{stats.postsCreated || 0}</div>
              <div className="text-sm text-muted-foreground">Posts Created</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">{stats.commentsPosted || 0}</div>
              <div className="text-sm text-muted-foreground">Comments Posted</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">{stats.likesReceived || 0}</div>
              <div className="text-sm text-muted-foreground">Likes Received</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-gaming-primary" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  achievement.completed 
                    ? 'bg-gaming-accent text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <Trophy className="h-5 w-5" />
                </div>
                
                <div className="flex-1">
                  <div className="font-medium">{achievement.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {achievement.description}
                  </div>
                  
                  {!achievement.completed && achievement.progress !== undefined && (
                    <div className="mt-2">
                      <Progress 
                        value={(achievement.progress / (achievement.name === 'Content Creator' ? 50 : 5)) * 100} 
                        className="h-2"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {achievement.progress} / {achievement.name === 'Content Creator' ? 50 : 5}
                      </div>
                    </div>
                  )}
                </div>
                
                {achievement.completed && (
                  <div className="text-gaming-accent font-medium text-sm">
                    Completed
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}