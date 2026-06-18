// File: src/app/developer/login/page.tsx
'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { z } from 'zod'

import useAuthStore from '../../../store/useAuthStore'

const developerCredentialsSchema = z.object({
  email: z.string().email('Enter a valid developer email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type DeveloperCredentials = z.infer<typeof developerCredentialsSchema>

type DeveloperPasswordResponse = {
  ok?: boolean
  error?: string
}

type DeveloperMfaResponse = {
  session?: {
    access_token: string
    user: {
      id: string
      email?: string
    }
  }
  error?: string
}

export default function DeveloperLoginPage(): JSX.Element {
  const [phase, setPhase] = useState<'credentials' | 'totp'>('credentials')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [email, setEmail] = useState<string>('')
  const [totp, setTotp] = useState<string[]>(['', '', '', '', '', ''])
  const totpInputsRef = useRef<Array<HTMLInputElement | null>>([])
  const authStore = useAuthStore()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<DeveloperCredentials>()

  useEffect(() => {
    if (phase === 'totp') {
      totpInputsRef.current[0]?.focus()
    }
  }, [phase])

  async function onCredentials(values: DeveloperCredentials): Promise<void> {
    setSubmitting(true)
    setServerError(null)

    try {
      const parsed = developerCredentialsSchema.safeParse(values)
      if (!parsed.success) {
        parsed.error.errors.forEach((issue) => {
          const path = issue.path[0]
          if (typeof path === 'string') {
            setError(path as keyof DeveloperCredentials, { type: 'validation', message: issue.message })
          }
        })
        return
      }

      const response = await fetch('/api/auth/verify-developer-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: parsed.data.email,
          password: parsed.data.password,
        }),
      })
      const data = (await response.json()) as DeveloperPasswordResponse

      if (response.ok && data.ok) {
        setEmail(parsed.data.email)
        setTotp(['', '', '', '', '', ''])
        setPhase('totp')
        return
      }

      setServerError(data.error ?? 'Invalid developer credentials')
    } catch (error) {
      setServerError((error as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  async function onVerifyTotp(): Promise<void> {
    setSubmitting(true)
    setServerError(null)

    try {
      const code = totp.join('')
      if (!/^[0-9]{6}$/.test(code)) {
        setServerError('Enter the complete 6-digit authenticator code')
        return
      }

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code, purpose: 'developer' }),
      })
      const data = (await response.json()) as DeveloperMfaResponse

      if (response.ok && data.session) {
        authStore.initializeFromServer({
          user: {
            id: data.session.user.id,
            email: data.session.user.email ?? email,
            role: 'developer',
            has_mfa: true,
            updated_at: new Date().toISOString(),
          },
          token: data.session.access_token,
        })
        return
      }

      setServerError(data.error ?? 'MFA verification failed')
    } catch (error) {
      setServerError((error as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleTotpChange(index: number, value: string): void {
    if (!/^[0-9]?$/.test(value)) return

    const next = [...totp]
    next[index] = value
    setTotp(next)

    if (value && index < 5) {
      totpInputsRef.current[index + 1]?.focus()
    }
  }

  function handleTotpKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Backspace' && !totp[index] && index > 0) {
      totpInputsRef.current[index - 1]?.focus()
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-4 py-8 text-white">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center gap-6 lg:grid-cols-[1fr_420px]">
        <div className="hidden rounded-lg border border-[#262626] bg-[#111111] p-6 lg:block">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#F7B731]">Administrative Master Terminal</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Developer control access</h1>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {['Credential Evaluation', 'TOTP Challenge', 'Session Minting', 'Audit Ready'].map((item, index) => (
              <div key={item} className="rounded-md border border-[#2F2F2F] bg-[#0A0A0A] p-4">
                <p className="text-xs font-semibold text-[#F7B731]">PHASE {index + 1}</p>
                <p className="mt-2 text-sm text-[#D6D6D6]">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[#262626] bg-[#141414] p-6 shadow-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#F7B731]">{phase === 'credentials' ? 'Phase 1' : 'Phase 2'}</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{phase === 'credentials' ? 'Credential evaluation' : 'Cryptographic TOTP'}</h2>
          <p className="mt-2 text-sm text-[#D6D6D6]">
            {phase === 'credentials' ? 'Validate the developer account before requesting the second factor.' : `Enter the 6-digit authenticator code for ${email}.`}
          </p>

          {phase === 'credentials' ? (
            <form onSubmit={handleSubmit(onCredentials)} className="mt-6 space-y-4">
              <div>
                <label htmlFor="developer-email" className="block text-sm font-medium text-[#F7B731]">
                  Email
                </label>
                <input
                  id="developer-email"
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className="mt-2 block w-full rounded-md border border-[#343434] bg-[#0A0A0A] px-3 py-2 text-white outline-none placeholder:text-[#777777] focus:border-[#F7B731]"
                />
                {errors.email && <p className="mt-2 text-xs text-[#FF6B6B]">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="developer-password" className="block text-sm font-medium text-[#F7B731]">
                  Password
                </label>
                <input
                  id="developer-password"
                  {...register('password')}
                  type="password"
                  autoComplete="current-password"
                  className="mt-2 block w-full rounded-md border border-[#343434] bg-[#0A0A0A] px-3 py-2 text-white outline-none placeholder:text-[#777777] focus:border-[#F7B731]"
                />
                {errors.password && <p className="mt-2 text-xs text-[#FF6B6B]">{errors.password.message}</p>}
              </div>

              {serverError && <p className="rounded-md border border-[#D62828]/40 bg-[#D62828]/10 px-3 py-2 text-sm text-[#FFB4B4]">{serverError}</p>}

              <button type="submit" disabled={submitting} className="w-full rounded-md bg-[#D62828] px-4 py-2 font-semibold text-white disabled:opacity-60">
                {submitting ? 'Evaluating...' : 'Continue'}
              </button>
            </form>
          ) : (
            <div className="mt-6">
              <div className="grid grid-cols-6 gap-2">
                {totp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      totpInputsRef.current[index] = element
                    }}
                    value={digit}
                    onChange={(event) => handleTotpChange(index, event.target.value)}
                    onKeyDown={(event) => handleTotpKeyDown(index, event)}
                    inputMode="numeric"
                    maxLength={1}
                    aria-label={`TOTP digit ${index + 1}`}
                    className="h-12 rounded-md border border-[#343434] bg-[#0A0A0A] text-center text-lg font-semibold text-white outline-none focus:border-[#F7B731]"
                  />
                ))}
              </div>

              {serverError && <p className="mt-4 rounded-md border border-[#D62828]/40 bg-[#D62828]/10 px-3 py-2 text-sm text-[#FFB4B4]">{serverError}</p>}

              <button onClick={onVerifyTotp} type="button" disabled={submitting} className="mt-5 w-full rounded-md bg-[#D62828] px-4 py-2 font-semibold text-white disabled:opacity-60">
                {submitting ? 'Verifying...' : 'Verify TOTP'}
              </button>

              <button type="button" onClick={() => setPhase('credentials')} className="mt-3 w-full rounded-md border border-[#343434] px-4 py-2 text-sm font-medium text-[#F7B731]">
                Back to credentials
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
