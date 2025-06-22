'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './useAuth'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  joinRoom: (roomId: string) => void
  leaveRoom: (roomId: string) => void
  sendMessage: (roomId: string, content: string) => void
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export function useSocketProvider() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user } = useAuth()
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  useEffect(() => {
    if (user && !socket) {
      initializeSocket()
    }

    return () => {
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setIsConnected(false)
      }
    }
  }, [user])

  const initializeSocket = () => {
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000'
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws`

    const newSocket = io(wsUrl, {
      transports: ['websocket'],
      autoConnect: true,
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      reconnectAttempts.current = 0
      
      if (user) {
        newSocket.emit('auth', {
          userId: user.id,
          username: user.username || user.firstName || 'Anonymous'
        })
      }
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
      handleReconnection()
    })

    newSocket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    setSocket(newSocket)
  }

  const handleReconnection = () => {
    if (reconnectAttempts.current < maxReconnectAttempts) {
      reconnectAttempts.current++
      setTimeout(() => {
        if (socket && !socket.connected) {
          socket.connect()
        }
      }, 1000 * reconnectAttempts.current)
    }
  }

  const joinRoom = (roomId: string) => {
    if (socket && isConnected) {
      socket.emit('join_room', { roomId })
    }
  }

  const leaveRoom = (roomId: string) => {
    if (socket && isConnected) {
      socket.emit('leave_room', { roomId })
    }
  }

  const sendMessage = (roomId: string, content: string) => {
    if (socket && isConnected) {
      socket.emit('chat_message', { roomId, content })
    }
  }

  return {
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
  }
}