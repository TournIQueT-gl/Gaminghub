'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Clan, ClanMembership } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ClanBadge } from '@/components/common/clan-badge'
import { clansAPI } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { formatXP } from '@/lib/utils'
import { Users, Trophy, Lock, Globe } from 'lucide-react'

interface ClanCardProps {
  clan: Clan
  userClan: ClanMembership | null
  onJoin: (clan: Clan) => void
}

export function ClanCard({ clan, userClan, onJoin }: ClanCardProps) {
  const [isJoining, setIsJoining] = useState(false)
  const { toast } = useToast()

  const handleJoin = async () => {
    setIsJoining(true)
    try {
      await clansAPI.joinClan(clan.id)
      onJoin(clan)
      toast({
        title: "Success",
        description: `Successfully joined ${clan.name}!`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join clan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsJoining(false)
    }
  }

  const canJoin = !userClan && clan.isPublic
  const isUserClan = userClan?.clan?.id === clan.id

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <ClanBadge clan={clan} size="sm" />
              <CardTitle className="text-lg">{clan.name}</CardTitle>
            </div>
            
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
              
              {isUserClan && (
                <Badge variant="default">Your Clan</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Clan Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            {clan.memberCount} members
          </div>
          
          <div className="flex items-center text-sm text-gaming-accent">
            <Trophy className="h-4 w-4 mr-2" />
            {formatXP(clan.xp)}
          </div>
        </div>

        {/* Description */}
        {clan.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {clan.description}
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
            <Link href={`/clans/${clan.id}`}>
              View Details
            </Link>
          </Button>
          
          {canJoin && (
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
      </CardContent>
    </Card>
  )
}