'use client'

import { useState, useEffect } from 'react'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { TournamentCard } from '@/components/tournaments/tournament-card'
import { CreateTournament } from '@/components/tournaments/create-tournament'
import { TournamentFilters } from '@/components/tournaments/tournament-filters'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { tournamentsAPI } from '@/lib/api'
import { Tournament } from '@/types'
import { Plus } from 'lucide-react'

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'active' | 'completed'>('all')

  useEffect(() => {
    loadTournaments()
  }, [])

  const loadTournaments = async () => {
    try {
      const response = await tournamentsAPI.getTournaments()
      setTournaments(response.data)
    } catch (error) {
      console.error('Failed to load tournaments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTournamentCreated = (tournament: Tournament) => {
    setTournaments(prev => [tournament, ...prev])
    setShowCreate(false)
  }

  const handleTournamentUpdate = (updatedTournament: Tournament) => {
    setTournaments(prev => prev.map(t => 
      t.id === updatedTournament.id ? updatedTournament : t
    ))
  }

  const filteredTournaments = tournaments.filter(tournament => {
    if (filter === 'all') return true
    return tournament.status === filter
  })

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-6xl mx-auto px-0 sm:px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Tournaments</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Compete in organized tournaments and climb the leaderboards
            </p>
          </div>
          
          <Button onClick={() => setShowCreate(true)} variant="gaming" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Tournament
          </Button>
        </div>

        <div className="mb-6">
          <TournamentFilters 
            currentFilter={filter}
            onFilterChange={setFilter}
          />
        </div>

        {showCreate && (
          <div className="mb-8">
            <CreateTournament
              onTournamentCreated={handleTournamentCreated}
              onCancel={() => setShowCreate(false)}
            />
          </div>
        )}

        {filteredTournaments.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-muted-foreground mb-4">
              {filter === 'all' ? 'No tournaments yet' : `No ${filter} tournaments`}
            </div>
            <p className="text-sm text-muted-foreground">
              {filter === 'all' 
                ? 'Be the first to create a tournament!'
                : 'Try a different filter or create a new tournament.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                onUpdate={handleTournamentUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}