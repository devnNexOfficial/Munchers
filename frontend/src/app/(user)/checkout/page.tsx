'use client'

import React, { useCallback, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { AnimatePresence,motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  FileText,
  MapPin,
  Phone,
  ShoppingBag,
  Store,
  Truck,
  User,
  Wallet,
} from 'lucide-react'

import { useCartStore } from '../../../store/useCartStore'
import type { DeliveryMode } from '../../../types/cart'
import {
  computeLineSubtotal,
  formatPKR,
  formatPKRCompact,
  resolveUnitPrice,
} from '../../../utils/priceCalculator'

// ─── Types ───────────────────────────────────────────────────

type PaymentMethod = 'cod' | 'jazzcash' | 'easypaisa' | 'card'

interface FormErrors {
  fullName?: string
  phone?: string
  email?: string
  deliveryAddress?: string
}

// ─── Animation Variants ──────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

// ─── Form Input Component ────────────────────────────────────

interface FormInputProps {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  type?: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
}

function FormInput({
  id,
  label,
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required,
}: FormInputProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" />
        {label}
        {required && <span className="text-[#D62828]">*</span>}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-11 px-4 rounded-xl bg-[#1A1A1A] border text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 transition-all ${
          error
            ? 'border-[#D62828] focus:ring-[#D62828]/30'
            : 'border-neutral-800 focus:ring-[#D62828]/20 focus:border-[#D62828]/50'
        }`}
      />
      {error && (
        <p className="text-[11px] text-[#D62828] font-medium flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Delivery Mode Toggle ────────────────────────────────────

interface DeliveryModeToggleProps {
  mode: DeliveryMode
  onToggle: (mode: DeliveryMode) => void
}

function DeliveryModeToggle({ mode, onToggle }: DeliveryModeToggleProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onToggle('delivery')}
        className={`flex-1 h-12 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
          mode === 'delivery'
            ? 'bg-[#D62828] border-[#D62828] text-white shadow-[0_4px_16px_rgba(214,40,40,0.3)]'
            : 'bg-[#1A1A1A] border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200'
        }`}
        aria-label="Select delivery"
      >
        <Truck className="w-4 h-4" />
        Delivery
      </button>
      <button
        onClick={() => onToggle('pickup')}
        className={`flex-1 h-12 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
          mode === 'pickup'
            ? 'bg-[#D62828] border-[#D62828] text-white shadow-[0_4px_16px_rgba(214,40,40,0.3)]'
            : 'bg-[#1A1A1A] border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200'
        }`}
        aria-label="Select pickup"
      >
        <Store className="w-4 h-4" />
        Pickup
      </button>
    </div>
  )
}

// ─── Payment Method Selector ─────────────────────────────────

interface PaymentMethodOption {
  id: PaymentMethod
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const paymentMethods: PaymentMethodOption[] = [
  { id: 'cod', label: 'Cash on Delivery', description: 'Pay when you receive', icon: Wallet },
  { id: 'jazzcash', label: 'JazzCash', description: 'Mobile wallet', icon: Phone },
  { id: 'easypaisa', label: 'Easypaisa', description: 'Mobile wallet', icon: Phone },
  { id: 'card', label: 'Card Payment', description: 'Visa / Mastercard', icon: CreditCard },
]

interface PaymentSelectorProps {
  selected: PaymentMethod
  onSelect: (method: PaymentMethod) => void
}

function PaymentSelector({ selected, onSelect }: PaymentSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {paymentMethods.map((method) => {
        const Icon = method.icon
        const isSelected = selected === method.id
        return (
          <button
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={`relative p-3 rounded-xl border flex flex-col items-start gap-1 text-left transition-all ${
              isSelected
                ? 'bg-[#D62828]/10 border-[#D62828]/60 ring-1 ring-[#D62828]/30'
                : 'bg-[#1A1A1A] border-neutral-800 hover:border-neutral-600'
            }`}
            aria-label={`Pay with ${method.label}`}
          >
            {isSelected && (
              <motion.div
                layoutId="payment-check"
                className="absolute top-2 right-2"
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <CheckCircle2 className="w-4 h-4 text-[#D62828]" />
              </motion.div>
            )}
            <Icon className={`w-5 h-5 ${isSelected ? 'text-[#D62828]' : 'text-neutral-500'}`} />
            <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
              {method.label}
            </span>
            <span className="text-[10px] text-neutral-500">{method.description}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Order Summary Line ──────────────────────────────────────

interface OrderSummaryLineProps {
  label: string
  value: string
  isBold?: boolean
  isGreen?: boolean
  isYellow?: boolean
}

function OrderSummaryLine({ label, value, isBold, isGreen, isYellow }: OrderSummaryLineProps) {
  return (
    <div className={`flex justify-between items-center ${isBold ? 'pt-3 mt-2 border-t border-neutral-700' : ''}`}>
      <span className={`${isBold ? 'text-sm font-bold text-white' : 'text-xs text-neutral-400'}`}>
        {label}
      </span>
      <span
        className={`tabular-nums ${
          isBold
            ? 'text-base font-bold text-white'
            : isGreen
              ? 'text-xs font-semibold text-[#22C55E]'
              : isYellow
                ? 'text-xs font-semibold text-[#F7B731]'
                : 'text-xs font-medium text-neutral-300'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

// ─── Main Checkout Page ──────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter()

  // Cart store bindings
  const items = useCartStore((state) => state.items)
  const getSummary = useCartStore((state) => state.getSummary)
  const getEstimatedPrepTime = useCartStore((state) => state.getEstimatedPrepTime)
  const deliveryMode = useCartStore((state) => state.deliveryMode)
  const setDeliveryMode = useCartStore((state) => state.setDeliveryMode)
  const customerInfo = useCartStore((state) => state.customerInfo)
  const updateCustomerInfo = useCartStore((state) => state.updateCustomerInfo)
  const clearCart = useCartStore((state) => state.clearCart)

  // Local state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOrderPlaced, setIsOrderPlaced] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [showItemDetails, setShowItemDetails] = useState(false)

  const summary = getSummary()
  const prepTime = getEstimatedPrepTime()

  // ── Validation ──

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {}

    if (!customerInfo.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^(\+92|0)?3\d{9}$/.test(customerInfo.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter a valid Pakistani phone number'
    }

    if (customerInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      newErrors.email = 'Enter a valid email address'
    }

    if (deliveryMode === 'delivery' && !customerInfo.deliveryAddress.trim()) {
      newErrors.deliveryAddress = 'Delivery address is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [customerInfo, deliveryMode])

  // ── Order Placement ──

  const handlePlaceOrder = useCallback(async () => {
    if (!validateForm()) return
    if (!termsAccepted) return
    if (items.length === 0) return

    setIsSubmitting(true)

    try {
      // Simulate backend order placement
      // In production, this calls the order placement API (Section 13)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setIsOrderPlaced(true)

      // Clear cart after successful placement
      setTimeout(() => {
        clearCart()
        router.push('/track')
      }, 3000)
    } catch {
      console.error('Order placement failed')
    } finally {
      setIsSubmitting(false)
    }
  }, [validateForm, termsAccepted, items, clearCart, router])

  // ── Order Success State ──

  if (isOrderPlaced) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-24 h-24 rounded-full bg-[#22C55E]/15 flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-12 h-12 text-[#22C55E]" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white mb-2"
        >
          Order Placed!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-sm text-neutral-400 max-w-[280px]"
        >
          Your order is being prepared. Redirecting to tracking...
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-center gap-2 text-[#F7B731]"
        >
          <Clock className="w-4 h-4" />
          <span className="text-sm font-semibold">Est. {prepTime + 15} min</span>
        </motion.div>
      </div>
    )
  }

  // ── Empty Cart Redirect ──

  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[#1A1A1A] border border-neutral-800 flex items-center justify-center mb-5">
          <ShoppingBag className="w-9 h-9 text-neutral-600" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">No items to checkout</h3>
        <p className="text-sm text-neutral-500 mb-6">Add items to your cart to proceed.</p>
        <Link
          href="/"
          className="px-6 h-10 bg-[#D62828] rounded-xl flex items-center justify-center text-white text-sm font-semibold hover:bg-[#B71C1C] transition-colors"
        >
          Browse Menu
        </Link>
      </div>
    )
  }

  // ── Main Checkout Layout ──

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="px-4 py-5 space-y-5"
    >
      {/* ── Back Header ── */}
      <motion.div variants={cardVariants} className="flex items-center gap-3">
        <Link
          href="/cart"
          className="w-9 h-9 rounded-xl bg-[#1A1A1A] border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-600 transition-all"
          aria-label="Back to cart"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Checkout</h1>
          <p className="text-[11px] text-neutral-500">
            {summary.totalItems} {summary.totalItems === 1 ? 'item' : 'items'} •{' '}
            {formatPKRCompact(summary.grandTotal)}
          </p>
        </div>
      </motion.div>

      {/* ── Delivery Mode ── */}
      <motion.section variants={cardVariants} className="space-y-3">
        <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5" />
          Order Type
        </h2>
        <DeliveryModeToggle mode={deliveryMode} onToggle={setDeliveryMode} />
      </motion.section>

      {/* ── Customer Information ── */}
      <motion.section
        variants={cardVariants}
        className="space-y-4 p-4 rounded-2xl bg-[#161616] border border-neutral-800/50"
      >
        <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          Your Details
        </h2>

        <FormInput
          id="checkout-fullname"
          label="Full Name"
          icon={User}
          placeholder="Muhammad Ali Khan"
          value={customerInfo.fullName}
          onChange={(v) => updateCustomerInfo({ fullName: v })}
          error={errors.fullName}
          required
        />

        <FormInput
          id="checkout-phone"
          label="Phone Number"
          icon={Phone}
          type="tel"
          placeholder="03XX XXXXXXX"
          value={customerInfo.phone}
          onChange={(v) => updateCustomerInfo({ phone: v })}
          error={errors.phone}
          required
        />

        <FormInput
          id="checkout-email"
          label="Email (Optional)"
          icon={FileText}
          type="email"
          placeholder="your@email.com"
          value={customerInfo.email}
          onChange={(v) => updateCustomerInfo({ email: v })}
          error={errors.email}
        />

        <AnimatePresence>
          {deliveryMode === 'delivery' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <FormInput
                id="checkout-address"
                label="Delivery Address"
                icon={MapPin}
                placeholder="House 12, Street 5, Block B, Gulberg III"
                value={customerInfo.deliveryAddress}
                onChange={(v) => updateCustomerInfo({ deliveryAddress: v })}
                error={errors.deliveryAddress}
                required
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special Instructions */}
        <div className="space-y-1.5">
          <label
            htmlFor="checkout-notes"
            className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            Special Instructions
          </label>
          <textarea
            id="checkout-notes"
            rows={2}
            placeholder="Any specific requests for your order..."
            value={customerInfo.notes}
            onChange={(e) => updateCustomerInfo({ notes: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-[#1A1A1A] border border-neutral-800 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-[#D62828]/20 focus:border-[#D62828]/50 transition-all resize-none"
          />
        </div>
      </motion.section>

      {/* ── Payment Method ── */}
      <motion.section
        variants={cardVariants}
        className="space-y-3 p-4 rounded-2xl bg-[#161616] border border-neutral-800/50"
      >
        <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5" />
          Payment Method
        </h2>
        <PaymentSelector selected={paymentMethod} onSelect={setPaymentMethod} />
      </motion.section>

      {/* ── Order Summary ── */}
      <motion.section
        variants={cardVariants}
        className="p-4 rounded-2xl bg-[#161616] border border-neutral-800/50 space-y-3"
      >
        <button
          onClick={() => setShowItemDetails(!showItemDetails)}
          className="w-full flex items-center justify-between"
          aria-expanded={showItemDetails}
          aria-label="Toggle order items detail"
        >
          <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5" />
            Order Summary
          </h2>
          <ChevronDown
            className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${
              showItemDetails ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Expandable Items List */}
        <AnimatePresence>
          {showItemDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden space-y-2"
            >
              {items.map((item) => {
                const unitPrice = resolveUnitPrice(item)
                const lineTotal = computeLineSubtotal(item)
                return (
                  <div
                    key={item.cartLineId}
                    className="flex items-center justify-between py-2 border-b border-neutral-800/50 last:border-b-0"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-[#222222] flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {item.product.image_url ? (
                          <Image
                            src={item.product.image_url}
                            alt={item.product.name}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingBag className="w-3.5 h-3.5 text-neutral-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-white truncate">{item.product.name}</p>
                        <p className="text-[10px] text-neutral-500">
                          {item.quantity}x @ {formatPKRCompact(unitPrice)}
                          {item.selectedVariant && (
                            <span className="text-[#F7B731]"> • {item.selectedVariant.name}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-neutral-200 tabular-nums ml-2">
                      {formatPKR(lineTotal)}
                    </span>
                  </div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Financial Breakdown */}
        <div className="space-y-1.5 pt-2">
          <OrderSummaryLine label="Subtotal" value={formatPKR(summary.subtotal)} />
          {summary.discountAmount > 0 && (
            <OrderSummaryLine
              label="Discount"
              value={`-${formatPKR(summary.discountAmount)}`}
              isGreen
            />
          )}
          <OrderSummaryLine
            label="Delivery Fee"
            value={summary.deliveryFee === 0 ? 'FREE' : formatPKR(summary.deliveryFee)}
            isYellow={summary.deliveryFee === 0}
          />
          <OrderSummaryLine label="GST (16%)" value={formatPKR(summary.taxAmount)} />
          <OrderSummaryLine label="Grand Total" value={formatPKR(summary.grandTotal)} isBold />
        </div>

        {/* Estimated Time */}
        <div className="flex items-center gap-2 mt-2 px-3 py-2.5 rounded-xl bg-[#1A1A1A] border border-neutral-800/50">
          <Clock className="w-4 h-4 text-[#F7B731]" />
          <span className="text-xs text-neutral-400">
            Estimated {deliveryMode === 'delivery' ? 'delivery' : 'ready'} in{' '}
            <span className="text-[#F7B731] font-bold">
              {deliveryMode === 'delivery' ? prepTime + 15 : prepTime} min
            </span>
          </span>
        </div>
      </motion.section>

      {/* ── Terms & Conditions ── */}
      <motion.div variants={cardVariants} className="flex items-start gap-3 px-1">
        <button
          onClick={() => setTermsAccepted(!termsAccepted)}
          className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${
            termsAccepted
              ? 'bg-[#D62828] border-[#D62828]'
              : 'border-neutral-600 hover:border-neutral-400'
          }`}
          aria-label="Accept terms and conditions"
          role="checkbox"
          aria-checked={termsAccepted}
        >
          {termsAccepted && (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </motion.svg>
          )}
        </button>
        <p className="text-[11px] text-neutral-500 leading-relaxed">
          I agree to the{' '}
          <span className="text-[#D62828] font-medium cursor-pointer hover:underline">
            Terms of Service
          </span>{' '}
          and{' '}
          <span className="text-[#D62828] font-medium cursor-pointer hover:underline">
            Privacy Policy
          </span>
          . Prices include applicable taxes. Payment is final upon order confirmation.
        </p>
      </motion.div>

      {/* ── Place Order CTA ── */}
      <motion.div variants={cardVariants} className="pb-4">
        <button
          onClick={handlePlaceOrder}
          disabled={isSubmitting || !termsAccepted || items.length === 0}
          className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm tracking-wide transition-all ${
            isSubmitting || !termsAccepted || items.length === 0
              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              : 'bg-[#D62828] text-white hover:bg-[#B71C1C] active:scale-[0.98] shadow-[0_6px_28px_rgba(214,40,40,0.35)] hover:shadow-[0_8px_36px_rgba(214,40,40,0.5)]'
          }`}
          aria-label="Place your order"
        >
          {isSubmitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
              <span>Processing Order...</span>
            </>
          ) : (
            <>
              <span>Place Order — {formatPKR(summary.grandTotal)}</span>
            </>
          )}
        </button>

        {!termsAccepted && items.length > 0 && (
          <p className="text-center text-[10px] text-neutral-600 mt-2">
            Please accept the terms to continue
          </p>
        )}
      </motion.div>
    </motion.div>
  )
}
