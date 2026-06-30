'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { CheckCircle2 } from 'lucide-react'
import { CheckoutFormHeader } from '@/components/checkout/CheckoutFormHeader'

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
    // TODO: actual API call - backend Section 13
    setToast('Order Placed!')
    clearCart()
    const timer = window.setTimeout(() => router.push('/track'), 700)
    return () => window.clearTimeout(timer)
  }

  return (
    <main className="relative min-h-screen bg-wild-black p-4 sm:p-6">
      {/* Noise texture overlay */}
      <div className="noise-overlay absolute inset-0" />

      <div className="relative z-10 mx-auto grid max-w-5xl gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-3xl font-black text-wild-paper">Checkout</h1>
            <p className="font-body mt-1 text-sm font-bold text-wild-paper/60">Confirm the essentials before the kitchen starts.</p>
          </div>
          <CheckoutFormHeader
            phone={phone}
            initialPhone={initialPhone}
            error={error}
            phoneVerified={phoneVerified}
            onPhoneChange={(val) => {
              setPhone(val)
              setPhoneVerified(val === initialPhone)
              setError('Phone changed. OTP re-verify will run once backend Section 13 is connected.')
            }}
            onReverify={() => {
              setPhoneVerified(true)
              setToast('Phone re-verified for checkout.')
            }}
          />
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
          <label className="relative flex items-start gap-3 rounded-wild-card bg-wild-brown border border-wild-rust p-4 shadow-wild-ember overflow-hidden">
            {/* Noise texture overlay */}
            <div className="noise-overlay absolute inset-0" />

            <div className="relative z-10 flex items-start gap-3">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
                className="mt-1 accent-wild-red"
              />
              <span className="font-body text-sm font-bold leading-6 text-wild-paper/80">
                I accept the Terms & Privacy Policy.
              </span>
            </div>
          </label>
        </div>
        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div className="relative rounded-wild-card bg-wild-brown border border-wild-rust p-4 shadow-wild-ember overflow-hidden">
            {/* Noise texture overlay */}
            <div className="noise-overlay absolute inset-0" />

            <div className="relative z-10">
              <OrderSummary
                cartItems={cartItems}
                settings={initialSettings}
                orderType={orderType}
                selectedAddress={selectedAddress}
              />
            </div>
          </div>
          {belowMinimum && (
            <div className="relative rounded-wild-button bg-red-900/20 border border-red-700/50 p-3 overflow-hidden">
              <div className="noise-overlay absolute inset-0" />
              <p className="relative z-10 text-sm font-bold text-red-300">
                Add Rs. {Math.round(initialSettings.min_order_amount - subtotal)} more to place order.
              </p>
            </div>
          )}
          <button
            type="button"
            disabled={!canPlaceOrder}
            onClick={handlePlaceOrder}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Place Order
          </button>
          {toast && (
            <div className="relative flex items-center gap-2 rounded-wild-card bg-green-900/20 border border-green-700/50 p-3 overflow-hidden">
              <div className="noise-overlay absolute inset-0" />
              <p className="relative z-10 flex items-center gap-2 text-sm font-black text-green-300">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                {toast}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}