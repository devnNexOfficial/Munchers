'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Loader2, Package, ChefHat, CheckCircle2, Bike, PartyPopper, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useOrderStore, type OrderStatus } from '@/store/useOrderStore'
import { FeedbackModal } from './FeedbackModal'

interface OrderTrackerPageProps {
  orderId: string
}

const STATUS_CONFIG: Record<OrderStatus, { icon: React.ElementType; label: string; text: string }> = {
  received: { icon: Package, label: 'Order Received', text: 'We got your order!' },
  preparing: { icon: ChefHat, label: 'Chef Preparing', text: 'Chef is working on it...' },
  ready: { icon: CheckCircle2, label: 'Ready for Pickup', text: 'Almost there!' },
  dispatched: { icon: Bike, label: 'Out for Delivery', text: 'Rider is on the way!' },
  delivered: { icon: PartyPopper, label: 'Delivered', text: 'Enjoy your meal! 🎉' },
  cancelled: { icon: X, label: 'Cancelled', text: 'Order was cancelled.' }
}

const STATUS_ORDER: OrderStatus[] = ['received', 'preparing', 'ready', 'dispatched', 'delivered']

export function OrderTrackerPage({ orderId }: OrderTrackerPageProps) {
  const { setActiveOrder, estimatedReadyAt } = useOrderStore()
  const [status, setStatus] = useState<OrderStatus>('received')
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
      
      if (data && data.status) {
        setStatus(data.status as OrderStatus)
        setActiveOrder(orderId, data.status as OrderStatus, data.estimated_ready_at)
        if (data.estimated_ready_at) {
          const readyTime = new Date(data.estimated_ready_at).getTime()
          setRemainingMs(Math.max(0, readyTime - Date.now()))
        }
      } else if (error) {
        console.error('Failed to fetch order', error)
      }
    }
    fetchOrder()

    // Realtime subscription
    const supabase = createClient()
    const channel = supabase
      .channel(`public:orders:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const row = payload.new
          if (row.status) {
            setStatus(row.status as OrderStatus)
            setActiveOrder(orderId, row.status as OrderStatus, row.estimated_ready_at || null)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId, setActiveOrder])

  // Timer interval for estimated time countdown
  useEffect(() => {
    if (!estimatedReadyAt) return
    const intervalId = window.setInterval(() => {
      const readyTime = new Date(estimatedReadyAt).getTime()
      if (Number.isFinite(readyTime)) {
        setRemainingMs(Math.max(0, readyTime - Date.now()))
      }
    }, 1000)
    return () => window.clearInterval(intervalId)
  }, [estimatedReadyAt])

  // Open feedback modal when delivered
  useEffect(() => {
    if (status === 'delivered') {
      const timer = setTimeout(() => {
        setShowFeedbackModal(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [status])

  const currentIndex = STATUS_ORDER.indexOf(status)

  function formatCountdown(ms: number | null) {
    if (ms === null) return '--:--'
    const totalSeconds = Math.ceil(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-muncherz-black">Track Order</h1>
        <p className="mt-2 text-sm text-gray-500">Order #{orderId.substring(0, 8).toUpperCase()}</p>
        
        {status !== 'delivered' && status !== 'cancelled' && (
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
                   isActive && stepStatus === 'preparing' ? <Loader2 className="h-5 w-5 animate-spin" /> :
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
