'use client'

import { SocketContext, useSocketProvider } from '@/hooks/useSocket'

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socket = useSocketProvider()

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}