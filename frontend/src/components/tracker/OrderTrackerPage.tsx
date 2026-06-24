'use client'

/**
 * COMPONENT: OrderTrackerPage
 * PURPOSE:   Shows the live order status timeline and countdown timer.
 *            Subscribes to Supabase Realtime for instant status updates.
 * DEPENDENCIES: subscriptionManager, useOrderStore, FeedbackModal
 * SIDE EFFECTS:
 *   - Supabase Realtime subscription (cleaned up via subscriptionManager)
 *   - setInterval for countdown timer (cleared in useEffect return)
 *   - setTimeout for feedback modal delay (cleared in useEffect return)
 * PERFORMANCE:
 *   - subscriptionManager prevents duplicate channels across components
 *   - Each useEffect has a corresponding cleanup to prevent memory leaks
 */

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Loader2, Package, ChefHat, CheckCircle2, Bike, PartyPopper, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useOrderStore, OrderStatus } from '@/store/useOrderStore'
import { subscriptionManager } from '@/lib/realtime/subscriptionManager'
import { FeedbackModal } from './FeedbackModal'
import {
  COUNTDOWN_INTERVAL_MS,
  FEEDBACK_MODAL_DELAY_MS,
} from '@/lib/constants'
import { formatCountdown } from '@/lib/utils/formatCurrency'

interface OrderTrackerPageProps {
  orderId: string
}

const STATUS_CONFIG: Record<OrderStatus, { icon: React.ElementType; label: string; text: string }> = {
  [OrderStatus.Received]: { icon: Package, label: 'Order Received', text: 'We got your order!' },
  [OrderStatus.Preparing]: { icon: ChefHat, label: 'Chef Preparing', text: 'Chef is working on it...' },
  [OrderStatus.Ready]: { icon: CheckCircle2, label: 'Ready for Pickup', text: 'Almost there!' },
  [OrderStatus.Dispatched]: { icon: Bike, label: 'Out for Delivery', text: 'Rider is on the way!' },
  [OrderStatus.Delivered]: { icon: PartyPopper, label: 'Delivered', text: 'Enjoy your meal! 🎉' },
  [OrderStatus.Cancelled]: { icon: X, label: 'Cancelled', text: 'Order was cancelled.' }
}

const STATUS_ORDER: OrderStatus[] = [
  OrderStatus.Received,
  OrderStatus.Preparing,
  OrderStatus.Ready,
  OrderStatus.Dispatched,
  OrderStatus.Delivered,
]

export function OrderTrackerPage({ orderId }: OrderTrackerPageProps) {
  const { setActiveOrder, estimatedReadyAt } = useOrderStore()
  const [status, setStatus] = useState<OrderStatus>(OrderStatus.Received)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [remainingMs, setRemainingMs] = useState<number | null>(null)

  useEffect(() => {
    // Initial fetch to get current status
    const fetchOrder = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('orders')
        .select('status, estimated_ready_at')
        .eq('id', orderId)
        .single()
      
      if (data?.status) {
        setStatus(data.status as OrderStatus)
        setActiveOrder(orderId, data.status as OrderStatus, data.estimated_ready_at)
        if (data.estimated_ready_at) {
          const readyTime = new Date(data.estimated_ready_at).getTime()
          setRemainingMs(Math.max(0, readyTime - Date.now()))
        }
      } else if (error) {
        console.error('[OrderTrackerPage] Failed to fetch order:', error)
      }
    }
    void fetchOrder()

    // Realtime subscription via subscriptionManager (prevents duplicate channels)
    const unsubscribe = subscriptionManager.subscribe(
      `orders:${orderId}`,
      { table: 'orders', event: 'UPDATE', filter: `id=eq.${orderId}` },
      (payload) => {
        const row = payload.new as Record<string, unknown>
        if (typeof row.status === 'string') {
          setStatus(row.status as OrderStatus)
          setActiveOrder(
            orderId,
            row.status as OrderStatus,
            typeof row.estimated_ready_at === 'string' ? row.estimated_ready_at : null
          )
        }
      }
    )

    return unsubscribe
  }, [orderId, setActiveOrder])

  // Countdown timer — ticks every COUNTDOWN_INTERVAL_MS (1 second)
  useEffect(() => {
    if (!estimatedReadyAt) return
    const intervalId = window.setInterval(() => {
      const readyTime = new Date(estimatedReadyAt).getTime()
      if (Number.isFinite(readyTime)) {
        setRemainingMs(Math.max(0, readyTime - Date.now()))
      }
    }, COUNTDOWN_INTERVAL_MS)
    return () => window.clearInterval(intervalId)
  }, [estimatedReadyAt])

  // Open feedback modal FEEDBACK_MODAL_DELAY_MS after delivery is confirmed
  useEffect(() => {
    if (status === OrderStatus.Delivered) {
      const timer = setTimeout(() => {
        setShowFeedbackModal(true)
      }, FEEDBACK_MODAL_DELAY_MS)
      return () => clearTimeout(timer)
    }
  }, [status])

  // formatCountdown is now imported from lib/utils/formatCurrency (shared utility)
  const currentIndex = STATUS_ORDER.indexOf(status)

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-muncherz-black">Track Order</h1>
        <p className="mt-2 text-sm text-gray-500">Order #{orderId.substring(0, 8).toUpperCase()}</p>
        
        {status !== OrderStatus.Delivered && status !== OrderStatus.Cancelled && (
          <div className="mt-6 rounded-2xl bg-muncherz-red/10 py-6 text-center text-muncherz-red">
            <div className="text-sm font-bold uppercase tracking-wider">Estimated Time</div>
            <div className="mt-1 text-4xl font-black tabular-nums">{formatCountdown(remainingMs)}</div>
          </div>
        )}
      </div>

      <div className="relative pl-8">
        {/* Timeline Line */}
        <div className="absolute bottom-6 left-[2.2rem] top-6 w-0.5 bg-gray-200" />
        
        <div className="absolute bottom-6 left-[2.2rem] top-6 w-0.5 bg-muncherz-red origin-top transition-all duration-700"
             style={{ 
               transform: `scaleY(${currentIndex >= 0 ? currentIndex / (STATUS_ORDER.length - 1) : 0})` 
             }} 
        />

        <div className="space-y-8">
          {STATUS_ORDER.map((stepStatus, index) => {
            const isCompleted = currentIndex > index
            const isActive = currentIndex === index
            const isPending = currentIndex < index
            const config = STATUS_CONFIG[stepStatus]
            const Icon = config.icon

            return (
              <div key={stepStatus} className={`relative flex items-start gap-4 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
                <div className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-white ${
                  isActive ? 'bg-muncherz-red text-white' : 
                  isCompleted ? 'bg-green-500 text-white' : 
                  'bg-gray-200 text-gray-500'
                }`}>
                  {isCompleted ? <Check className="h-5 w-5" /> : 
                   isActive && stepStatus === OrderStatus.Preparing ? <Loader2 className="h-5 w-5 animate-spin" /> :
                   <Icon className="h-5 w-5" />}
                </div>

                <div className="flex-1 pt-2 pb-6">
                  <div className={`font-black ${isActive ? 'text-muncherz-red text-lg' : 'text-gray-900'}`}>
                    {config.label}
                  </div>
                  {isActive && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="mt-1 text-sm font-bold text-gray-600"
                    >
                      {config.text}
                    </motion.div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <FeedbackModal 
        orderId={orderId} 
        isOpen={showFeedbackModal} 
        onClose={() => setShowFeedbackModal(false)} 
      />
    </div>
  )
}
