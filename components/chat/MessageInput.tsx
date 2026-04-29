'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface MessageInputProps {
  chatId: string
  onSendMessage: (message: string) => void
}

const RATE_LIMIT_MS = 500 // Minimum time between messages
const MAX_MESSAGE_LENGTH = 500

export function MessageInput({ chatId, onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [rateLimitError, setRateLimitError] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lastSentRef = useRef<number>(0)

  // Auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return

    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
  }, [message])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    // Check rate limiting
    const now = Date.now()
    if (now - lastSentRef.current < RATE_LIMIT_MS) {
      setRateLimitError(true)
      setTimeout(() => setRateLimitError(false), 2000)
      return
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      setRateLimitError(true)
      setTimeout(() => setRateLimitError(false), 2000)
      return
    }

    setIsLoading(true)
    try {
      console.log('[v0] Sending message via WebSocket:', message)
      onSendMessage(message)
      lastSentRef.current = Date.now()
      setMessage('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (error) {
      console.error('[v0] Failed to send message:', error)
      setRateLimitError(true)
      setTimeout(() => setRateLimitError(false), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  return (
    <div className="border-t border-border bg-card">
      {rateLimitError && (
        <div className="px-4 py-2 bg-destructive/10 border-b border-destructive/20 text-sm text-destructive">
          Message sent too quickly. Please wait a moment before sending another message.
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="p-4 flex gap-2 items-end"
      >
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Shift+Enter for new line)"
          disabled={isLoading}
          rows={1}
          className="flex-1 px-4 py-2 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none max-h-30"
        />
        <Button
          type="submit"
          disabled={!message.trim() || isLoading}
          size="sm"
        >
          {isLoading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </Button>
      </form>
      <div className="px-4 pb-2 text-xs text-muted-foreground text-right">
        {message.length}/{MAX_MESSAGE_LENGTH}
      </div>
    </div>
  )
}
