'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useChatContext } from '@/app/providers'
import { ChatList } from '@/components/chat/ChatList'

export default function ChatLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ chatId?: string }>
}) {
  const { isAuthenticated } = useChatContext()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div className="hidden sm:flex w-72 border-r border-border flex-col">
        <ChatList />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  )
}
