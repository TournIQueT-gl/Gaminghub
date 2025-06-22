'use client'

import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Navbar } from './navbar'
import { Sidebar } from './sidebar'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-64">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}