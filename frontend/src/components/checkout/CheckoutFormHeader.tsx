'use client'

import { ShieldCheck } from 'lucide-react'

interface CheckoutFormHeaderProps {
  phone: string
  initialPhone: string
  error: string | null
  phoneVerified: boolean
  onPhoneChange: (phone: string) => void
  onReverify: () => void
}

export function CheckoutFormHeader({
  phone,
  initialPhone,
  error,
  phoneVerified,
  onPhoneChange,
  onReverify,
}: CheckoutFormHeaderProps) {
  return (
    <section className="rounded-xl bg-white p-4 shadow-sm">
      <label className="block">
        <span className="text-xs font-black text-muncherz-black">Phone number</span>
        <input
          value={phone}
          onChange={(event) => onPhoneChange(event.target.value)}
          placeholder="03XXXXXXXXX"
          className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-3 text-sm font-bold outline-none focus:border-muncherz-red"
        />
      </label>
      {error && (
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex gap-2 text-sm font-bold text-warning">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
          {!phoneVerified && (
            <button
              type="button"
              onClick={onReverify}
              className="shrink-0 rounded-lg border border-muncherz-red px-3 py-2 text-xs font-black text-muncherz-red"
            >
              Re-verify
            </button>
          )}
        </div>
      )}
    </section>
  )
}
