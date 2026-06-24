'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { AnimatePresence, motion } from 'framer-motion'
import { Clock3 } from 'lucide-react'

import { subscriptionManager } from '@/lib/realtime/subscriptionManager'
import { OrderStatus, useOrderStore } from '@/store/useOrderStore'

interface OrderRealtimeRow {
  id: string
  order_number?: string | null
  status: OrderStatus
  estimated_ready_at?: string | null
}

const terminalStatuses: OrderStatus[] = [OrderStatus.Delivered, OrderStatus.Cancelled]

function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    value === OrderStatus.Received ||
    value === OrderStatus.Preparing ||
    value === OrderStatus.Ready ||
    value === OrderStatus.Dispatched ||
    value === OrderStatus.Delivered ||
    value === OrderStatus.Cancelled
  )
}

function getRemainingMs(estimatedReadyAt: string | null) {
  if (!estimatedReadyAt) return null

  const readyTime = new Date(estimatedReadyAt).getTime()
  if (!Number.isFinite(readyTime)) return null

  return Math.max(0, readyTime - Date.now())
}

function formatCountdown(remainingMs: number | null) {
  if (remainingMs === null) return '--:--'

  const totalSeconds = Math.ceil(remainingMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function formatReadyText(remainingMs: number | null) {
  if (remainingMs === null) return 'Ready soon'
  if (remainingMs <= 0) return 'Ready now'

  return `Ready in ~${Math.ceil(remainingMs / 60000)} mins`
}

export function GlobalOrderTimer() {
  const router = useRouter()
  const activeOrderId = useOrderStore((state) => state.activeOrderId)
  const activeOrderStatus = useOrderStore((state) => state.activeOrderStatus)
  const estimatedReadyAt = useOrderStore((state) => state.estimatedReadyAt)
  const setActiveOrder = useOrderStore((state) => state.setActiveOrder)
  const clearActiveOrder = useOrderStore((state) => state.clearActiveOrder)
  const [remainingMs, setRemainingMs] = useState(() => getRemainingMs(estimatedReadyAt))

  const isVisible = Boolean(
    activeOrderId &&
      activeOrderStatus &&
      !terminalStatuses.includes(activeOrderStatus)
  )

  const readyText = useMemo(() => formatReadyText(remainingMs), [remainingMs])
  const countdown = useMemo(() => formatCountdown(remainingMs), [remainingMs])
  const statusLabel = activeOrderStatus ? activeOrderStatus.replace('_', ' ') : 'received'

  useEffect(() => {
    setRemainingMs(getRemainingMs(estimatedReadyAt))
    const intervalId = window.setInterval(() => {
      setRemainingMs(getRemainingMs(estimatedReadyAt))
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [estimatedReadyAt])

  useEffect(() => {
    if (!activeOrderId) return

    const unsubscribe = subscriptionManager.subscribe(
      `orders:${activeOrderId}`,
      { table: 'orders', event: 'UPDATE', filter: `id=eq.${activeOrderId}` },
      (payload) => {
        const row = payload.new as Partial<OrderRealtimeRow>
        if (!row.id || !isOrderStatus(row.status)) return

        if (terminalStatuses.includes(row.status)) {
          clearActiveOrder()
          return
        }

        setActiveOrder(row.id, row.status, row.estimated_ready_at ?? null)
      }
    )

    return unsubscribe
  }, [activeOrderId, clearActiveOrder, setActiveOrder])

  function handleOpenTracker() {
    if (!activeOrderId) return
    router.push(`/track?orderId=${encodeURIComponent(activeOrderId)}`)
  }

  return (
    <AnimatePresence>
      {isVisible && activeOrderId && (
        <motion.button
          type="button"
          initial={{ y: -72, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -72, opacity: 0 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
          onClick={handleOpenTracker}
          className="fixed inset-x-0 top-0 z-50 border-b border-red-900/10 bg-muncherz-red px-4 py-3 text-left text-white shadow-lg"
        >
          <span className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15">
                <Clock3 className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-black">
                  Order #{activeOrderId} - {readyText}
                </span>
                <span className="mt-1 inline-flex rounded-full bg-muncherz-yellow px-2 py-0.5 text-[11px] font-black uppercase text-muncherz-black">
                  {statusLabel}
                </span>
              </span>
            </span>
            <motion.span
              key={countdown}
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="shrink-0 text-lg font-black tabular-nums"
            >
              {countdown}
            </motion.span>
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
