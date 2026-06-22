'use client'

import { useEffect, useMemo, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChefHat, Clock3, PackageCheck, Truck } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { type OrderStatus, useOrderStore } from '@/store/useOrderStore'

import { FeedbackModal } from './FeedbackModal'

interface OrderTrackerPageProps {
  initialOrderId: string | null
}

interface OrderRow {
  id: string
  order_number: string | null
  status: OrderStatus
  created_at: string
  estimated_ready_at: string | null
  updated_at?: string | null
}

type StepStatus = Exclude<OrderStatus, 'cancelled'>

const steps: Array<{
  status: StepStatus
  label: string
  activeText: string
  icon: typeof Clock3
}> = [
  { status: 'received', label: 'Order Received', activeText: 'We got your order!', icon: PackageCheck },
  { status: 'preparing', label: 'Chef Preparing', activeText: 'Chef is working on it...', icon: ChefHat },
  { status: 'ready', label: 'Ready for Pickup', activeText: 'Almost there!', icon: PackageCheck },
  { status: 'dispatched', label: 'Out for Delivery', activeText: 'Rider is on the way!', icon: Truck },
  { status: 'delivered', label: 'Delivered', activeText: 'Enjoy your meal! ??', icon: Check },
]

function isOrderStatus(value: unknown): value is OrderStatus {
  return steps.some((step) => step.status === value) || value === 'cancelled'
}

function getRemainingMs(estimatedReadyAt: string | null) {
  if (!estimatedReadyAt) return null
  const readyTime = new Date(estimatedReadyAt).getTime()
  if (!Number.isFinite(readyTime)) return null
  return Math.max(0, readyTime - Date.now())
}

