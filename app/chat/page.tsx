'use client'

import { useChatContext } from '@/app/providers'
import { ChatHeader } from '@/components/chat/ChatHeader'

export default function ChatPage() {
  const { chats } = useChatContext()

  const hasChats = chats.length > 0

  return (
    <div className="flex flex-col h-full bg-background">

      {/* ✅ HEADER ALWAYS AT TOP */}
      <ChatHeader />

      {/* ✅ CONTENT AREA */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">

          {/* ICON */}
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
              <svg
                className={`w-8 h-8 ${hasChats ? 'text-accent' : 'text-muted-foreground opacity-50'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
          </div>

          {/* TITLE */}
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Welcome to Chat
          </h2>

          {/* DESCRIPTION */}
          <p className="text-muted-foreground mb-4">
            {hasChats
              ? 'Select a conversation from the sidebar to start messaging'
              : 'No conversations yet. Start a new chat to begin'}
          </p>

          {/* EXTRA TIP */}
          {hasChats && (
            <p className="text-xs text-muted-foreground">
              Tip: Click on any chat on the left to open it
            </p>
          )}
        </div>
      </div>
    </div>
  )
}