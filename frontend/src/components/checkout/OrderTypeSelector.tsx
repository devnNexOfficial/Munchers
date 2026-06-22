'use client'

import { useEffect, useState } from 'react'

import { Bike, ShoppingBag, Utensils } from 'lucide-react'

import type { CheckoutFormInput } from '@/lib/validators/checkout'

type OrderType = CheckoutFormInput['orderType']

interface OrderTypeSelectorProps {
  onSelect: (orderType: OrderType, tableNumber?: string) => void
  qrTableNumber?: string
}

const options: Array<{ value: OrderType; label: string; icon: typeof Bike }> = [
  { value: 'delivery', label: 'Delivery', icon: Bike },
  { value: 'dine_in', label: 'Dine-in', icon: Utensils },
  { value: 'takeaway', label: 'Takeaway', icon: ShoppingBag },
]

export function OrderTypeSelector({ onSelect, qrTableNumber }: OrderTypeSelectorProps) {
  const [selected, setSelected] = useState<OrderType>(qrTableNumber ? 'dine_in' : 'delivery')
  const [tableNumber, setTableNumber] = useState(qrTableNumber ?? '')
  const isLocked = Boolean(qrTableNumber)

  useEffect(() => {
    if (!qrTableNumber) return
    setSelected('dine_in')
    setTableNumber(qrTableNumber)
    onSelect('dine_in', qrTableNumber)
  }, [onSelect, qrTableNumber])

  function handleSelect(orderType: OrderType) {
    if (isLocked) return
    const nextTableNumber = orderType === 'dine_in' ? tableNumber : undefined
    setSelected(orderType)
    onSelect(orderType, nextTableNumber)
  }

  function handleTableChange(value: string) {
    setTableNumber(value)
    onSelect('dine_in', value.trim() || undefined)
  }

  return (
    <section className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-muncherz-black">Order type</h2>
        {qrTableNumber && (
          <span className="rounded-full bg-muncherz-yellow px-3 py-1 text-xs font-black text-muncherz-black">
            Table {qrTableNumber}
          </span>
        )}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {options.map(({ value, label, icon: Icon }) => {
          const active = selected === value
          return (
            <button
              key={value}
              type="button"
              disabled={isLocked && value !== 'dine_in'}
              onClick={() => handleSelect(value)}
              className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border px-2 text-sm font-black transition ${
                active
                  ? 'border-muncherz-red bg-muncherz-red text-white'
                  : 'border-gray-200 bg-white text-muncherz-black disabled:opacity-40'
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{label}</span>
            </button>
          )
        })}
      </div>
      {selected === 'dine_in' && !qrTableNumber && (
        <label className="mt-4 block">
          <span className="text-xs font-black text-muncherz-black">Table number</span>
          <input
            value={tableNumber}
            onChange={(event) => handleTableChange(event.target.value)}
            placeholder="Enter table number"
            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-3 text-sm font-bold outline-none focus:border-muncherz-red"
          />
        </label>
      )}
    </section>
  )
}
