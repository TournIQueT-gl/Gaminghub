import { ChatMessage } from '@/types'
import { UserAvatar } from '@/components/common/user-avatar'
import { formatTimeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ChatBubbleProps {
  message: ChatMessage
  isOwn: boolean
}

export function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  return (
    <div className={cn(
      "flex items-start space-x-3",
      isOwn && "flex-row-reverse space-x-reverse"
    )}>
      {!isOwn && message.user && (
        <UserAvatar user={message.user} size="sm" />
      )}
      
      <div className={cn(
        "flex flex-col space-y-1 max-w-xs lg:max-w-md",
        isOwn && "items-end"
      )}>
        {!isOwn && (
          <div className="text-xs text-muted-foreground">
            {message.user?.username || message.user?.firstName || 'Anonymous'}
          </div>
        )}
        
        <div className={cn(
          "chat-bubble",
          isOwn ? "chat-bubble-sent" : "chat-bubble-received"
        )}>
          {message.content}
        </div>
        
        <div className="text-xs text-muted-foreground">
          {formatTimeAgo(message.createdAt)}
        </div>
      </div>
    </div>
  )
}