import { useEffect, useRef, useCallback } from 'react'

export interface WebSocketMessage {
  type: 'new_message'
  data: {
    id: string
    conversation_id: string
    sender_id: string
    content: string
    created_at: string
  }
}

interface UseWebSocketOptions {
  conversationId: string
  onMessage: (message: WebSocketMessage['data']) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
}

const WS_URL = 'ws://localhost:4000/v1/ws'

export function useWebSocket({
  conversationId,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptRef = useRef(0)

  const isConnectingRef = useRef(false)
  const isManuallyClosedRef = useRef(false)

  const maxReconnectAttempts = 5
  const reconnectDelayMs = 3000

  const connect = useCallback(() => {
    // ✅ Prevent duplicate connections
    if (wsRef.current || isConnectingRef.current) return

    isConnectingRef.current = true
    isManuallyClosedRef.current = false

    console.log('[v0] Connecting to WebSocket:', WS_URL)

    const ws = new WebSocket(WS_URL)

    ws.onopen = () => {
      console.log('[v0] WebSocket connected')
      reconnectAttemptRef.current = 0

      isConnectingRef.current = false
      onConnect?.()
      // 🔥 send queued messages
      while (messageQueueRef.current.length > 0) {
        const msg = messageQueueRef.current.shift()
        if (msg) {
          ws.send(msg)
        }
      }
    }

    ws.onmessage = (event) => {
      try {
        const parsedMessage: WebSocketMessage = JSON.parse(event.data)

        if (parsedMessage.type === 'new_message' && parsedMessage.data) {
          onMessage(parsedMessage.data)
        }
      } catch (error) {
        console.error('[v0] Failed to parse WebSocket message:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('[v0] WebSocket error:', error)
      onError?.(error)
    }

    ws.onclose = () => {
      console.log('[v0] WebSocket disconnected')

      wsRef.current = null
      isConnectingRef.current = false
      onDisconnect?.()

      // ❌ Don't reconnect if manually closed
      if (isManuallyClosedRef.current) return

      // ✅ Controlled reconnect
      if (reconnectAttemptRef.current < maxReconnectAttempts) {
        reconnectAttemptRef.current += 1

        const delay =
          reconnectDelayMs * Math.pow(1.5, reconnectAttemptRef.current - 1)

        console.log(
          `[v0] Reconnecting in ${delay}ms (attempt ${reconnectAttemptRef.current})`
        )

        reconnectTimeoutRef.current = setTimeout(connect, delay)
      }
    }

    wsRef.current = ws
  }, [onMessage, onConnect, onDisconnect, onError])

  const messageQueueRef = useRef<string[]>([])

  const sendMessage = useCallback(
    (content: string) => {
      const payload = JSON.stringify({
        type: 'new_message',
        data: {
          conversation_id: conversationId,
          content,
        },
      })

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        console.log('[v0] Sending WS message:', payload)
        wsRef.current.send(payload)
      } else {
        console.warn('[v0] WS not ready, queueing message')
        messageQueueRef.current.push(payload)
      }
    },
    [conversationId]
  )

  const disconnect = useCallback(() => {
    isManuallyClosedRef.current = true

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    if (!wsRef.current) return

    const ws = wsRef.current
    if (ws.readyState === WebSocket.OPEN) {
      ws.close()
    } else if (ws.readyState === WebSocket.CONNECTING) {
      ws.onopen = () => {
        ws.close()
      }
    }

    wsRef.current = null
  }, [])

  useEffect(() => {
    connect()

    return () => {
      // ⚠️ IMPORTANT: avoid strict mode double disconnect issues
      if (process.env.NODE_ENV === 'production') {
        disconnect()
      }
    }
  }, [connect, disconnect])

  return {
    sendMessage,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    disconnect,
  }
}