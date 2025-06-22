'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserAvatar } from '@/components/common/user-avatar'
import { NotificationDropdown } from '@/components/common/notification-dropdown'
import { ThemeToggle } from '@/components/common/theme-toggle'
import { 
  Gamepad2, 
  MessageCircle, 
  Trophy, 
  Users, 
  Bell,
  Menu
} from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <Gamepad2 className="h-6 w-6 text-gaming-primary" />
            <span className="hidden font-bold sm:inline-block">GamingX</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 items-center justify-center space-x-6">
          <Link href="/feed" className="text-sm font-medium transition-colors hover:text-gaming-primary">
            Feed
          </Link>
          <Link href="/tournaments" className="text-sm font-medium transition-colors hover:text-gaming-primary">
            <Trophy className="inline h-4 w-4 mr-1" />
            Tournaments
          </Link>
          <Link href="/clans" className="text-sm font-medium transition-colors hover:text-gaming-primary">
            <Users className="inline h-4 w-4 mr-1" />
            Clans
          </Link>
          <Link href="/chat" className="text-sm font-medium transition-colors hover:text-gaming-primary">
            <MessageCircle className="inline h-4 w-4 mr-1" />
            Chat
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4 ml-auto">
          <ThemeToggle />
          
          {user ? (
            <>
              <NotificationDropdown />
              <UserAvatar user={user} showLevel />
            </>
          ) : (
            <Button onClick={() => window.location.href = '/login'}>
              Login
            </Button>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container py-4 space-y-3">
            <Link href="/feed" className="block text-sm font-medium">
              Feed
            </Link>
            <Link href="/tournaments" className="block text-sm font-medium">
              Tournaments
            </Link>
            <Link href="/clans" className="block text-sm font-medium">
              Clans
            </Link>
            <Link href="/chat" className="block text-sm font-medium">
              Chat
            </Link>
            {user && (
              <Link href={`/profile/${user.username || user.id}`} className="block text-sm font-medium">
                Profile
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}