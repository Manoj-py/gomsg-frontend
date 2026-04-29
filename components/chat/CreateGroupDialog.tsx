'use client'

import { useState } from 'react'
import { useChatContext } from '@/app/providers'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface CreateGroupDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateGroupDialog({ isOpen, onClose }: CreateGroupDialogProps) {
  const [groupName, setGroupName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { createNewGroup } = useChatContext()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupName.trim()) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 300))
    createNewGroup(groupName, description)
    setGroupName('')
    setDescription('')
    setIsLoading(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border shadow-lg max-w-md w-full">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Create New Group</h2>
          <p className="text-sm text-muted-foreground mt-1">Start a new group chat with your team</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="groupName" className="block text-sm font-medium text-foreground">
              Group Name
            </label>
            <input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g., Project Alpha"
              className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-foreground">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this group about?"
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!groupName.trim() || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
