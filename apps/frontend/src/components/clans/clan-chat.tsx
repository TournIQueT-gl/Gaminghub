'use client'

import { useState, useEffect } from 'react'
import { ChatWindow } from '@/components/chat/chat-window'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Card, CardContent } from '@/components/ui/card'
import { chatAPI } from '@/lib/api'
import { ChatRoom } from '@/types'
import { MessageCircle } from 'lucide-react'

interface ClanChatProps {
  clanId: number
}

export function ClanChat({ clanId }: ClanChatProps) {
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClanChatRoom()
  }, [clanId])

  const loadClanChatRoom = async () => {
    try {
      // First try to get existing clan chat rooms
      const response = await chatAPI.getRooms()
      const clanRoom = response.data.find(
        (room: ChatRoom) => room.type === 'clan' && room.name?.includes(clanId.toString())
      )

      if (clanRoom) {
        setChatRoom(clanRoom)
      } else {
        // Create a new clan chat room
        const newRoomResponse = await chatAPI.createRoom({
          name: `Clan ${clanId} Chat`,
          type: 'clan'
        })
        setChatRoom(newRoomResponse.data)
      }
    } catch (error) {
      console.error('Failed to load clan chat room:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-20">
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!chatRoom) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <div className="text-muted-foreground mb-2">Chat not available</div>
          <p className="text-sm text-muted-foreground">
            Unable to load or create clan chat room.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-[600px]">
      <ChatWindow room={chatRoom} />
    </Card>
  )
}