'use client'

import { Chat, GroupChat, useChatContext } from '@/app/providers'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface ChatHeaderProps {
  chat?: Chat | GroupChat
}

export function ChatHeader({ chat }: ChatHeaderProps) {
  const { logout, currentUser } = useChatContext()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const getTitle = () => {
    if (!chat) return currentUser?.username || 'Welcome'

    if (chat.type === 'direct') return chat.participantName
    return chat.name
  }

  const getSubtitle = () => {
    if (!chat) return 'Select a chat to start messaging'

    if (chat.type === 'direct') return 'Active now'
    return 'Group Chat'
  }

  const renderIcon = () => {
    if (!chat) {
      return (
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10">
          <span className="text-accent font-semibold">
            {currentUser?.username?.charAt(0).toUpperCase()}
          </span>
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10">
        {chat.type === 'direct' ? (
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-card">

      {/* LEFT */}
      <div className="flex items-center gap-3">
        {renderIcon()}
        <div>
          <h1 className="font-semibold text-foreground">{getTitle()}</h1>
          <p className="text-xs text-muted-foreground">{getSubtitle()}</p>
        </div>
      </div>

      {/* RIGHT (always visible) */}
      <div className="flex items-center gap-3">
        <div className="text-sm text-muted-foreground">
          {currentUser?.username}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-destructive hover:bg-destructive/10"
        >
          Logout
        </Button>
      </div>
    </div>
  )
}
