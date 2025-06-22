import { Clan, ClanMembership } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ClanBadge } from '@/components/common/clan-badge'
import { formatXP } from '@/lib/utils'
import { Trophy, Users, Calendar, Crown, Globe, Lock } from 'lucide-react'

interface ClanDetailsProps {
  clan: Clan
  members: ClanMembership[]
}

export function ClanDetails({ clan, members }: ClanDetailsProps) {
  const leader = members.find(m => m.role === 'leader')
  const coLeaders = members.filter(m => m.role === 'co_leader')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <ClanBadge clan={clan} size="lg" />
            <div>
              <CardTitle className="text-2xl mb-2">{clan.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={clan.isPublic ? 'secondary' : 'outline'}>
                  {clan.isPublic ? (
                    <>
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Description */}
        {clan.description && (
          <div>
            <h3 className="font-medium mb-2">About</h3>
            <p className="text-muted-foreground">{clan.description}</p>
          </div>
        )}

        {/* Clan Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gaming-primary/20 p-3 rounded-lg">
              <Users className="h-6 w-6 text-gaming-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{clan.memberCount}</div>
              <div className="text-sm text-muted-foreground">Members</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-gaming-accent/20 p-3 rounded-lg">
              <Trophy className="h-6 w-6 text-gaming-accent" />
            </div>
            <div>
              <div className="text-2xl font-bold">{formatXP(clan.xp)}</div>
              <div className="text-sm text-muted-foreground">Total XP</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-gaming-secondary/20 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-gaming-secondary" />
            </div>
            <div>
              <div className="text-sm font-medium">
                {clan.createdAt ? new Date(clan.createdAt).toLocaleDateString() : 'Recently'}
              </div>
              <div className="text-sm text-muted-foreground">Founded</div>
            </div>
          </div>
        </div>

        {/* Leadership */}
        <div>
          <h3 className="font-medium mb-4">Leadership</h3>
          <div className="space-y-3">
            {leader && (
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gaming-primary/10 border border-gaming-primary/20">
                <Crown className="h-5 w-5 text-gaming-primary" />
                <div className="flex-1">
                  <div className="font-medium">Clan Leader</div>
                  <div className="text-sm text-muted-foreground">
                    {leader.user?.username || leader.user?.firstName || 'Anonymous'}
                  </div>
                </div>
              </div>
            )}

            {coLeaders.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Co-Leaders</div>
                {coLeaders.map((coLeader) => (
                  <div key={coLeader.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">
                      {coLeader.user?.username || coLeader.user?.firstName || 'Anonymous'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}