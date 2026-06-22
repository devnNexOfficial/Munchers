'use client'

import { useMemo } from 'react'

import type { Address } from '@/components/checkout/AddressSelector'
import type { RestaurantSettings } from '@/components/checkout/PaymentMethodSelector'
import type { CheckoutFormInput } from '@/lib/validators/checkout'
import type { CartItem } from '@/store/useCartStore'

type OrderType = CheckoutFormInput['orderType']

interface OrderSummaryProps {
  cartItems: CartItem[]
  settings: RestaurantSettings
  orderType: OrderType
  selectedAddress: Address | null
}

export interface OrderTotals {
  subtotal: number
  deliveryCharge: number
  gstAmount: number
  total: number
  surgeApplied: boolean
}

function money(value: number) {
  return `Rs. ${Math.round(value)}`
}

function minutesFromTime(value: string | null) {
  if (!value) return null
  const [hours, minutes] = value.split(':').map(Number)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null
  return hours * 60 + minutes
}

export function isWithinSurgeWindow(now: Date, start: string | null, end: string | null) {
  const startMinutes = minutesFromTime(start)
  const endMinutes = minutesFromTime(end)
  if (startMinutes === null || endMinutes === null) return false
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes
  }
  return currentMinutes >= startMinutes || currentMinutes <= endMinutes
}

export function calculateOrderTotals(
  cartItems: CartItem[],
  settings: RestaurantSettings,
  orderType: OrderType,
  now = new Date()
): OrderTotals {
  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0)
  const surgeApplied =
    orderType === 'delivery' &&
    settings.surge_enabled &&
    isWithinSurgeWindow(now, settings.surge_start, settings.surge_end)
  const deliveryCharge =
    orderType === 'delivery'
      ? surgeApplied
        ? settings.surge_charge
        : settings.delivery_charge
      : 0
  const gstAmount = settings.gst_enabled ? subtotal * (settings.gst_percentage / 100) : 0
  return { subtotal, deliveryCharge, gstAmount, total: subtotal + deliveryCharge + gstAmount, surgeApplied }
}

export function OrderSummary({ cartItems, settings, orderType, selectedAddress }: OrderSummaryProps) {
  const totals = useMemo(
    () => calculateOrderTotals(cartItems, settings, orderType),
    [cartItems, orderType, settings]
  )

  return (
    <section className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-muncherz-black">Receipt</h2>
          <p className="mt-1 text-sm font-bold text-gray-500">
            Ready in ~{settings.prep_time_minutes} mins
          </p>
        </div>
        {orderType === 'delivery' && selectedAddress && (
          <span className="max-w-36 truncate rounded-full bg-muncherz-white px-3 py-1 text-xs font-black text-muncherz-red">
            {selectedAddress.label}
          </span>
        )}
      </div>
      <div className="mt-4 space-y-3 border-b border-gray-100 pb-4">
        {cartItems.map((item) => (
          <div key={item.cartItemId} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-muncherz-black">{item.name}</p>
              <p className="text-xs font-bold text-gray-500">Qty {item.quantity}</p>
            </div>
            <span className="text-sm font-black text-muncherz-black">
              {money(item.totalPrice * item.quantity)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2 text-sm font-bold text-gray-500">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{money(totals.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>{totals.surgeApplied ? 'Delivery charge (surge)' : 'Delivery charge'}</span>
          <span>{money(totals.deliveryCharge)}</span>
        </div>
        {settings.gst_enabled && (
          <div className="flex justify-between">
            <span>GST ({settings.gst_percentage}%)</span>
            <span>{money(totals.gstAmount)}</span>
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
        <span className="text-base font-black text-muncherz-black">Total</span>
        <span className="text-2xl font-black text-muncherz-red">{money(totals.total)}</span>
      </div>
    </section>
  )
}
