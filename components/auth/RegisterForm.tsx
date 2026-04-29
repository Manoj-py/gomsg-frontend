'use client'

import { useState } from 'react'
import { useChatContext } from '@/app/providers'
import { Button } from '@/components/ui/button'

interface RegisterFormProps {
  onSuccess?: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register } = useChatContext()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) return

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await register(username, password, confirmPassword)
      setUsername('')
      setPassword('')
      setConfirmPassword('')
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
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
        <label htmlFor="reg-username" className="block text-sm font-medium text-foreground">
          Username
        </label>
        <input
          id="reg-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a username"
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="reg-password" className="block text-sm font-medium text-foreground">
          Password
        </label>
        <input
          id="reg-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground">
          Confirm Password
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          disabled={isLoading}
        />
      </div>

      <Button
        type="submit"
        disabled={!username.trim() || !password.trim() || !confirmPassword.trim() || isLoading}
        className="w-full"
      >
        {isLoading ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  )
}
