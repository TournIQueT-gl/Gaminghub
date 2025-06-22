'use client'

import { useState, useEffect } from 'react'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { ClanCard } from '@/components/clans/clan-card'
import { CreateClan } from '@/components/clans/create-clan'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { clansAPI, usersAPI } from '@/lib/api'
import { Clan, ClanMembership } from '@/types'
import { Plus } from 'lucide-react'

export default function ClansPage() {
  const [clans, setClans] = useState<Clan[]>([])
  const [userClan, setUserClan] = useState<ClanMembership | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [clansResponse, userClanResponse] = await Promise.allSettled([
        clansAPI.getClans(),
        usersAPI.getClanMembership()
      ])

      if (clansResponse.status === 'fulfilled') {
        setClans(clansResponse.value.data)
      }

      if (userClanResponse.status === 'fulfilled') {
        setUserClan(userClanResponse.value.data)
      }
    } catch (error) {
      console.error('Failed to load clans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClanCreated = (clan: Clan) => {
    setClans(prev => [clan, ...prev])
    setShowCreate(false)
    loadData() // Reload to get updated user clan membership
  }

  const handleClanJoined = (clan: Clan) => {
    loadData() // Reload to get updated user clan membership
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

  return (
    <AuthenticatedLayout>
      <div className="max-w-6xl mx-auto px-0 sm:px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Gaming Clans</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Join a community of like-minded gamers or create your own clan
            </p>
          </div>
          
          {!userClan && (
            <Button onClick={() => setShowCreate(true)} variant="gaming" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Clan
            </Button>
          )}
        </div>

        {userClan && (
          <div className="mb-8 p-4 bg-gaming-primary/10 border border-gaming-primary/20 rounded-lg">
            <h3 className="font-medium mb-2">Your Clan</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{userClan.clan?.name}</div>
                <div className="text-sm text-muted-foreground">
                  Role: {userClan.role} • Members: {userClan.clan?.memberCount}
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <a href={`/clans/${userClan.clan?.id}`}>View Clan</a>
              </Button>
            </div>
          </div>
        )}

        {showCreate && (
          <div className="mb-8">
            <CreateClan
              onClanCreated={handleClanCreated}
              onCancel={() => setShowCreate(false)}
            />
          </div>
        )}

        {clans.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-muted-foreground mb-4">No clans yet</div>
            <p className="text-sm text-muted-foreground">
              Be the first to create a gaming clan!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clans.map((clan) => (
              <ClanCard
                key={clan.id}
                clan={clan}
                userClan={userClan}
                onJoin={handleClanJoined}
              />
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}