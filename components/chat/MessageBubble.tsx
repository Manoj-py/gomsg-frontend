'use client'

import { Message } from '@/lib/api-client'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  senderName?: string
}

export function MessageBubble({ message, isOwn, senderName }: MessageBubbleProps) {
  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    } catch {
      return ''
    }
  }

  return (
    <div
      className={cn(
        'flex gap-2 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-200',
        isOwn && 'flex-row-reverse'
      )}
    >
      <div
        className={cn(
          'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
          isOwn
            ? 'bg-accent text-accent-foreground rounded-br-none'
            : 'bg-muted text-muted-foreground rounded-bl-none'
        )}
      >
        {!isOwn && senderName && (
          <p className="text-xs font-semibold mb-1 opacity-70">{senderName}</p>
        )}
        <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
      </div>

      <div className={cn('flex items-end gap-1', isOwn ? 'flex-row-reverse' : '')}>
        <div className="text-xs text-muted-foreground">
          {formatTime(message.created_at)}
        </div>
      </div>
    </div>
  )
}
