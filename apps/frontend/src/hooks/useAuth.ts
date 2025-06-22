'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/types'
import { authAPI } from '@/lib/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: () => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await authAPI.getUser()
      setUser(response.data)
    } catch (error) {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = () => {
    authAPI.login()
  }

  const logout = () => {
    authAPI.logout()
  }

  return {
    user,
    isLoading,
    login,
    logout,
  }
}