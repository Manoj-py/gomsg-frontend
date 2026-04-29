'use client'

import { use } from 'react'
import { ChatDetail } from '@/components/chat/ChatDetail'

export default function ChatDetailPage({
  params,
}: {
  params: Promise<{ chatId: string }>
}) {
  const { chatId } = use(params)

  return <ChatDetail chatId={chatId} />
}
