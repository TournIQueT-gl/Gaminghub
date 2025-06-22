'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'

interface MessageInputProps {
  onSendMessage: (content: string) => void
  onTyping: (isTyping: boolean) => void
  disabled?: boolean
}

export function MessageInput({ onSendMessage, onTyping, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  const handleInputChange = (value: string) => {
    setMessage(value)

    // Handle typing indicators
    if (value.trim() && !isTyping) {
      setIsTyping(true)
      onTyping(true)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      onTyping(false)
    }, 1000)
  }

  const handleSend = () => {
    if (!message.trim() || disabled) return

    onSendMessage(message)
    setMessage('')
    
    // Stop typing
    if (isTyping) {
      setIsTyping(false)
      onTyping(false)
    }
    
    // Clear timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Focus back to textarea
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-end space-x-2">
      <div className="flex-1">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Disconnected..." : "Type a message..."}
          disabled={disabled}
          rows={1}
          className="min-h-[40px] max-h-32 resize-none"
        />
      </div>
      
      <Button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        size="icon"
        variant="gaming"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}