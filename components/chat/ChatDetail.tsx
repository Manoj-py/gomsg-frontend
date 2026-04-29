'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useChatContext, Chat, GroupChat } from '@/app/providers'
import { useWebSocket } from '@/hooks/useWebSocket'
import { ChatHeader } from './ChatHeader'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { Button } from '@/components/ui/button'

interface ChatDetailProps {
  chatId: string
}

export function ChatDetail({ chatId }: ChatDetailProps) {
  const { chats, currentUser, loadMoreMessages, hasMoreMessages, loadMessages, addMessageToChat } = useChatContext()
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreButtonRef = useRef<HTMLButtonElement>(null)
  const previousMessageCountRef = useRef<number>(0)

  const chat = chats.find((c) => c.id === chatId) as Chat | GroupChat

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback(
    (messageData: any) => {
      console.log('[v0] Received WebSocket message:', messageData)
      if (messageData.conversation_id === chatId) {
        addMessageToChat(chatId, {
          id: messageData.id,
          conversation_id: messageData.conversation_id,
          sender_id: messageData.sender_id,
          content: messageData.content,
          created_at: messageData.created_at,
        })
      }
    },
    [chatId, addMessageToChat]
  )

  // Initialize WebSocket
  const { sendMessage, disconnect } = useWebSocket({
    conversationId: chatId,
    onMessage: handleWebSocketMessage,
    onConnect: () => console.log('[v0] WebSocket connected for chat:', chatId),
    onDisconnect: () => console.log('[v0] WebSocket disconnected for chat:', chatId),
    onError: (error) => console.error('[v0] WebSocket error:', error),
  })

  // Load initial messages
  useEffect(() => {
    const loadInitialMessages = async () => {
      setIsInitialLoading(true)
      await loadMessages(chatId)
      setIsInitialLoading(false)
    }

    loadInitialMessages()
  }, [chatId, loadMessages])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Scroll to bottom only when new messages are added (not when loading older)
  useEffect(() => {
    if (!chat) return

    const currentMessageCount = chat.messages.length
    const previousMessageCount = previousMessageCountRef.current

    // If message count increased AND container is at the bottom, scroll to new messages
    if (currentMessageCount > previousMessageCount && messagesContainerRef.current) {
      const container = messagesContainerRef.current
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100

      // Only auto-scroll if user was already at bottom or this is the first load
      if (isAtBottom || previousMessageCount === 0) {
        setTimeout(() => scrollToBottom(), 0)
      }
    }

    previousMessageCountRef.current = currentMessageCount
  }, [chat?.messages.length, scrollToBottom])

  // Setup intersection observer for scroll-to-load
  useEffect(() => {
    if (!loadMoreButtonRef.current) return

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isLoadingMore && hasMoreMessages[chatId]) {
          handleLoadMore()
        }
      })
    }

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
    })

    observerRef.current.observe(loadMoreButtonRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [chatId, isLoadingMore, hasMoreMessages])

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMoreMessages[chatId]) return
    if (!messagesContainerRef.current) return

    setIsLoadingMore(true)

    // Record the scroll height before loading
    const container = messagesContainerRef.current
    const scrollHeightBefore = container.scrollHeight
    const scrollTopBefore = container.scrollTop

    await loadMoreMessages(chatId)

    // After loading, maintain scroll position relative to content
    // Wait for DOM to update before adjusting scroll
    setTimeout(() => {
      if (messagesContainerRef.current) {
        const scrollHeightAfter = messagesContainerRef.current.scrollHeight
        const heightDifference = scrollHeightAfter - scrollHeightBefore
        messagesContainerRef.current.scrollTop = scrollTopBefore + heightDifference
      }
    }, 0)

    setIsLoadingMore(false)
  }, [chatId, isLoadingMore, hasMoreMessages, loadMoreMessages])

  useEffect(() => {
    return () => {

      disconnect()
    }
  }, [chatId, disconnect])

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col h-full bg-background">
        <ChatHeader chat={chat} />

        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">New chat...</div>
        </div>

        <MessageInput chatId={chatId} onSendMessage={sendMessage} />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <ChatHeader chat={chat} />

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 scroll-smooth"
      >
        {/* Load More Button */}
        {hasMoreMessages[chatId] && (
          <button
            ref={loadMoreButtonRef}
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            {isLoadingMore ? 'Loading older messages...' : 'Load earlier messages'}
          </button>
        )}

        {isInitialLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent mb-3"></div>
              <p className="text-muted-foreground">Loading messages...</p>
            </div>
          </div>
        ) : chat.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <svg
                className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {chat.messages.map((message) => {
              const senderName =
                message.sender_id === currentUser?.id
                  ? undefined
                  : chat.type === 'direct'
                    ? chat.participantName
                    : `User ${message.sender_id.substring(0, 8)}`

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.sender_id === currentUser?.id}
                  senderName={senderName}
                />
              )
            })}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      {<MessageInput chatId={chatId} onSendMessage={sendMessage} />}
    </div>
  )
}