function formatTime(value: string | null | undefined) {
  if (!value) return null
  return new Intl.DateTimeFormat('en-PK', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatCountdown(remainingMs: number | null) {
  if (remainingMs === null) return 'Estimating time'
  if (remainingMs <= 0) return 'Ready now'
  return `Estimated ready in ${Math.ceil(remainingMs / 60000)} mins`
}

function toOrderRow(value: unknown): OrderRow | null {
  if (typeof value !== 'object' || value === null) return null
  const row = value as Partial<OrderRow>
  if (!row.id || !isOrderStatus(row.status) || !row.created_at) return null
  return {
    id: row.id,
    order_number: row.order_number ?? null,
    status: row.status,
    created_at: row.created_at,
    estimated_ready_at: row.estimated_ready_at ?? null,
    updated_at: row.updated_at ?? null,
  }
}

export function OrderTrackerPage({ initialOrderId }: OrderTrackerPageProps) {
  const setActiveOrder = useOrderStore((state) => state.setActiveOrder)
  const clearActiveOrder = useOrderStore((state) => state.clearActiveOrder)
  const [order, setOrder] = useState<OrderRow | null>(null)
  const [completedAt, setCompletedAt] = useState<Partial<Record<StepStatus, string>>>({})
  const [remainingMs, setRemainingMs] = useState<number | null>(null)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const activeIndex = order?.status === 'cancelled' ? -1 : steps.findIndex((step) => step.status === order?.status)
  const activeStep = activeIndex >= 0 ? steps[activeIndex] : null
  const orderLabel = order?.order_number ?? initialOrderId ?? 'Pending order'

  const countdownText = useMemo(() => formatCountdown(remainingMs), [remainingMs])

  useEffect(() => {
    if (!initialOrderId) return

    const supabase = createClient()
    supabase
      .from('orders')
      .select('id, order_number, status, created_at, estimated_ready_at, updated_at')
      .eq('id', initialOrderId)
      .maybeSingle()
      .then(({ data, error: queryError }) => {
        if (queryError) setError('Order details are unavailable right now.')
        const nextOrder = toOrderRow(data)
        if (!nextOrder) return
        setOrder(nextOrder)
        setCompletedAt({ received: nextOrder.created_at })
        setActiveOrder(nextOrder.id, nextOrder.status, nextOrder.estimated_ready_at)
      })
  }, [initialOrderId, setActiveOrder])

  useEffect(() => {
    if (!initialOrderId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`tracker:orders:${initialOrderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${initialOrderId}` },
        (payload) => {
          const nextOrder = toOrderRow(payload.new)
          if (!nextOrder) return
          setOrder(nextOrder)
          setCompletedAt((current) => ({
            ...current,
            [nextOrder.status === 'cancelled' ? 'delivered' : nextOrder.status]: nextOrder.updated_at ?? new Date().toISOString(),
          }))
          if (nextOrder.status === 'cancelled') clearActiveOrder()
          else setActiveOrder(nextOrder.id, nextOrder.status, nextOrder.estimated_ready_at)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [clearActiveOrder, initialOrderId, setActiveOrder])

  useEffect(() => {
    setRemainingMs(getRemainingMs(order?.estimated_ready_at ?? null))
    const intervalId = window.setInterval(() => {
      setRemainingMs(getRemainingMs(order?.estimated_ready_at ?? null))
    }, 1000)
    return () => window.clearInterval(intervalId)
  }, [order?.estimated_ready_at])

  useEffect(() => {
    if (order?.status !== 'delivered') return
    const key = `feedback_submitted_${order.id}`
    if (window.localStorage.getItem(key) === 'true') return

    const timeoutId = window.setTimeout(() => setFeedbackOpen(true), 2000)
    return () => window.clearTimeout(timeoutId)
  }, [order?.id, order?.status])

  if (!initialOrderId) {
    return <TrackerShell title="Track Order" message="Open this page from your active order to follow it live." />
  }

  return (
    <main className="min-h-screen bg-muncherz-white px-4 py-20">
      <section className="mx-auto max-w-2xl">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-muncherz-red">Live tracker</p>
          <h1 className="mt-2 text-3xl font-black text-muncherz-black">Order #{orderLabel}</h1>
          <p className="mt-2 text-sm font-bold text-gray-500">{error ?? countdownText}</p>
        </div>

        <div className="mt-4 rounded-xl bg-white p-5 shadow-sm">
          <div className="space-y-5">
            {steps.map((step, index) => {
              const completed = activeIndex > index || order?.status === 'delivered'
              const active = activeIndex === index
              const Icon = step.icon
              const timestamp = completed ? completedAt[step.status] ?? order?.updated_at : null
              return (
                <div key={step.status} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className={`grid h-10 w-10 place-items-center rounded-full ${
                      completed ? 'bg-success text-white' : active ? 'bg-muncherz-red text-white' : 'bg-muncherz-white text-gray-400'
                    }`}>
                      {completed ? <Check className="h-5 w-5" /> : active ? <Spinner /> : <Icon className="h-5 w-5" />}
                    </span>
                    {index < steps.length - 1 && <span className="mt-2 h-10 w-0.5 bg-gray-200" />}
                  </div>
                  <div className="min-w-0 pb-3">
                    <p className={`text-sm font-black ${active ? 'text-muncherz-red' : 'text-muncherz-black'}`}>{step.label}</p>
                    {active && <p className="mt-1 text-sm font-bold text-gray-600">{step.activeText}</p>}
                    {completed && timestamp && <p className="mt-1 text-xs font-bold text-gray-400">{formatTime(timestamp)}</p>}
                  </div>
                </div>
              )
            })}
          </div>
          {order?.status === 'cancelled' && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-muncherz-red">This order was cancelled.</p>
          )}
        </div>
      </section>
      {order && <FeedbackModal orderId={order.id} isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />}
    </main>
  )
}

function Spinner() {
  return (
    <motion.span
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      className="block h-5 w-5 rounded-full border-2 border-white/40 border-t-white"
    />
  )
}

function TrackerShell({ title, message }: { title: string; message: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-muncherz-white px-4 text-center">
      <section className="max-w-sm rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black text-muncherz-black">{title}</h1>
        <p className="mt-2 text-sm font-bold text-gray-500">{message}</p>
      </section>
    </main>
  )
}
