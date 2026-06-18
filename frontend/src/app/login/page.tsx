// File: src/app/login/page.tsx
'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { AnimatePresence, motion } from 'framer-motion'
import { z } from 'zod'

import useAuthStore from '../../store/useAuthStore'
import type { UserRole } from '../../types/auth'

const phoneSchema = z.object({
  phone: z.string().regex(/^\+92[0-9]{10}$/, 'Phone must be in +92XXXXXXXXXX format'),
})

type PhoneValues = z.infer<typeof phoneSchema>

type VerifyResponse = {
  session?: {
    access_token: string
    user: {
      id: string
      phone?: string
      user_metadata?: {
        role?: string
      }
    }
  }
  error?: string
}

export default function CustomerLoginPage(): JSX.Element {
  const [stage, setStage] = useState<'phone' | 'otp'>('phone')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [phoneForOtp, setPhoneForOtp] = useState<string>('')
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const otpInputsRef = useRef<Array<HTMLInputElement | null>>([])
  const authStore = useAuthStore()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PhoneValues>()

  useEffect(() => {
    if (stage === 'otp') {
      otpInputsRef.current[0]?.focus()
    }
  }, [stage])

  async function onSendOtp(values: PhoneValues): Promise<void> {
    setSubmitting(true)
    setServerError(null)

    try {
      const parsed = phoneSchema.safeParse(values)
      if (!parsed.success) {
        parsed.error.errors.forEach((issue) => {
          const path = issue.path[0]
          if (typeof path === 'string') {
            setError(path as keyof PhoneValues, { type: 'validation', message: issue.message })
          }
        })
        return
      }

      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: parsed.data.phone }),
      })
      const payload = (await response.json()) as { success?: boolean; message?: string }

      if (response.ok && payload.success) {
        setPhoneForOtp(parsed.data.phone)
        setOtp(['', '', '', '', '', ''])
        setStage('otp')
        return
      }

      setServerError(payload.message ?? 'Failed to send OTP')
    } catch (error) {
      setServerError((error as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  async function onVerifyOtp(): Promise<void> {
    setSubmitting(true)
    setServerError(null)

    try {
      const code = otp.join('')
      if (!/^[0-9]{6}$/.test(code)) {
        setServerError('Enter the complete 6-digit OTP')
        return
      }

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneForOtp, otp: code }),
      })
      const body = (await response.json()) as VerifyResponse

      if (response.ok && body.session) {
        const user = body.session.user
        const role = ((user.user_metadata?.role as UserRole | undefined) ?? 'customer') as UserRole

        authStore.initializeFromServer({
          user: {
            id: user.id,
            email: '',
            role,
            has_mfa: false,
            updated_at: new Date().toISOString(),
          },
          token: body.session.access_token,
        })
        return
      }

      setServerError(body.error ?? 'Verification failed')
    } catch (error) {
      setServerError((error as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleOtpChange(index: number, value: string): void {
    if (!/^[0-9]?$/.test(value)) return

    const next = [...otp]
    next[index] = value
    setOtp(next)

    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus()
    }
  }

  function handleOtpKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus()
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-4 py-8 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {stage === 'phone' ? (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full rounded-lg border border-[#262626] bg-[#141414] p-6 shadow-2xl"
            >
              <p className="text-sm font-semibold uppercase tracking-wider text-[#F7B731]">Customer Access</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">Sign in with phone</h1>
              <p className="mt-2 text-sm text-[#D6D6D6]">Use a Pakistan mobile number to receive your OTP.</p>

              <form onSubmit={handleSubmit(onSendOtp)} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[#F7B731]">
                    Phone number
                  </label>
                  <input
                    id="phone"
                    {...register('phone')}
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+92XXXXXXXXXX"
                    className="mt-2 block w-full rounded-md border border-[#343434] bg-[#0A0A0A] px-3 py-2 text-white outline-none placeholder:text-[#777777] focus:border-[#F7B731]"
                  />
                  {errors.phone && <p className="mt-2 text-xs text-[#FF6B6B]">{errors.phone.message}</p>}
                </div>

                {serverError && <p className="rounded-md border border-[#D62828]/40 bg-[#D62828]/10 px-3 py-2 text-sm text-[#FFB4B4]">{serverError}</p>}

                <button type="submit" disabled={submitting} className="w-full rounded-md bg-[#D62828] px-4 py-2 font-semibold text-white disabled:opacity-60">
                  {submitting ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full rounded-lg border border-[#262626] bg-[#141414] p-6 shadow-2xl"
            >
              <p className="text-sm font-semibold uppercase tracking-wider text-[#F7B731]">OTP Verification</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">Enter your code</h1>
              <p className="mt-2 text-sm text-[#D6D6D6]">We sent a 6-digit code to {phoneForOtp}.</p>

              <div className="mt-6">
                <div className="grid grid-cols-6 gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        otpInputsRef.current[index] = element
                      }}
                      value={digit}
                      onChange={(event) => handleOtpChange(index, event.target.value)}
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      inputMode="numeric"
                      maxLength={1}
                      aria-label={`OTP digit ${index + 1}`}
                      className="h-12 rounded-md border border-[#343434] bg-[#0A0A0A] text-center text-lg font-semibold text-white outline-none focus:border-[#F7B731]"
                    />
                  ))}
                </div>

                {serverError && <p className="mt-4 rounded-md border border-[#D62828]/40 bg-[#D62828]/10 px-3 py-2 text-sm text-[#FFB4B4]">{serverError}</p>}

                <button onClick={onVerifyOtp} type="button" disabled={submitting} className="mt-5 w-full rounded-md bg-[#D62828] px-4 py-2 font-semibold text-white disabled:opacity-60">
                  {submitting ? 'Verifying...' : 'Verify OTP'}
                </button>

                <button type="button" onClick={() => setStage('phone')} className="mt-3 w-full rounded-md border border-[#343434] px-4 py-2 text-sm font-medium text-[#F7B731]">
                  Change phone number
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  )
}
