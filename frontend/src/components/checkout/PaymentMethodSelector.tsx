'use client'

import { useEffect, useMemo, useState } from 'react'

import { Banknote, CreditCard, Smartphone } from 'lucide-react'

import type { CheckoutFormInput } from '@/lib/validators/checkout'

export interface RestaurantSettings {
  delivery_charge: number
  surge_enabled: boolean
  surge_charge: number
  surge_start: string | null
  surge_end: string | null
  gst_enabled: boolean
  gst_percentage: number
  min_order_amount: number
  cod_enabled: boolean
  jazzcash_enabled: boolean
  easypaisa_enabled: boolean
  card_enabled: boolean
  prep_time_minutes: number
}

type PaymentMethod = CheckoutFormInput['paymentMethod']

interface PaymentMethodSelectorProps {
  settings: RestaurantSettings
  onSelect: (paymentMethod: PaymentMethod) => void
}

const methods: Array<{
  value: PaymentMethod
  label: string
  settingKey: keyof Pick<
    RestaurantSettings,
    'cod_enabled' | 'jazzcash_enabled' | 'easypaisa_enabled' | 'card_enabled'
  >
  icon: typeof Banknote
}> = [
  { value: 'cod', label: 'COD', settingKey: 'cod_enabled', icon: Banknote },
  { value: 'jazzcash', label: 'JazzCash', settingKey: 'jazzcash_enabled', icon: Smartphone },
  { value: 'easypaisa', label: 'Easypaisa', settingKey: 'easypaisa_enabled', icon: Smartphone },
  { value: 'card', label: 'Card', settingKey: 'card_enabled', icon: CreditCard },
]

export function PaymentMethodSelector({ settings, onSelect }: PaymentMethodSelectorProps) {
  const enabledMethods = useMemo(
    () => methods.filter((method) => settings[method.settingKey]),
    [settings]
  )
  const [selected, setSelected] = useState<PaymentMethod | null>(null)

  useEffect(() => {
    if (enabledMethods.length !== 1) return
    setSelected(enabledMethods[0].value)
    onSelect(enabledMethods[0].value)
  }, [enabledMethods, onSelect])

  function handleSelect(paymentMethod: PaymentMethod) {
    setSelected(paymentMethod)
    onSelect(paymentMethod)
  }

  return (
    <section className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="text-lg font-black text-muncherz-black">Payment method</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {enabledMethods.map(({ value, label, icon: Icon }) => {
          const active = selected === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => handleSelect(value)}
              className={`flex min-h-20 items-center gap-3 rounded-xl border p-3 text-left transition ${
                active ? 'border-muncherz-red bg-red-50' : 'border-gray-200 bg-white'
              }`}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muncherz-white text-muncherz-red">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-sm font-black text-muncherz-black">{label}</span>
            </button>
          )
        })}
      </div>
      {enabledMethods.length === 0 && (
        <p className="mt-3 text-sm font-bold text-error">No payment methods are currently enabled.</p>
      )}
    </section>
  )
}
