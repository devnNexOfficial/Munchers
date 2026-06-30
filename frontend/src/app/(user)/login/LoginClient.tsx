'use client'

import { type FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/client'

export function LoginClient() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

    router.replace('/')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-sm rounded-wild-card bg-wild-brown border border-wild-rust p-6 shadow-wild-ember">
      {/* Noise texture overlay */}
      <div className="noise-overlay absolute inset-0" />

      <div className="relative z-10">
        <h1 className="font-display text-3xl font-black text-wild-paper mb-2 tracking-tight">
          Login
        </h1>
        <p className="font-body text-wild-paper/70 text-sm mb-6">
          Sign in with your credentials to continue.
        </p>

        <label className="mb-4 block">
          <span className="section-label text-wild-paper/90 mb-2 block">Email</span>
          <input
            type="email"
            value={email}
            autoComplete="email"
            required
            onChange={(event) => setEmail(event.target.value)}
            className="wild-input w-full"
          />
        </label>

        <label className="mb-6 block">
          <span className="section-label text-wild-paper/90 mb-2 block">Password</span>
          <input
            type="password"
            value={password}
            autoComplete="current-password"
            required
            onChange={(event) => setPassword(event.target.value)}
            className="wild-input w-full"
          />
        </label>

        {error && (
          <div className="mb-4 rounded-wild-button bg-red-900/30 border border-red-700/50 px-4 py-3">
            <p className="text-sm font-semibold text-red-300">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full"
        >
          {isLoading ? 'Signing in...' : 'Login'}
        </button>

        <p className="mt-6 text-center text-sm text-wild-paper/70">
          Don&#39;t have an account?{' '}
          <Link href="/register" className="font-bold text-wild-red hover:text-wild-red-light transition-colors">
            Sign Up
          </Link>
        </p>
      </div>
    </form>
  )
}