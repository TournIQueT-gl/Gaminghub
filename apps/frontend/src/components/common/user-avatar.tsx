import { User } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getLevel, formatXP } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  user: User
  size?: 'sm' | 'md' | 'lg'
  showLevel?: boolean
  className?: string
}

export function UserAvatar({ user, size = 'md', showLevel = false, className }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  }

  const level = getLevel(user.xp)
  const initials = user.username 
    ? user.username.slice(0, 2).toUpperCase()
    : user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'U'

  return (
    <div className={cn('relative flex items-center space-x-2', className)}>
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={user.profileImageUrl || undefined} alt={user.username || 'User'} />
          <AvatarFallback className="bg-gaming-primary text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        {showLevel && (
          <div className="absolute -bottom-1 -right-1 bg-gaming-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-background">
            {level}
          </div>
        )}
      </div>
      
      {showLevel && size !== 'sm' && (
        <div className="hidden sm:block">
          <div className="text-sm font-medium">{user.username || user.firstName}</div>
          <div className="text-xs text-muted-foreground">
            Level {level} • {formatXP(user.xp)}
          </div>
        </div>
      )}
    </div>
  )
}