'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { motion } from 'framer-motion'
import { Check, Loader2, X } from 'lucide-react'

import { clearPendingPayment, getPendingPayment } from '@/lib/pendingPayment'
import { useCartStore } from '@/store/useCartStore'

interface PaymentStatusPageProps {
  codEnabled: boolean
}

type PaymentStatus = 'success' | 'failed' | 'pending'

type OrderStatusResponse = {
  paymentStatus?: 'paid' | 'failed' | 'pending'
  status?: 'success' | 'failed' | 'pending'
}

const statusCopy: Record<PaymentStatus, { eyebrow: string; heading: string }> = {
  success: { eyebrow: 'Payment confirmed', heading: 'Order Placed!' },
  failed: { eyebrow: 'Payment issue', heading: 'Payment Failed' },
  pending: { eyebrow: 'Payment pending', heading: 'Verifying your payment...' },
}

function getFirstParam(value: string | null) {
  return value?.trim() ? value.trim() : null
}

function parseStatus(value: string | null): PaymentStatus {
  if (value === 'success' || value === 'failed' || value === 'pending') return value
  return 'pending'
}

export function PaymentStatusPage({ codEnabled }: PaymentStatusPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clearCart = useCartStore((state) => state.clearCart)
  const addItem = useCartStore((state) => state.addItem)
  const [manualCheckVisible, setManualCheckVisible] = useState(false)
  const [codMessage, setCodMessage] = useState<string | null>(null)
  const status = parseStatus(searchParams.get('status'))
  const orderId = getFirstParam(searchParams.get('orderId')) ?? getPendingPayment()?.orderId
  const reason = getFirstParam(searchParams.get('reason')) ?? 'Your payment could not be completed. Your cart is still safe.'
  const copy = statusCopy[status]

  const orderLabel = useMemo(() => {
    return orderId ? `Order #${orderId}` : 'Order number will appear soon'
  }, [orderId])

  useEffect(() => {
    if (status === 'success') clearPendingPayment()
  }, [status])

  useEffect(() => {
    if (status !== 'pending' || !orderId) return

    setManualCheckVisible(false)
    const startedAt = Date.now()
    const timeoutId = window.setTimeout(() => setManualCheckVisible(true), 30000)
    const intervalId = window.setInterval(async () => {
      try {
        // TODO: wire to real endpoint - Section 13
        const response = await fetch(`/api/orders/status?orderId=${encodeURIComponent(orderId)}`)
        if (!response.ok) return

        const payload = (await response.json()) as OrderStatusResponse
        const nextStatus = payload.paymentStatus ?? payload.status
        if (nextStatus === 'paid' || nextStatus === 'success') {
          router.replace(`/payment?status=success&orderId=${encodeURIComponent(orderId)}`)
        }
        if (nextStatus === 'failed') {
          router.replace(`/payment?status=failed&orderId=${encodeURIComponent(orderId)}`)
        }
      } catch {
        if (Date.now() - startedAt > 30000) setManualCheckVisible(true)
      }
    }, 3000)

    return () => {
      window.clearInterval(intervalId)
      window.clearTimeout(timeoutId)
    }
  }, [orderId, router, status])

  function handleTryAgain() {
    const pendingPayment = getPendingPayment()
    if (pendingPayment) {
      clearCart()
      pendingPayment.cartSnapshot.forEach((item) => addItem(item))
    }
    router.push('/checkout')
  }

  function handlePayCashInstead() {
    setCodMessage('Cash on delivery is ready for the backend order placement handoff.')
    // TODO: wire to POST /api/orders/place - Section 13
  }

  return (
    <main className="min-h-screen bg-muncherz-white px-4 py-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col items-center justify-center text-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">{copy.eyebrow}</p>
        <StatusIcon status={status} />
        <h1 className="mt-6 text-3xl font-black text-muncherz-black sm:text-4xl">{copy.heading}</h1>
        <p className="mt-3 text-sm font-bold leading-6 text-gray-600">{status === 'failed' ? reason : orderLabel}</p>

        {status === 'success' && (
          <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => router.push('/track')}
              className="rounded-xl bg-muncherz-red px-4 py-4 text-sm font-black text-white transition active:scale-95"
            >
              Track Order
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="rounded-xl border border-gray-200 bg-white px-4 py-4 text-sm font-black text-muncherz-black"
            >
              Back to Menu
            </button>
          </div>
        )}

        {status === 'failed' && (
          <div className="mt-8 grid w-full gap-3">
            <button
              type="button"
              onClick={handleTryAgain}
              className="rounded-xl bg-muncherz-red px-4 py-4 text-sm font-black text-white transition active:scale-95"
            >
              Try Again
            </button>
            {codEnabled && (
              <button
                type="button"
                onClick={handlePayCashInstead}
                className="rounded-xl border border-muncherz-red bg-white px-4 py-4 text-sm font-black text-muncherz-red"
              >
                Pay Cash Instead
              </button>
            )}
            {codMessage && <p className="rounded-xl bg-white p-3 text-sm font-bold text-gray-600">{codMessage}</p>}
          </div>
        )}

        {status === 'pending' && (
          <div className="mt-8 w-full rounded-xl bg-white p-4 text-sm font-bold text-gray-600 shadow-sm">
            <p>Checking with the kitchen counter every few seconds.</p>
            {manualCheckVisible && (
              <p className="mt-3 text-muncherz-red">
                This is taking longer than usual. You can keep this screen open or try again from checkout.
              </p>
            )}
          </div>
        )}
      </section>
    </main>
  )
}

function StatusIcon({ status }: { status: PaymentStatus }) {
  const iconClass = 'h-12 w-12'
  if (status === 'pending') {
    return (
      <motion.div className="mt-8 grid h-28 w-28 place-items-center rounded-full bg-white text-muncherz-red shadow-sm">
        <Loader2 className={`${iconClass} animate-spin`} aria-hidden="true" />
      </motion.div>
    )
  }

  const isSuccess = status === 'success'
  return (
    <motion.div
      initial={{ scale: 0.75, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 14 }}
      className={`mt-8 grid h-28 w-28 place-items-center rounded-full text-white shadow-sm ${
        isSuccess ? 'bg-success' : 'bg-muncherz-red'
      }`}
    >
      {isSuccess ? <Check className={iconClass} aria-hidden="true" /> : <X className={iconClass} aria-hidden="true" />}
    </motion.div>
  )
}
