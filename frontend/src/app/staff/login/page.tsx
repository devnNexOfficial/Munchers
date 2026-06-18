// File: src/app/staff/login/page.tsx
'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

import { z } from 'zod'

import useAuthStore from '../../../store/useAuthStore'
import type { UserRole } from '../../../types/auth'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const staffLoginSchema = z.object({
  email: z.string().email('Enter a valid staff email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type StaffLoginValues = z.infer<typeof staffLoginSchema>

function getSupabaseBrowserClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  return createClient(url, key)
}

export default function StaffLoginPage(): JSX.Element {
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const authStore = useAuthStore()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<StaffLoginValues>()

  async function onSubmit(values: StaffLoginValues): Promise<void> {
    setSubmitting(true)
    setServerError(null)

    try {
      const parsed = staffLoginSchema.safeParse(values)
      if (!parsed.success) {
        parsed.error.errors.forEach((issue) => {
          const path = issue.path[0]
          if (typeof path === 'string') {
            setError(path as keyof StaffLoginValues, { type: 'validation', message: issue.message })
          }
        })
        return
      }

      const supabase = getSupabaseBrowserClient()
      const response = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      })

      if (response.error) {
        setServerError(response.error.message ?? 'Authentication failed')
        return
      }

      const session = response.data.session
      const user = response.data.user

      if (session && user) {
        authStore.initializeFromServer({
          user: {
            id: user.id,
            email: user.email ?? parsed.data.email,
            role: ((user.user_metadata?.role as UserRole | undefined) ?? 'restaurant_owner') as UserRole,
            has_mfa: false,
            updated_at: new Date().toISOString(),
          },
          token: session.access_token,
        })
        return
      }

      setServerError('Authentication failed')
    } catch (error) {
      setServerError((error as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-4 py-8 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center">
        <div className="w-full rounded-lg border border-[#262626] bg-[#141414] p-6 shadow-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#F7B731]">Operational Gateway</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Staff sign in</h1>
          <p className="mt-2 text-sm text-[#D6D6D6]">Access restaurant orders, kitchen queues, inventory, and service tools.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label htmlFor="staff-email" className="block text-sm font-medium text-[#F7B731]">
                Email
              </label>
              <input
                id="staff-email"
                {...register('email')}
                type="email"
                autoComplete="email"
                className="mt-2 block w-full rounded-md border border-[#343434] bg-[#0A0A0A] px-3 py-2 text-white outline-none placeholder:text-[#777777] focus:border-[#F7B731]"
              />
              {errors.email && <p className="mt-2 text-xs text-[#FF6B6B]">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="staff-password" className="block text-sm font-medium text-[#F7B731]">
                Password
              </label>
              <input
                id="staff-password"
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="mt-2 block w-full rounded-md border border-[#343434] bg-[#0A0A0A] px-3 py-2 text-white outline-none placeholder:text-[#777777] focus:border-[#F7B731]"
              />
              {errors.password && <p className="mt-2 text-xs text-[#FF6B6B]">{errors.password.message}</p>}
            </div>

            {serverError && <p className="rounded-md border border-[#D62828]/40 bg-[#D62828]/10 px-3 py-2 text-sm text-[#FFB4B4]">{serverError}</p>}

            <button type="submit" disabled={submitting} className="w-full rounded-md bg-[#D62828] px-4 py-2 font-semibold text-white disabled:opacity-60">
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
