'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!configured) return

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#0f1117' }}
    >
      <div
        className="w-full max-w-sm rounded-lg border p-8"
        style={{ borderColor: '#1e2330', backgroundColor: '#13161f' }}
      >
        <h1
          className="text-xl font-bold text-white mb-1"
          style={{ fontFamily: 'monospace' }}
        >
          Apex Workspace
        </h1>
        <p className="text-sm mb-8" style={{ color: '#6b7280' }}>
          Sign in to your workspace
        </p>

        {!configured ? (
          <p className="text-xs text-amber-400 bg-amber-950/30 border border-amber-900 rounded px-3 py-2">
            Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and
            NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: '#6b7280' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 rounded border text-sm text-white outline-none focus:border-blue-500 transition-colors"
                style={{ backgroundColor: '#0f1117', borderColor: '#1e2330' }}
                placeholder="you@apextsg.com"
              />
            </div>

            <div>
              <label className="block text-xs mb-1.5" style={{ color: '#6b7280' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 rounded border text-sm text-white outline-none focus:border-blue-500 transition-colors"
                style={{ backgroundColor: '#0f1117', borderColor: '#1e2330' }}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-950/30 border border-red-900 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded text-sm font-medium text-white transition-opacity disabled:opacity-60"
              style={{ backgroundColor: '#3B82F6' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
