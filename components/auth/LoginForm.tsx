'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChatContext } from '@/app/providers'
import { Button } from '@/components/ui/button'

export function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useChatContext()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      await login(username, password)
      setUsername('')
      setPassword('')
      router.push('/chat')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="username" className="block text-sm font-medium text-foreground">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          disabled={isLoading}
        />
      </div>

      <Button
        type="submit"
        disabled={!username.trim() || !password.trim() || isLoading}
        className="w-full"
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  )
}
