import React from 'react'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'

import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export type LoginValues = z.infer<typeof loginSchema>


export interface LoginFormProps {
  defaultValues?: Partial<LoginValues>
  onSubmit: (values: LoginValues) => Promise<void>
  submitting?: boolean
}

export default function LoginForm({ defaultValues, onSubmit, submitting = false }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({ defaultValues: defaultValues as LoginValues | undefined })

  const submit: SubmitHandler<LoginValues> = async (values) => {
    try {
      loginSchema.parse(values)
      await onSubmit(values)
    } catch (err) {
      if (err instanceof z.ZodError) {
        err.errors.forEach((e) => {
          const path = e.path[0]
          if (typeof path === 'string') {
            setError(path as keyof LoginValues, { type: 'validation', message: e.message })
          }
        })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-muncherz-yellow">Email</label>
        <input
          {...register('email')}
          type="email"
          autoComplete="email"
          className="mt-1 block w-full rounded-md border bg-muncherz-black px-3 py-2 text-white placeholder:text-gray-400"
        />
        {errors.email && <p className="mt-1 text-xs text-muncherz-red">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-muncherz-yellow">Password</label>
        <input
          {...register('password')}
          type="password"
          autoComplete="current-password"
          className="mt-1 block w-full rounded-md border bg-muncherz-black px-3 py-2 text-white placeholder:text-gray-400"
        />
        {errors.password && <p className="mt-1 text-xs text-muncherz-red">{errors.password.message}</p>}
      </div>

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full justify-center rounded-md bg-muncherz-red px-4 py-2 text-white hover:opacity-95 disabled:opacity-60"
        >
          Sign in
        </button>
      </div>
    </form>
  )
}
