import React from 'react'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'

import { z } from 'zod'

const mfaSchema = z.object({
  code: z.string().min(6).max(6),
})

export type MFAValues = z.infer<typeof mfaSchema>

export interface MFAFormProps {
  onVerify: (values: MFAValues) => Promise<void>
  submitting?: boolean
}

export default function MFAForm({ onVerify, submitting = false }: MFAFormProps) {
  const { register, handleSubmit, setError, formState: { errors } } = useForm<MFAValues>()

  const submit: SubmitHandler<MFAValues> = async (values) => {
    try {
      mfaSchema.parse(values)
      await onVerify(values)
    } catch (err) {
      if (err instanceof z.ZodError) {
        err.errors.forEach((e) => {
          const path = e.path[0]
          if (typeof path === 'string') {
            setError(path as keyof MFAValues, { type: 'validation', message: e.message })
          }
        })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-muncherz-yellow">Authenticator Code</label>
        <input
          {...register('code')}
          type="text"
          inputMode="numeric"
          maxLength={6}
          className="mt-1 block w-full rounded-md border bg-muncherz-black px-3 py-2 text-white text-center letter-spacing-wide"
        />
        {errors.code && <p className="mt-1 text-xs text-muncherz-red">{errors.code.message}</p>}
      </div>

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full justify-center rounded-md bg-muncherz-red px-4 py-2 text-white hover:opacity-95 disabled:opacity-60"
        >
          Verify
        </button>
      </div>
    </form>
  )
}
