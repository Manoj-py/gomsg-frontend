'use client'

import { useEffect, useState } from 'react'
import { useChatContext } from '@/app/providers'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface StartChatDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function StartChatDialog({ isOpen, onClose }: StartChatDialogProps) {
  const [users, setUsers] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { getContactsList, getOrCreateChat, addChat, joinGroupHandler } = useChatContext()
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      fetchContacts()
    }
  }, [isOpen])

  const fetchContacts = async () => {
    setIsLoading(true)
    const data = await getContactsList()
    setUsers(data.users || [])
    setGroups(data.groups || [])
    setIsLoading(false)
  }

  const handleUserClick = async (userId: string, username: string) => {

    setIsLoading(true)

    const convoId = await getOrCreateChat(userId)

    if (convoId) {
      addChat({
        id: convoId,
        type: 'direct',
        participantName: username,
        participantId: userId,
        hasMore: false,
        messages: [],
      })
      router.push(`/chat/${convoId}`)
      onClose()
    }

    setIsLoading(false)
  }

  const handleGroupClick = async (groupId: string, groupName: string, groupDesc: string) => {
    setIsLoading(true)

    const convoId = await joinGroupHandler(groupId)

    if (convoId) {
      addChat({
        id: groupId,
        type: 'group',
        name: groupName,
        description: groupDesc,
        hasMore: false,
        messages: [],
      })
      router.push(`/chat/${groupId}`)
      onClose()
    }

    setIsLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl w-full max-w-md">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Start Chat</h2>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          {isLoading && <p>Loading...</p>}

          {/* USERS */}
          {users.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground">Users</p>
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => { handleUserClick(u.id, u.username) }}
                  className="w-full text-left p-2 hover:bg-accent rounded"
                >
                  {u.username}
                </button>
              ))}
            </>
          )}

          {/* GROUPS */}
          {groups.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground mt-3">Groups</p>
              {groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => { handleGroupClick(g.id, g.name, g.description) }}
                  className="w-full text-left p-2 hover:bg-accent rounded"
                >
                  {g.name}
                </button>
              ))}
            </>
          )}
        </div>

        <div className="p-4 border-t">
          <Button onClick={onClose} className="w-full" variant="ghost">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
