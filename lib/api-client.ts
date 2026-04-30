const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface LoginResponse {
  success: boolean
  message?: string
}

export interface DirectMessage {
  conversation_id: string
  other_user_id: string
  other_username: string
}

export interface Group {
  id: string
  type: 'group'
  name: string
  description: string
}

export interface ConversationResponse {
  convo_id: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
}

export interface MessagesResponse {
  messages: Message[]
  end_of_list: boolean
}

export interface CurrentUserResponse {
  user_id: string
  user_name: string
}

export interface ContactsResponse {
  users: {
    id: string
    username: string
  }[]
  groups: {
    id: string
    name: string
    description: string
  }[]
}


// Register API
export async function registerUser(
  userName: string,
  password: string,
  confirmPassword: string
): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_name: userName,
        password,
        confirm_password: confirmPassword,
      }),
      credentials: 'include',
    })

    const data = await response.json()
    return {
      success: response.ok,
      data,
      error: !response.ok ? data.error || 'Registration failed' : undefined,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
    }
  }
}


// Login API
export async function loginUser(userName: string, password: string): Promise<ApiResponse<LoginResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_name: userName,
        password,
      }),
      credentials: 'include',
    })

    const data = await response.json()
    return {
      success: response.ok,
      data: data as LoginResponse,
      error: !response.ok ? data.error || 'Login failed' : undefined,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    }
  }
}

// Get current user info
export async function getCurrentUser(): Promise<ApiResponse<CurrentUserResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (response.status === 401) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    const data = await response.json()
    return {
      success: response.ok,
      data: data as CurrentUserResponse,
      error: !response.ok ? data.error : undefined,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user',
    }
  }
}

// Get direct messages
export async function getDirectMessages(): Promise<ApiResponse<DirectMessage[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/direct-msgs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    const data = await response.json()
    return {
      success: response.ok,
      data: (data as DirectMessage[]) || [],
      error: !response.ok ? data.error : undefined,
    }
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch direct messages',
    }
  }
}

// Get groups
export async function getGroups(): Promise<ApiResponse<Group[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/groups`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    const data = await response.json()
    return {
      success: response.ok,
      data: (data as Group[]) || [],
      error: !response.ok ? data.error : undefined,
    }
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch groups',
    }
  }
}

// Get or create conversation
export async function getOrCreateConversation(recieverUserId?: string): Promise<ApiResponse<ConversationResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/convo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...(recieverUserId && { reciever_user_id: recieverUserId }),
      }),
      credentials: 'include',
    })

    const data = await response.json()
    return {
      success: response.ok,
      data: data as ConversationResponse,
      error: !response.ok ? data.error || 'Failed to get conversation' : undefined,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get conversation',
    }
  }
}

// Get messages with pagination
export async function getMessages(
  conversationId: string,
  limit: number = 5,
  offset: number = 0
): Promise<ApiResponse<MessagesResponse>> {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      id: conversationId,
    })

    const response = await fetch(`${API_BASE_URL}/v1/msgs?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    const data = await response.json()

    return {
      success: response.ok,
      data: data as MessagesResponse,
      error: !response.ok ? data.error : undefined,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch messages',
    }
  }
}

// Create group
export async function createGroup(name: string, description: string): Promise<ApiResponse<Group>> {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/group`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
      }),
      credentials: 'include',
    })

    const data = await response.json()
    return {
      success: response.ok,
      data: data as Group,
      error: !response.ok ? data.error || 'Failed to create group' : undefined,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create group',
    }
  }
}

// Logout
export async function logoutUser(): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    return {
      success: response.ok,
      error: !response.ok ? 'Logout failed' : undefined,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Logout failed',
    }
  }
}

export async function getContacts(): Promise<ApiResponse<ContactsResponse>> {
  try {
    const res = await fetch(`${API_BASE_URL}/v1/contacts`, {
      method: 'GET',
      credentials: 'include',
    })

    const data = await res.json()

    return {
      success: res.ok,
      data,
      error: !res.ok ? data.error : undefined,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch contacts',
    }
  }
}
export async function joinGroup(convoId: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/join-group`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        convo_id: convoId,
      }),
      credentials: 'include',
    })

    let data = null
    try {
      data = await response.json()
    } catch {
      // backend returned empty body → fine
    }

    return {
      success: response.ok,
      data, // will be null → expected
      error: !response.ok ? data?.error || 'Failed to join group' : undefined,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to join group',
    }
  }
}