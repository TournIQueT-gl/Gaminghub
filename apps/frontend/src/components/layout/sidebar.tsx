'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  Home,
  Trophy,
  Users,
  MessageCircle,
  User,
  Settings,
  Shield,
  PlusCircle
} from 'lucide-react'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Feed', href: '/feed', icon: Home },
  { name: 'Tournaments', href: '/tournaments', icon: Trophy },
  { name: 'Clans', href: '/clans', icon: Users },
  { name: 'Chat', href: '/chat', icon: MessageCircle },
]

const userNavigation = [
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 pt-16">
      <div className="flex-1 flex flex-col min-h-0 bg-background border-r">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Button variant="gaming" className="w-full">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </div>
          
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    isActive
                      ? 'bg-gaming-primary text-white'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive ? 'text-white' : 'text-muted-foreground group-hover:text-accent-foreground',
                      'mr-3 flex-shrink-0 h-5 w-5'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto">
            <div className="px-2 space-y-1">
              {userNavigation.map((item) => {
                const href = item.href === '/profile' ? `/profile/${user.username || user.id}` : item.href
                const isActive = pathname === href
                return (
                  <Link
                    key={item.name}
                    href={href}
                    className={cn(
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                    )}
                  >
                    <item.icon
                      className={cn(
                        isActive ? 'text-accent-foreground' : 'text-muted-foreground group-hover:text-accent-foreground',
                        'mr-3 flex-shrink-0 h-5 w-5'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                )
              })}
              
              {user.id === 'admin' && (
                <Link
                  href="/admin"
                  className={cn(
                    pathname === '/admin'
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  <Shield
                    className={cn(
                      pathname === '/admin' ? 'text-accent-foreground' : 'text-muted-foreground group-hover:text-accent-foreground',
                      'mr-3 flex-shrink-0 h-5 w-5'
                    )}
                    aria-hidden="true"
                  />
                  Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}