'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Gamepad2, ArrowRight } from 'lucide-react'
import { authAPI } from '@/lib/api'

export default function LoginPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gaming-primary"></div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-gaming-primary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-gaming-primary rounded-full flex items-center justify-center">
              <Gamepad2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to GamingX</CardTitle>
          <CardDescription>
            Sign in to access tournaments, clans, and connect with gamers worldwide
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={authAPI.login}
            className="w-full gaming-gradient text-white"
            size="lg"
          >
            Sign in with Replit
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardContent>
      </Card>
    </div>
  )
}