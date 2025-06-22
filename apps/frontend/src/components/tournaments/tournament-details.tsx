import { Tournament, TournamentParticipant } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { tournamentsAPI } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'
import { 
  Trophy, 
  Users, 
  Calendar, 
  DollarSign, 
  Clock,
  GamepadIcon,
  MapPin
} from 'lucide-react'

interface TournamentDetailsProps {
  tournament: Tournament
  participants: TournamentParticipant[]
}

export function TournamentDetails({ tournament, participants }: TournamentDetailsProps) {
  const [isJoining, setIsJoining] = useState(false)
  const { toast } = useToast()

  const handleJoin = async () => {
    setIsJoining(true)
    try {
      await tournamentsAPI.joinTournament(tournament.id)
      toast({
        title: "Success",
        description: "Successfully joined the tournament!",
      })
      // Reload page or update state
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join tournament. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsJoining(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      upcoming: { variant: 'secondary' as const, label: 'Upcoming' },
      active: { variant: 'default' as const, label: 'Active' },
      completed: { variant: 'outline' as const, label: 'Completed' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled' },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.upcoming
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const startDate = new Date(tournament.startDate)
  const endDate = tournament.endDate ? new Date(tournament.endDate) : null
  const isJoinable = tournament.status === 'upcoming' && participants.length < tournament.maxParticipants

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl mb-2">{tournament.name}</CardTitle>
            <div className="flex items-center gap-2 mb-4">
              {getStatusBadge(tournament.status)}
              <Badge variant="outline">
                <GamepadIcon className="h-3 w-3 mr-1" />
                {tournament.game}
              </Badge>
            </div>
          </div>
          
          {isJoinable && (
            <Button
              onClick={handleJoin}
              disabled={isJoining}
              variant="gaming"
              size="lg"
            >
              {isJoining ? 'Joining...' : 'Join Tournament'}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Description */}
        {tournament.description && (
          <div>
            <h3 className="font-medium mb-2">About</h3>
            <p className="text-muted-foreground">{tournament.description}</p>
          </div>
        )}

        {/* Tournament Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gaming-primary/20 p-2 rounded-lg">
              <Users className="h-5 w-5 text-gaming-primary" />
            </div>
            <div>
              <div className="font-medium">
                {participants.length} / {tournament.maxParticipants}
              </div>
              <div className="text-sm text-muted-foreground">Participants</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-gaming-secondary/20 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-gaming-secondary" />
            </div>
            <div>
              <div className="font-medium">
                {startDate.toLocaleDateString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {tournament.entryFee && tournament.entryFee > 0 && (
            <div className="flex items-center space-x-3">
              <div className="bg-gaming-accent/20 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-gaming-accent" />
              </div>
              <div>
                <div className="font-medium">${tournament.entryFee}</div>
                <div className="text-sm text-muted-foreground">Entry Fee</div>
              </div>
            </div>
          )}

          {tournament.prizePool && tournament.prizePool > 0 && (
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-500/20 p-2 rounded-lg">
                <Trophy className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="font-medium">${tournament.prizePool}</div>
                <div className="text-sm text-muted-foreground">Prize Pool</div>
              </div>
            </div>
          )}
        </div>

        {/* Tournament Timeline */}
        <div>
          <h3 className="font-medium mb-3">Tournament Timeline</h3>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">Registration: </span>
              <span className="ml-1">
                Open until {startDate.toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">Start: </span>
              <span className="ml-1">
                {startDate.toLocaleDateString()} at {startDate.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            
            {endDate && (
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">End: </span>
                <span className="ml-1">
                  {endDate.toLocaleDateString()} at {endDate.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Registration Status */}
        {tournament.status === 'upcoming' && (
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Registration Open</div>
                <div className="text-sm text-muted-foreground">
                  {tournament.maxParticipants - participants.length} spots remaining
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-gaming-primary">
                  {Math.round((participants.length / tournament.maxParticipants) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Full</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}