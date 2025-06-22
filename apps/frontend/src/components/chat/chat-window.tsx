'use client'

import { useState, useEffect, useRef } from 'react'
import { ChatRoom, ChatMessage } from '@/types'
import { ChatBubble } from './chat-bubble'
import { MessageInput } from './message-input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuth } from '@/hooks/useAuth'
import { useSocket } from '@/hooks/useSocket'
import { chatAPI } from '@/lib/api'
import { Hash, Users } from 'lucide-react'

interface ChatWindowProps {
  room: ChatRoom
}

export function ChatWindow({ room }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const { socket, isConnected, joinRoom, leaveRoom } = useSocket()

  useEffect(() => {
    if (room) {
      loadMessages()
      if (isConnected) {
        joinRoom(room.id.toString())
      }
    }

    return () => {
      if (room && isConnected) {
        leaveRoom(room.id.toString())
      }
    }
  }, [room, isConnected])

  useEffect(() => {
    if (socket && room) {
      const handleNewMessage = (message: ChatMessage) => {
        if (message.roomId === room.id) {
          setMessages(prev => [...prev, message])
        }
      }

      const handleTypingStart = (data: { userId: string; username: string; roomId: string }) => {
        if (data.roomId === room.id.toString() && data.userId !== user?.id) {
          setTypingUsers(prev => 
            prev.includes(data.username) ? prev : [...prev, data.username]
          )
        }
      }

      const handleTypingStop = (data: { userId: string; username: string; roomId: string }) => {
        if (data.roomId === room.id.toString()) {
          setTypingUsers(prev => prev.filter(username => username !== data.username))
        }
      }

      socket.on('chat_message', handleNewMessage)
      socket.on('typing_start', handleTypingStart)
      socket.on('typing_stop', handleTypingStop)

      return () => {
        socket.off('chat_message', handleNewMessage)
        socket.off('typing_start', handleTypingStart)
        socket.off('typing_stop', handleTypingStop)
      }
    }
  }, [socket, room, user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    try {
      const response = await chatAPI.getMessages(room.id)
      setMessages(response.data.reverse()) // API returns newest first, we want oldest first
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !user) return

    try {
      // Send via API for persistence
      await chatAPI.sendMessage(room.id, content)
      
      // Also send via socket for real-time
      if (socket && isConnected) {
        socket.emit('chat_message', {
          roomId: room.id.toString(),
          content
        })
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleTyping = (isTyping: boolean) => {
    if (socket && isConnected && user) {
      socket.emit(isTyping ? 'typing_start' : 'typing_stop', {
        roomId: room.id.toString()
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b p-4 bg-card">
        <div className="flex items-center space-x-2">
          {room.type === 'public' ? <Hash className="h-5 w-5" /> : <Users className="h-5 w-5" />}
          <h2 className="font-semibold">
            {room.name || `${room.type} Chat`}
          </h2>
          {!isConnected && (
            <span className="text-xs text-muted-foreground">(Disconnected)</span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message}
              isOwn={message.userId === user?.id}
            />
          ))
        )}
        
        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="text-sm text-muted-foreground italic">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t p-4">
        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          disabled={!isConnected}
        />
      </div>
    </div>
  )
}