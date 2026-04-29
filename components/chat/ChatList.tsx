'use client'

import { useChatContext, Chat, GroupChat } from '@/app/providers'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { CreateGroupDialog } from './CreateGroupDialog'
import { StartChatDialog } from './StartChatDialog'

export function ChatList({ selectedChatId }: { selectedChatId?: string }) {
  const { chats } = useChatContext()
  const router = useRouter()
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [isStartChatOpen, setIsStartChatOpen] = useState(false)

  const directChats = chats.filter((c) => c.type === 'direct') as Chat[]
  const groupChats = chats.filter((c) => c.type === 'group') as GroupChat[]

  const handleSelectChat = (chatId: string) => {
    router.push(`/chat/${chatId}`)
  }

  const getLastMessageText = (chat: Chat | GroupChat) => {
    if (chat.messages.length === 0) return 'No messages'
    const lastMsg = chat.messages[chat.messages.length - 1]
    return lastMsg.content.substring(0, 40) + (lastMsg.content.length > 40 ? '...' : '')
  }

  const formatTime = (timestamp: string | number) => {
    const now = Date.now()
    const time = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp
    const diff = now - time
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'now'
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`

    return new Date(time).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <>
      <div className="h-full flex flex-col bg-sidebar border-r border-sidebar-border">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-sidebar-foreground">Messages</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsStartChatOpen(true)}
              className="p-1.5 hover:bg-sidebar-accent rounded-lg transition-colors text-sidebar-foreground"
              title="Start new chat"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v14m7-7H5"
                />
              </svg>
            </button>
            <button
              onClick={() => setIsCreateGroupOpen(true)}
              className="p-1.5 hover:bg-sidebar-accent rounded-lg transition-colors text-sidebar-foreground"
              title="Create group"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </button>
          </div>
        </div>


        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">No chats yet. Start a conversation!</p>
            </div>
          ) : (
            <div className="divide-y divide-sidebar-border">
              {/* Direct Chats */}
              {directChats.length > 0 && (
                <>
                  <div className="px-4 py-3 text-xs font-semibold uppercase text-muted-foreground bg-sidebar">
                    Direct Messages
                  </div>
                  {directChats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => handleSelectChat(chat.id)}
                      className={cn(
                        'w-full px-4 py-3 text-left hover:bg-sidebar-accent transition-colors',
                        selectedChatId === chat.id && 'bg-sidebar-accent'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sidebar-foreground truncate">
                            {chat.participantName}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {getLastMessageText(chat)}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {chat.messages.length > 0 && formatTime(chat.messages[chat.messages.length - 1].created_at)}
                        </span>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {/* Group Chats */}
              {groupChats.length > 0 && (
                <>
                  <div className="px-4 py-3 text-xs font-semibold uppercase text-muted-foreground bg-sidebar">
                    Groups
                  </div>
                  {groupChats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => handleSelectChat(chat.id)}
                      className={cn(
                        'w-full px-4 py-3 text-left hover:bg-sidebar-accent transition-colors',
                        selectedChatId === chat.id && 'bg-sidebar-accent'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sidebar-foreground truncate">
                            {chat.name}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {getLastMessageText(chat)}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground ">
                          {chat.messages.length > 0 && formatTime(chat.messages[chat.messages.length - 1].created_at)}
                        </span>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <CreateGroupDialog isOpen={isCreateGroupOpen} onClose={() => setIsCreateGroupOpen(false)} />
      <StartChatDialog isOpen={isStartChatOpen} onClose={() => setIsStartChatOpen(false)} />
    </>
  )
}
