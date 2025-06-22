'use client'

import { useAuth } from '@/hooks/useAuth'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { LandingPage } from '@/components/pages/landing-page'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function HomePage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return <LandingPage />
  }

  return (
    <AuthenticatedLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Welcome to GamingX</h1>
        <p className="text-muted-foreground">
          Your gaming journey starts here. Check out the latest posts, join tournaments, and connect with your clan.
        </p>
      </div>
    </AuthenticatedLayout>
  )
}