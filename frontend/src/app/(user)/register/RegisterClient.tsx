'use client'

import { type FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/client'

export function RegisterClient() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsLoading(true)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      setIsLoading(false)
      return
    }

    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    setIsLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    router.replace('/login')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-sm rounded-wild-card bg-wild-brown border border-wild-rust p-6 shadow-wild-ember">
      {/* Noise texture overlay */}
      <div className="noise-overlay absolute inset-0" />

      <div className="relative z-10">
        <h1 className="font-display text-3xl font-black text-wild-paper mb-2 tracking-tight">
          Create Account
        </h1>
        <p className="font-body text-wild-paper/70 text-sm mb-6">
          Sign up to start ordering delicious food.
        </p>

        <label className="mb-4 block">
          <span className="section-label text-wild-paper/90 mb-2 block">Full Name</span>
          <input
            type="text"
            value={fullName}
            autoComplete="name"
            required
            onChange={(event) => setFullName(event.target.value)}
            className="wild-input w-full"
          />
        </label>

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

        <label className="mb-4 block">
          <span className="section-label text-wild-paper/90 mb-2 block">Password</span>
          <input
            type="password"
            value={password}
            autoComplete="new-password"
            required
            onChange={(event) => setPassword(event.target.value)}
            className="wild-input w-full"
          />
        </label>

        <label className="mb-6 block">
          <span className="section-label text-wild-paper/90 mb-2 block">Confirm Password</span>
          <input
            type="password"
            value={confirmPassword}
            autoComplete="new-password"
            required
            onChange={(event) => setConfirmPassword(event.target.value)}
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
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>

        <p className="mt-6 text-center text-sm text-wild-paper/70">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-wild-red hover:text-wild-red-light transition-colors">
            Login
          </Link>
        </p>
      </div>
    </form>
  )
}