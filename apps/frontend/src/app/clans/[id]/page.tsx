'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { ClanDetails } from '@/components/clans/clan-details'
import { ClanMembers } from '@/components/clans/clan-members'
import { ClanChat } from '@/components/clans/clan-chat'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { clansAPI } from '@/lib/api'
import { Clan, ClanMembership } from '@/types'

export default function ClanDetailPage() {
  const params = useParams()
  const clanId = parseInt(params.id as string)
  const [clan, setClan] = useState<Clan | null>(null)
  const [members, setMembers] = useState<ClanMembership[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (clanId) {
      loadClanData()
    }
  }, [clanId])

  const loadClanData = async () => {
    try {
      const [clanResponse, membersResponse] = await Promise.allSettled([
        clansAPI.getClan(clanId),
        clansAPI.getMembers(clanId)
      ])

      if (clanResponse.status === 'fulfilled') {
        setClan(clanResponse.value.data)
      }

      if (membersResponse.status === 'fulfilled') {
        setMembers(membersResponse.value.data)
      }
    } catch (error) {
      console.error('Failed to load clan data:', error)
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

  if (!clan) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-20">
          <div className="text-muted-foreground mb-4">Clan not found</div>
          <p className="text-sm text-muted-foreground">
            The clan you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-6xl mx-auto px-4">
        <ClanDetails clan={clan} members={members} />
        
        <Tabs defaultValue="members" className="mt-8">
          <TabsList>
            <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
            <TabsTrigger value="chat">Clan Chat</TabsTrigger>
          </TabsList>
          
          <TabsContent value="members" className="mt-6">
            <ClanMembers members={members} clan={clan} />
          </TabsContent>
          
          <TabsContent value="chat" className="mt-6">
            <ClanChat clanId={clanId} />
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  )
}