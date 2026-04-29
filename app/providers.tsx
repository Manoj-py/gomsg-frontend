'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import {
  registerUser,
  loginUser,
  getCurrentUser,
  getDirectMessages,
  getGroups,
  getOrCreateConversation,
  getMessages,
  createGroup,
  logoutUser,
  DirectMessage,
  Group,
  Message,
  getContacts,
  joinGroup,
} from '@/lib/api-client'

export interface User {
  id: string
  username: string
}

export interface Chat {
  id: string
  type: 'direct'
  participantId: string
  participantName: string
  messages: Message[]
  hasMore: boolean
}

export interface GroupChat {
  id: string
  type: 'group'
  name: string
  description: string
  messages: Message[]
  hasMore: boolean
}

type ChatType = Chat | GroupChat

interface ChatContextType {
  // Auth
  currentUser: User | null
  isAuthenticated: boolean
  isLoading: boolean
  authError: string | null

  // Chats
  chats: ChatType[]
  directMessages: DirectMessage[]
  groups: Group[]

  // Actions
  register: (userName: string, password: string, confirmPassword: string) => Promise<void>
  login: (userName: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  loadDirectMessages: () => Promise<void>
  loadGroups: () => Promise<void>
  getOrCreateChat: (userId?: string, groupId?: string) => Promise<string | null>
  loadMessages: (chatId: string, limit?: number, offset?: number) => Promise<void>
  sendMessage: (chatId: string, content: string) => Promise<void>
  createNewGroup: (name: string, description: string) => Promise<void>
  addMessageToChat: (chatId: string, message: Message) => void
  hasMoreMessages: Record<string, boolean>
  loadMoreMessages: (chatId: string) => Promise<void>
  addChat: (newChat: ChatType) => void
  joinGroupHandler: (convoId: string) => Promise<boolean>
  getContactsList: () => Promise<{
    users: { id: string; username: string }[]
    groups: { id: string; name: string; description: string }[]
  }>

}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  // Chat state
  const [chats, setChats] = useState<ChatType[]>([])
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [hasMoreMessages, setHasMoreMessages] = useState<Record<string, boolean>>({})
  const [messageOffsets, setMessageOffsets] = useState<Record<string, number>>({})

  // Check authentication on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await getCurrentUser()

