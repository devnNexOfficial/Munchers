'use client'

import { type FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'

export function DeveloperLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsLoading(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setIsLoading(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    router.replace('/developer/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg bg-white p-6 shadow-sm">
      <h1 className="mb-1 text-2xl font-black text-muncherz-black">Developer Login</h1>
      <p className="mb-6 text-sm font-medium text-gray-500">Sign in with your developer credentials.</p>

      <label className="mb-4 block">
        <span className="mb-1 block text-sm font-bold text-gray-700">Email</span>
        <input
          type="email"
          value={email}
          autoComplete="email"
          required
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-muncherz-red focus:outline-none focus:ring-2 focus:ring-muncherz-red/20"
        />
      </label>

      <label className="mb-4 block">
        <span className="mb-1 block text-sm font-bold text-gray-700">Password</span>
        <input
          type="password"
          value={password}
          autoComplete="current-password"
          required
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-muncherz-red focus:outline-none focus:ring-2 focus:ring-muncherz-red/20"
        />
      </label>

      <label className="mb-6 block">
        <span className="mb-1 block text-sm font-bold text-gray-700">2FA code</span>
        <input
          type="text"
          inputMode="numeric"
          value={code}
          autoComplete="one-time-code"
          onChange={(event) => setCode(event.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-muncherz-red focus:outline-none focus:ring-2 focus:ring-muncherz-red/20"
        />
      </label>

      {error && <p className="mb-4 text-sm font-semibold text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-muncherz-red px-4 py-3 text-sm font-black text-white transition hover:bg-red-700"
      >
        {isLoading ? 'Signing in...' : 'Login'}
      </button>
    </form>
  )
}
