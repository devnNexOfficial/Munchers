'use client'

import React, { useCallback, useEffect,useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { AnimatePresence,motion } from 'framer-motion'
import { ChevronRight, Clock,Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'

import { useCartStore } from '../../store/useCartStore'
import type { CartItem } from '../../types/cart'
import {
  computeLineSubtotal,
  formatPKR,
  formatPKRCompact,
  resolveUnitPrice,
} from '../../utils/priceCalculator'

// ─── Animation Variants ──────────────────────────────────────

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const panelVariants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: {
    x: '100%',
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 },
}

// ─── Cart Line Item Component ────────────────────────────────

interface CartLineItemProps {
  item: CartItem
  onIncrement: (cartLineId: string) => void
  onDecrement: (cartLineId: string) => void
  onRemove: (cartLineId: string) => void
}

function CartLineItem({ item, onIncrement, onDecrement, onRemove }: CartLineItemProps) {
  const unitPrice = resolveUnitPrice(item)
  const lineTotal = computeLineSubtotal(item)

  return (
    <motion.div
      layout
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.25 }}
      className="flex gap-3 p-3 bg-[#1A1A1A] rounded-xl border border-neutral-800/50 group hover:border-neutral-700 transition-colors"
    >
      <div className="w-16 h-16 rounded-lg bg-[#222222] flex-shrink-0 overflow-hidden flex items-center justify-center">
        {item.product.image_url ? (
          <Image
            src={item.product.image_url}
            alt={item.product.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          <ShoppingBag className="w-6 h-6 text-neutral-600" />
        )}
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-white truncate leading-tight">
              {item.product.name}
            </h4>
            {item.selectedVariant && (
              <span className="text-[11px] text-[#F7B731] font-medium tracking-wide">
                {item.selectedVariant.name}
              </span>
            )}
          </div>
          <button
            onClick={() => onRemove(item.cartLineId)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-red-900/30 text-neutral-500 hover:text-[#D62828]"
            aria-label={`Remove ${item.product.name} from cart`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Special Instructions */}
        {item.specialInstructions && (
          <p className="text-[10px] text-neutral-500 mt-0.5 truncate italic">
            &ldquo;{item.specialInstructions}&rdquo;
          </p>
        )}

        {/* Price + Quantity Row */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-neutral-400">
            {formatPKRCompact(unitPrice)} each
          </span>
          <div className="flex items-center gap-0">
            {/* Decrement */}
            <button
              onClick={() => onDecrement(item.cartLineId)}
              className="w-7 h-7 rounded-l-lg bg-[#252525] border border-neutral-700 flex items-center justify-center text-neutral-300 hover:bg-[#D62828] hover:text-white hover:border-[#D62828] transition-all active:scale-95"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <div className="w-9 h-7 bg-[#1E1E1E] border-y border-neutral-700 flex items-center justify-center">
              <span className="text-xs font-bold text-white tabular-nums">
                {item.quantity}
              </span>
            </div>
            {/* Increment */}
            <button
              onClick={() => onIncrement(item.cartLineId)}
              className="w-7 h-7 rounded-r-lg bg-[#252525] border border-neutral-700 flex items-center justify-center text-neutral-300 hover:bg-[#D62828] hover:text-white hover:border-[#D62828] transition-all active:scale-95"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Line Total */}
        <div className="flex justify-end mt-1">
          <span className="text-sm font-bold text-white tabular-nums">
            {formatPKR(lineTotal)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Summary Row Component ───────────────────────────────────

interface SummaryRowProps {
  label: string
  value: string
  isBold?: boolean
  isDiscount?: boolean
  isHighlight?: boolean
}

function SummaryRow({ label, value, isBold, isDiscount, isHighlight }: SummaryRowProps) {
  return (
    <div className={`flex items-center justify-between ${isBold ? 'pt-3 mt-3 border-t border-neutral-700' : ''}`}>
      <span
        className={`text-sm ${
          isBold ? 'font-bold text-white' : isDiscount ? 'text-[#22C55E]' : 'text-neutral-400'
        }`}
      >
        {label}
      </span>
      <span
        className={`text-sm tabular-nums ${
          isBold
            ? 'font-bold text-lg text-white'
            : isHighlight
              ? 'text-[#F7B731] font-semibold'
              : isDiscount
                ? 'text-[#22C55E] font-medium'
                : 'text-neutral-300 font-medium'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

// ─── Empty Cart State ────────────────────────────────────────

function EmptyCartState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-[#1A1A1A] border border-neutral-800 flex items-center justify-center mb-5">
        <ShoppingBag className="w-9 h-9 text-neutral-600" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">Your cart is empty</h3>
      <p className="text-sm text-neutral-500 leading-relaxed max-w-[240px]">
        Browse the menu and add your favourite items to get started.
      </p>
    </div>
  )
}

// ─── Main CartSlideOver Component ────────────────────────────

interface CartSlideOverProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSlideOver({ isOpen, onClose }: CartSlideOverProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  const items = useCartStore((state) => state.items)
  const getSummary = useCartStore((state) => state.getSummary)
  const getEstimatedPrepTime = useCartStore((state) => state.getEstimatedPrepTime)
  const incrementQuantity = useCartStore((state) => state.incrementQuantity)
  const decrementQuantity = useCartStore((state) => state.decrementQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const clearCart = useCartStore((state) => state.clearCart)

  const summary = getSummary()
  const prepTime = getEstimatedPrepTime()

  // Lock body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleIncrement = useCallback(
    (cartLineId: string) => incrementQuantity(cartLineId),
    [incrementQuantity],
  )

  const handleDecrement = useCallback(
    (cartLineId: string) => decrementQuantity(cartLineId),
    [decrementQuantity],
  )

  const handleRemove = useCallback(
    (cartLineId: string) => removeItem(cartLineId),
    [removeItem],
  )

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            key="cart-backdrop"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Slide-Over Panel */}
          <motion.div
            key="cart-panel"
            ref={panelRef}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-y-0 right-0 max-w-md w-full bg-[#121212] border-l border-neutral-800 z-[70] flex flex-col shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping Cart"
          >
            {/* ── Panel Header ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#D62828]/15 flex items-center justify-center">
                  <ShoppingBag className="w-4.5 h-4.5 text-[#D62828]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">Your Cart</h2>
                  <span className="text-[11px] text-neutral-500 font-medium">
                    {summary.totalItems} {summary.totalItems === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-neutral-500 hover:text-[#D62828] font-medium px-2 py-1 rounded-md hover:bg-red-900/10 transition-colors"
                    aria-label="Clear all items from cart"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-[#1A1A1A] border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-600 transition-all"
                  aria-label="Close cart"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Cart Items List ── */}
            {items.length === 0 ? (
              <EmptyCartState />
            ) : (
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <CartLineItem
                      key={item.cartLineId}
                      item={item}
                      onIncrement={handleIncrement}
                      onDecrement={handleDecrement}
                      onRemove={handleRemove}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* ── Financial Summary + CTA ── */}
            {items.length > 0 && (
              <div className="border-t border-neutral-800 px-5 py-4 space-y-2 bg-[#0F0F0F]">
                {/* Estimated Prep Time */}
                <div className="flex items-center gap-1.5 mb-3">
                  <Clock className="w-3.5 h-3.5 text-[#F7B731]" />
                  <span className="text-[11px] text-neutral-400 font-medium">
                    Est. prep time:{' '}
                    <span className="text-[#F7B731] font-semibold">{prepTime} min</span>
                  </span>
                </div>

                {/* Price Breakdown */}
                <SummaryRow label="Subtotal" value={formatPKR(summary.subtotal)} />
                {summary.discountAmount > 0 && (
                  <SummaryRow
                    label="Discount"
                    value={`-${formatPKR(summary.discountAmount)}`}
                    isDiscount
                  />
                )}
                <SummaryRow
                  label="Delivery Fee"
                  value={
                    summary.deliveryFee === 0
                      ? 'FREE'
                      : formatPKR(summary.deliveryFee)
                  }
                  isHighlight={summary.deliveryFee === 0}
                />
                <SummaryRow label="GST (16%)" value={formatPKR(summary.taxAmount)} />
                <SummaryRow
                  label="Total"
                  value={formatPKR(summary.grandTotal)}
                  isBold
                />

                {/* Free Delivery Threshold Nudge */}
                {summary.deliveryFee > 0 && summary.subtotal < 2000 && (
                  <div className="mt-2 px-3 py-2 rounded-lg bg-[#F7B731]/10 border border-[#F7B731]/20">
                    <p className="text-[11px] text-[#F7B731] font-medium text-center">
                      Add {formatPKRCompact(2000 - summary.subtotal)} more for{' '}
                      <span className="font-bold">FREE delivery</span>
                    </p>
                  </div>
                )}

                {/* Checkout CTA */}
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="mt-3 w-full h-12 bg-[#D62828] hover:bg-[#B71C1C] rounded-xl flex items-center justify-center gap-2 text-white font-bold text-sm tracking-wide transition-all active:scale-[0.98] shadow-[0_4px_20px_rgba(214,40,40,0.3)] hover:shadow-[0_6px_28px_rgba(214,40,40,0.45)]"
                >
                  <span>Proceed to Checkout</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
