import { Clan, ClanMembership } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/common/user-avatar'
import { formatTimeAgo, getLevel } from '@/lib/utils'
import { Users, Crown, Shield, User, Calendar } from 'lucide-react'

interface ClanMembersProps {
  members: ClanMembership[]
  clan: Clan
}

export function ClanMembers({ members, clan }: ClanMembersProps) {
  const getRoleIcon = (role: string | null) => {
    switch (role) {
      case 'leader':
        return <Crown className="h-4 w-4 text-gaming-primary" />
      case 'co_leader':
        return <Shield className="h-4 w-4 text-gaming-secondary" />
      default:
        return <User className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getRoleBadge = (role: string | null) => {
    const roleConfig = {
      leader: { variant: 'default' as const, label: 'Leader' },
      co_leader: { variant: 'secondary' as const, label: 'Co-Leader' },
      member: { variant: 'outline' as const, label: 'Member' },
    }
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.member
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const sortedMembers = [...members].sort((a, b) => {
    const roleOrder = { leader: 0, co_leader: 1, member: 2 }
    const aOrder = roleOrder[a.role as keyof typeof roleOrder] ?? 2
    const bOrder = roleOrder[b.role as keyof typeof roleOrder] ?? 2
    return aOrder - bOrder
  })

  if (members.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <div className="text-muted-foreground mb-2">No members found</div>
          <p className="text-sm text-muted-foreground">
            This clan appears to be empty.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Clan Members ({members.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                {getRoleIcon(member.role)}
                
                {member.user && (
                  <UserAvatar user={member.user} size="md" showLevel />
                )}
                
                <div>
                  <div className="font-medium">
                    {member.user?.username || 
                     member.user?.firstName || 
                     'Anonymous'}
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Joined {formatTimeAgo(member.joinedAt)}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {member.user && (
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium">
                      Level {getLevel(member.user.xp)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {member.user.totalWins || 0} wins
                    </div>
                  </div>
                )}
                
                {getRoleBadge(member.role)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}