      if (result.success && result.data) {
        const userData: User = {
          id: result.data.user_id,
          username: result.data.user_name,
        }
        setCurrentUser(userData)
        setIsAuthenticated(true)
        setAuthError(null)

        // Load chats after confirming auth
        await Promise.all([loadDirectMessages(), loadGroups()])
      } else {
        setCurrentUser(null)
        setIsAuthenticated(false)
        setChats([])
        setDirectMessages([])
        setGroups([])
      }
    } catch (error) {
      console.error('[v0] Auth check failed:', error)
      setCurrentUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(
    async (userName: string, password: string, confirmPassword: string) => {
      try {
        setAuthError(null)
        const result = await registerUser(userName, password, confirmPassword)

        if (!result.success) {
          setAuthError(result.error || 'Registration failed')
          throw new Error(result.error || 'Registration failed')
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Registration failed'
        setAuthError(message)
        throw error
      }
    },
    []
  )

  const login = useCallback(async (userName: string, password: string) => {
    try {
      setAuthError(null)
      const result = await loginUser(userName, password)

      if (!result.success) {
        setAuthError(result.error || 'Login failed')
        throw new Error(result.error || 'Login failed')
      }

      // After successful login, check auth to get user info
      await checkAuth()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      setAuthError(message)
      throw error
    }
  }, [checkAuth])

  const logout = useCallback(async () => {
    try {
      await logoutUser()
      setCurrentUser(null)
      setIsAuthenticated(false)
      setChats([])
      setDirectMessages([])
      setGroups([])
      setAuthError(null)
    } catch (error) {
      console.error('[v0] Logout failed:', error)
    }
  }, [])

  const loadDirectMessages = useCallback(async () => {
    try {
      const result = await getDirectMessages()
      if (result.success && result.data) {
        setDirectMessages(result.data)

        // Convert direct messages to Chat objects
        const directChats: Chat[] = result.data.map((dm) => ({
          id: dm.conversation_id,
          type: 'direct' as const,
          participantId: dm.other_user_id,
          participantName: dm.other_username,
          messages: [],
          hasMore: true,
        }))

        setChats((prev) => {
          const groupChats = prev.filter((c) => c.type === 'group')
          return [...directChats, ...groupChats]
        })

        // Initialize hasMore for each chat
        const hasMoreMap: Record<string, boolean> = {}
        directChats.forEach((chat) => {
          hasMoreMap[chat.id] = true
        })
        setHasMoreMessages((prev) => ({ ...prev, ...hasMoreMap }))
      }
    } catch (error) {
      console.error('[v0] Failed to load direct messages:', error)
    }
  }, [])

  const loadGroups = useCallback(async () => {
    try {
      const result = await getGroups()
      if (result.success && result.data) {
        setGroups(result.data)

        // Convert groups to GroupChat objects
        const groupChats: GroupChat[] = result.data.map((g) => ({
          id: g.id,
          type: 'group' as const,
          name: g.name,
          description: g.description,
          messages: [],
          hasMore: true,
        }))

        setChats((prev) => {
          const directChats = prev.filter((c) => c.type === 'direct')
          return [...directChats, ...groupChats]
        })

        // Initialize hasMore for each group
        const hasMoreMap: Record<string, boolean> = {}
        groupChats.forEach((chat) => {
          hasMoreMap[chat.id] = true
        })
        setHasMoreMessages((prev) => ({ ...prev, ...hasMoreMap }))
      }
    } catch (error) {
      console.error('[v0] Failed to load groups:', error)
    }
  }, [])

  const getOrCreateChat = useCallback(
    async (recieverUserId?: string): Promise<string | null> => {
      try {
        const result = await getOrCreateConversation(recieverUserId)
        if (result.success && result.data) {
          return result.data.convo_id
        }
        return null
      } catch (error) {
        console.error('[v0] Failed to get or create conversation:', error)
        return null
      }
    },
    []
  )

  const loadMessages = useCallback(
    async (chatId: string, limit: number = 20, offset: number = 0) => {
      try {
        const result = await getMessages(chatId, limit, offset)

        if (result.success && result.data) {
          setChats((prevChats) =>
            prevChats.map((chat) => {
              if (chat.id !== chatId) return chat

              const existingMessages = chat.messages || []
              const incomingMessages = result.data!.messages || []

              const messages =
                offset === 0
                  ? incomingMessages
                  : [...incomingMessages, ...existingMessages]

              return {
                ...chat,
                messages,
                hasMore: !result.data!.end_of_list,
              }
            })
          )

          setHasMoreMessages((prev) => ({
            ...prev,
            [chatId]: !result.data!.end_of_list,
          }))

          setMessageOffsets((prev) => ({
            ...prev,
            [chatId]: offset + limit,
          }))
        }
      } catch (error) {
        console.error('[v0] Failed to load messages:', error)
      }
    },
    []
  )
  const loadMoreMessages = useCallback(
    async (chatId: string) => {
      if (!hasMoreMessages[chatId]) return

      const currentOffset = messageOffsets[chatId] || 20
      await loadMessages(chatId, 20, currentOffset)
    },
    [hasMoreMessages, messageOffsets, loadMessages]
  )

  const sendMessage = useCallback((chatId: string, content: string) => {
    // This will be handled by WebSocket in ChatDetail component
    return Promise.resolve()
  }, [])

  const createNewGroup = useCallback(
    async (name: string, description: string) => {
      try {
        const result = await createGroup(name, description)
        if (result.success) {
          await loadGroups()
        } else {
          throw new Error(result.error || 'Failed to create group')
        }
      } catch (error) {
        console.error('[v0] Failed to create group:', error)
        throw error
      }
    },
    [loadGroups]
  )

  const getContactsList = useCallback(async () => {
    const result = await getContacts()
    if (result.success && result.data) {
      return result.data
    }
    return { users: [], groups: [] }
  }, [])

  const addMessageToChat = useCallback((chatId: string, newMessage: any) => {
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id !== chatId) return chat

        return {
          ...chat,
          messages: [...(chat.messages || []), newMessage],
        }
      })
    )
  }, [])

  const addChat = useCallback((chat: Chat | GroupChat) => {
    setChats(prev => {
      const exists = prev.find(c => c.id === chat.id)
      if (exists) return prev

      return [...prev, chat]
    })
  }, [])

  const joinGroupHandler = async (convoId: string) => {
    const res = await joinGroup(convoId)

    if (!res.success) return false

    return true
  }

  return (
    <ChatContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isLoading,
        authError,
        chats,
        directMessages,
        groups,
        register,
        login,
        logout,
        checkAuth,
        loadDirectMessages,
        loadGroups,
        getOrCreateChat,
        loadMessages,
        sendMessage,
        createNewGroup,
        addMessageToChat,
        hasMoreMessages,
        loadMoreMessages,
        getContactsList,
        joinGroupHandler,
        addChat
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChatContext must be used within ChatProvider')
  }
  return context
}
