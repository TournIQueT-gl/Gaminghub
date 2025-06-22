'use client'

import { useState, useEffect } from 'react'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { ChatRoomList } from '@/components/chat/chat-room-list'
import { ChatWindow } from '@/components/chat/chat-window'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { chatAPI } from '@/lib/api'
import { useSocket } from '@/hooks/useSocket'
import { ChatRoom } from '@/types'

export default function ChatPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [loading, setLoading] = useState(true)
  const { isConnected } = useSocket()

  useEffect(() => {
    loadRooms()
  }, [])

  const loadRooms = async () => {
    try {
      const response = await chatAPI.getRooms()
      setRooms(response.data)
      if (response.data.length > 0 && !selectedRoom) {
        setSelectedRoom(response.data[0])
      }
    } catch (error) {
      console.error('Failed to load chat rooms:', error)
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

  return (
    <AuthenticatedLayout>
      <div className="flex h-[calc(100vh-4rem)] max-w-6xl mx-auto">
        {/* Room List */}
        <div className="w-full sm:w-80 border-r bg-card sm:block hidden">
          <ChatRoomList
            rooms={rooms}
            selectedRoom={selectedRoom}
            onRoomSelect={setSelectedRoom}
            onRoomCreated={(room) => setRooms(prev => [room, ...prev])}
          />
        </div>

        {/* Chat Window */}
        <div className="flex-1 sm:block hidden">
          {selectedRoom ? (
            <ChatWindow room={selectedRoom} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-muted-foreground mb-2">No chat room selected</div>
                <p className="text-sm text-muted-foreground">
                  Select a room from the sidebar to start chatting
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Chat View */}
        <div className="flex-1 sm:hidden">
          {selectedRoom ? (
            <ChatWindow room={selectedRoom} />
          ) : (
            <ChatRoomList
              rooms={rooms}
              selectedRoom={selectedRoom}
              onRoomSelect={setSelectedRoom}
              onRoomCreated={(room) => setRooms(prev => [room, ...prev])}
            />
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  )
}