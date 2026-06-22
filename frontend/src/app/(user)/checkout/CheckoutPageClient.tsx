'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { CheckCircle2, ShieldCheck } from 'lucide-react'

import { AddressSelector, type Address } from '@/components/checkout/AddressSelector'
import { calculateOrderTotals, OrderSummary } from '@/components/checkout/OrderSummary'
import { OrderTypeSelector } from '@/components/checkout/OrderTypeSelector'
import {
  PaymentMethodSelector,
  type RestaurantSettings,
} from '@/components/checkout/PaymentMethodSelector'
import {
  checkoutFormSchema,
  type AddressInput,
  type CheckoutFormInput,
} from '@/lib/validators/checkout'
import { useCartStore } from '@/store/useCartStore'

type OrderType = CheckoutFormInput['orderType']
type PaymentMethod = CheckoutFormInput['paymentMethod']

interface CheckoutPageClientProps {
  initialPhone: string
  initialSettings: RestaurantSettings
  savedAddresses: Address[]
  qrTableNumber?: string
}

export function CheckoutPageClient({
  initialPhone,
  initialSettings,
  savedAddresses: initialAddresses,
  qrTableNumber,
}: CheckoutPageClientProps) {
  const router = useRouter()
  const cartItems = useCartStore((state) => state.cartItems)
  const subtotal = useCartStore((state) => state.getSubtotal())
  const clearCart = useCartStore((state) => state.clearCart)
  const [phone, setPhone] = useState(initialPhone)
  const [orderType, setOrderType] = useState<OrderType>(qrTableNumber ? 'dine_in' : 'delivery')
  const [tableNumber, setTableNumber] = useState(qrTableNumber)
  const [addresses, setAddresses] = useState(initialAddresses)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [addressBlocked, setAddressBlocked] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [phoneVerified, setPhoneVerified] = useState(true)
  const belowMinimum = subtotal < initialSettings.min_order_amount
  const totals = useMemo(
    () => calculateOrderTotals(cartItems, initialSettings, orderType),
    [cartItems, initialSettings, orderType]
  )

  const formValid = useMemo(() => {
    const result = checkoutFormSchema.safeParse({
      phone,
      addressId: orderType === 'delivery' ? selectedAddress?.id : undefined,
      orderType,
      tableNumber,
      paymentMethod,
      termsAccepted,
    })
    return result.success
  }, [orderType, paymentMethod, phone, selectedAddress?.id, tableNumber, termsAccepted])

  const canPlaceOrder =
    cartItems.length > 0 &&
    formValid &&
    !belowMinimum &&
    !addressBlocked &&
    phoneVerified &&
    (orderType !== 'delivery' || Boolean(selectedAddress))

  const handleAddAddress = useCallback((address: AddressInput) => {
    const nextAddress: Address = {
      id: crypto.randomUUID(),
      ...address,
      landmark: address.landmark,
      is_default: addresses.length === 0,
    }
    setAddresses((current) => [nextAddress, ...current])
    setSelectedAddress(nextAddress)
  }, [addresses.length])

  const handleAddressSelect = useCallback((address: Address, status: { isBlocked: boolean }) => {
    setSelectedAddress(address)
    setAddressBlocked(status.isBlocked)
  }, [])

  function handlePlaceOrder() {
    const payload = {
      phone,
      orderType,
      tableNumber,
      address: orderType === 'delivery' ? selectedAddress : null,
      paymentMethod,
      termsAccepted,
      totals,
      items: cartItems,
    }
    console.log('POST /api/orders/place', payload)
    // TODO: actual API call - backend Section 13
    setToast('Order Placed!')
    clearCart()
    window.setTimeout(() => router.push('/track'), 700)
  }

  return (
    <main className="min-h-screen bg-muncherz-white p-4 sm:p-6">
      <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-black text-muncherz-black">Checkout</h1>
            <p className="mt-1 text-sm font-bold text-gray-500">Confirm the essentials before the kitchen starts.</p>
          </div>
          <section className="rounded-xl bg-white p-4 shadow-sm">
            <label className="block">
              <span className="text-xs font-black text-muncherz-black">Phone number</span>
              <input
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value)
                  setPhoneVerified(event.target.value === initialPhone)
                  setError('Phone changed. OTP re-verify will run once backend Section 13 is connected.')
                }}
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
                    onClick={() => {
                      console.log('TODO: re-verify phone via OTP', phone)
                      setPhoneVerified(true)
                      setToast('Phone re-verified for checkout.')
                    }}
                    className="shrink-0 rounded-lg border border-muncherz-red px-3 py-2 text-xs font-black text-muncherz-red"
                  >
                    Re-verify
                  </button>
                )}
              </div>
            )}
          </section>
          <OrderTypeSelector
            qrTableNumber={qrTableNumber}
            onSelect={(nextOrderType, nextTableNumber) => {
              setOrderType(nextOrderType)
              setTableNumber(nextTableNumber)
            }}
          />
          {orderType === 'delivery' && (
            <AddressSelector
              savedAddresses={addresses}
              onAddNew={handleAddAddress}
              onSelect={handleAddressSelect}
            />
          )}
          <PaymentMethodSelector settings={initialSettings} onSelect={setPaymentMethod} />
          <label className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(event) => setTermsAccepted(event.target.checked)}
              className="mt-1 accent-muncherz-red"
            />
            <span className="text-sm font-bold leading-6 text-gray-600">
              I accept the Terms & Privacy Policy.
            </span>
          </label>
        </div>
        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <OrderSummary
            cartItems={cartItems}
            settings={initialSettings}
            orderType={orderType}
            selectedAddress={selectedAddress}
          />
          {belowMinimum && (
            <p className="rounded-xl bg-white p-3 text-sm font-bold text-error shadow-sm">
              Add Rs. {Math.round(initialSettings.min_order_amount - subtotal)} more to place order.
            </p>
          )}
          <button
            type="button"
            disabled={!canPlaceOrder}
            onClick={handlePlaceOrder}
            className="w-full rounded-xl bg-muncherz-red px-4 py-4 text-sm font-black text-white shadow-sm transition active:scale-95 disabled:bg-gray-300"
          >
            Place Order
          </button>
          {toast && (
            <p className="flex items-center gap-2 rounded-xl bg-white p-3 text-sm font-black text-success shadow-sm">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {toast}
            </p>
          )}
        </div>
      </div>
    </main>
  )
}