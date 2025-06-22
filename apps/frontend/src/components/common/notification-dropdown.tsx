'use client'

import { useState, useEffect } from 'react'
import { Bell, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { notificationsAPI } from '@/lib/api'
import { Notification } from '@/types'
import { formatTimeAgo } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const response = await notificationsAPI.getNotifications()
      setNotifications(response.data)
      setUnreadCount(response.data.filter((n: Notification) => !n.isRead).length)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      await notificationsAPI.markAsRead(id)
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gaming-danger text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-4 cursor-pointer ${
                  !notification.isRead ? 'bg-accent/50' : ''
                }`}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{notification.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {formatTimeAgo(notification.createdAt)}
                    </div>
                  </div>
                  {!notification.isRead && (
                    <div className="ml-2 h-2 w-2 rounded-full bg-gaming-primary flex-shrink-0" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}