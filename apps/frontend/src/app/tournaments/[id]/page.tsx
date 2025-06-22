'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { TournamentDetails } from '@/components/tournaments/tournament-details'
import { TournamentBracket } from '@/components/tournaments/tournament-bracket'
import { TournamentParticipants } from '@/components/tournaments/tournament-participants'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { tournamentsAPI } from '@/lib/api'
import { Tournament, TournamentParticipant } from '@/types'

export default function TournamentDetailPage() {
  const params = useParams()
  const tournamentId = parseInt(params.id as string)
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [participants, setParticipants] = useState<TournamentParticipant[]>([])
  const [bracket, setBracket] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (tournamentId) {
      loadTournamentData()
    }
  }, [tournamentId])

  const loadTournamentData = async () => {
    try {
      const [tournamentResponse, participantsResponse, bracketResponse] = await Promise.allSettled([
        tournamentsAPI.getTournament(tournamentId),
        tournamentsAPI.getParticipants(tournamentId),
        tournamentsAPI.getBracket(tournamentId)
      ])

      if (tournamentResponse.status === 'fulfilled') {
        setTournament(tournamentResponse.value.data)
      }

      if (participantsResponse.status === 'fulfilled') {
        setParticipants(participantsResponse.value.data)
      }

      if (bracketResponse.status === 'fulfilled') {
        setBracket(bracketResponse.value.data)
      }
    } catch (error) {
      console.error('Failed to load tournament data:', error)
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

  if (!tournament) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-20">
          <div className="text-muted-foreground mb-4">Tournament not found</div>
          <p className="text-sm text-muted-foreground">
            The tournament you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-6xl mx-auto px-4">
        <TournamentDetails tournament={tournament} participants={participants} />
        
        <Tabs defaultValue="participants" className="mt-8">
          <TabsList>
            <TabsTrigger value="participants">
              Participants ({participants.length})
            </TabsTrigger>
            {tournament.status !== 'upcoming' && (
              <TabsTrigger value="bracket">Bracket</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="participants" className="mt-6">
            <TournamentParticipants 
              participants={participants} 
              tournament={tournament}
              onParticipantUpdate={loadTournamentData}
            />
          </TabsContent>
          
          {tournament.status !== 'upcoming' && (
            <TabsContent value="bracket" className="mt-6">
              <TournamentBracket bracket={bracket} tournament={tournament} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AuthenticatedLayout>
  )
}