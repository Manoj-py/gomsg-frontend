'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChatContext } from './providers'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function Home() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const { isAuthenticated } = useChatContext()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/chat')
    }
  }, [isAuthenticated, router])

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-accent">
              <svg
                className="w-6 h-6 text-accent-foreground"
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
            </div>
            <h1 className="text-3xl font-bold text-foreground">Chat App</h1>
            <p className="text-muted-foreground">Connect and chat in real-time</p>
          </div>

          {/* Form Card */}
          <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-muted rounded-lg p-1">
              <button
                onClick={() => setTab('login')}
                className={`flex-1 py-2 px-3 rounded-md transition-all font-medium text-sm ${
                  tab === 'login'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setTab('register')}
                className={`flex-1 py-2 px-3 rounded-md transition-all font-medium text-sm ${
                  tab === 'register'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Register
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {tab === 'login' ? (
                <>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Welcome back</h2>
                    <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
                  </div>
                  <div className="mt-6">
                    <LoginForm />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Create account</h2>
                    <p className="text-sm text-muted-foreground mt-1">Join and start chatting</p>
                  </div>
                  <div className="mt-6">
                    <RegisterForm onSuccess={() => setTab('login')} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
