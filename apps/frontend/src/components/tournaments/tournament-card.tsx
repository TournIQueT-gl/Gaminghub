'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Tournament } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { tournamentsAPI } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { formatTimeAgo } from '@/lib/utils'
import { 
  Trophy, 
  Users, 
  Calendar, 
  DollarSign, 
  Clock,
  GamepadIcon
} from 'lucide-react'

interface TournamentCardProps {
  tournament: Tournament
  onUpdate: (tournament: Tournament) => void
}

export function TournamentCard({ tournament, onUpdate }: TournamentCardProps) {
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
      // You might want to refetch tournament data here
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

  const isJoinable = tournament.status === 'upcoming'
  const startDate = new Date(tournament.startDate)
  const isStartingSoon = startDate.getTime() - Date.now() < 24 * 60 * 60 * 1000 // 24 hours

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 line-clamp-2">
              {tournament.name}
            </CardTitle>
            {getStatusBadge(tournament.status)}
          </div>
          
          {isStartingSoon && tournament.status === 'upcoming' && (
            <div className="bg-gaming-accent/20 text-gaming-accent px-2 py-1 rounded text-xs font-medium">
              Starting Soon
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tournament Info */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <GamepadIcon className="h-4 w-4 mr-2" />
            {tournament.game}
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            Max {tournament.maxParticipants} participants
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            {startDate.toLocaleDateString()} at {startDate.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
          
          {tournament.entryFee && tournament.entryFee > 0 && (
            <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4 mr-2" />
              ${tournament.entryFee} entry fee
            </div>
          )}
          
          {tournament.prizePool && tournament.prizePool > 0 && (
            <div className="flex items-center text-sm text-gaming-accent font-medium">
              <Trophy className="h-4 w-4 mr-2" />
              ${tournament.prizePool} prize pool
            </div>
          )}
        </div>

        {/* Description */}
        {tournament.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {tournament.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Link href={`/tournaments/${tournament.id}`}>
              View Details
            </Link>
          </Button>
          
          {isJoinable && (
            <Button
              onClick={handleJoin}
              disabled={isJoining}
              variant="gaming"
              size="sm"
              className="flex-1"
            >
              {isJoining ? 'Joining...' : 'Join'}
            </Button>
          )}
        </div>

        {/* Footer Info */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Created {formatTimeAgo(tournament.createdAt)}
        </div>
      </CardContent>
    </Card>
  )
}