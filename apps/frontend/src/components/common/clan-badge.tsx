import { Clan } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ClanBadgeProps {
  clan: Clan
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  className?: string
}

export function ClanBadge({ clan, size = 'md', showName = false, className }: ClanBadgeProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  const initials = clan.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={clan.imageUrl || undefined} alt={clan.name} />
          <AvatarFallback className="bg-gaming-secondary text-white text-xs">
            {clan.imageUrl ? initials : <Shield className="h-3 w-3" />}
          </AvatarFallback>
        </Avatar>
      </div>
      
      {showName && size !== 'sm' && (
        <div>
          <div className="font-medium text-sm">{clan.name}</div>
          {clan.memberCount && (
            <div className="text-xs text-muted-foreground">
              {clan.memberCount} members
            </div>
          )}
        </div>
      )}
    </div>
  )
}