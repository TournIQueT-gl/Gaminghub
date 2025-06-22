import { Tournament, TournamentParticipant } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/common/user-avatar'
import { ClanBadge } from '@/components/common/clan-badge'
import { formatTimeAgo } from '@/lib/utils'
import { Trophy, Users, Calendar } from 'lucide-react'

interface TournamentParticipantsProps {
  participants: TournamentParticipant[]
  tournament: Tournament
  onParticipantUpdate: () => void
}

export function TournamentParticipants({ 
  participants, 
  tournament, 
  onParticipantUpdate 
}: TournamentParticipantsProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      registered: { variant: 'secondary' as const, label: 'Registered' },
      active: { variant: 'default' as const, label: 'Active' },
      eliminated: { variant: 'outline' as const, label: 'Eliminated' },
      winner: { variant: 'default' as const, label: 'Winner' },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.registered
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (participants.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <div className="text-muted-foreground mb-2">No participants yet</div>
          <p className="text-sm text-muted-foreground">
            Be the first to join this tournament!
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
          Participants ({participants.length}/{tournament.maxParticipants})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card"
            >
              <div className="flex items-center space-x-4">
                {participant.user && (
                  <UserAvatar user={participant.user} size="md" />
                )}
                
                <div>
                  <div className="font-medium">
                    {participant.user?.username || 
                     participant.user?.firstName || 
                     'Anonymous'}
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Joined {formatTimeAgo(participant.joinedAt)}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {participant.clan && (
                  <ClanBadge clan={participant.clan} size="sm" />
                )}
                
                {getStatusBadge(participant.status)}
                
                {participant.status === 'winner' && (
                  <Trophy className="h-5 w-5 text-yellow-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}