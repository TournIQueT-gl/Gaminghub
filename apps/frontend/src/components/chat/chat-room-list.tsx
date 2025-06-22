'use client'

import { useState } from 'react'
import { ChatRoom } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { chatAPI } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Plus, Hash, MessageCircle, Users, Lock } from 'lucide-react'

interface ChatRoomListProps {
  rooms: ChatRoom[]
  selectedRoom: ChatRoom | null
  onRoomSelect: (room: ChatRoom) => void
  onRoomCreated: (room: ChatRoom) => void
}

export function ChatRoomList({ 
  rooms, 
  selectedRoom, 
  onRoomSelect, 
  onRoomCreated 
}: ChatRoomListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return

    setCreating(true)
    try {
      const response = await chatAPI.createRoom({
        name: roomName,
        type: 'public'
      })
      
      onRoomCreated(response.data)
      setRoomName('')
      setShowCreateForm(false)
      
      toast({
        title: "Success",
        description: "Chat room created successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create chat room. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'public':
        return <Hash className="h-4 w-4" />
      case 'private':
        return <Lock className="h-4 w-4" />
      case 'clan':
        return <Users className="h-4 w-4" />
      case 'tournament':
        return <MessageCircle className="h-4 w-4" />
      default:
        return <Hash className="h-4 w-4" />
    }
  }

  const getRoomBadge = (type: string) => {
    const badgeConfig = {
      public: { variant: 'secondary' as const, label: 'Public' },
      private: { variant: 'outline' as const, label: 'Private' },
      clan: { variant: 'default' as const, label: 'Clan' },
      tournament: { variant: 'default' as const, label: 'Tournament' },
    }
    
    const config = badgeConfig[type as keyof typeof badgeConfig] || badgeConfig.public
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>
  }

  return (
    <div className="flex flex-col h-full">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Chat Rooms</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {showCreateForm && (
        <div className="p-4 border-b space-y-3">
          <Input
            placeholder="Room name..."
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleCreateRoom}
              disabled={!roomName.trim() || creating}
              size="sm"
              variant="gaming"
              className="flex-1"
            >
              {creating ? 'Creating...' : 'Create'}
            </Button>
            <Button
              onClick={() => {
                setShowCreateForm(false)
                setRoomName('')
              }}
              size="sm"
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <CardContent className="flex-1 overflow-y-auto p-0">
        {rooms.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No chat rooms available
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => onRoomSelect(room)}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-colors hover:bg-accent",
                  selectedRoom?.id === room.id && "bg-accent"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    {getRoomIcon(room.type)}
                    <span className="font-medium truncate">
                      {room.name || `${room.type} Chat`}
                    </span>
                  </div>
                  {getRoomBadge(room.type)}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Click to join conversation
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </div>
  )
}