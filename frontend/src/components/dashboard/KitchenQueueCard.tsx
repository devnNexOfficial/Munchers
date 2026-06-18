import React, { useEffect, useState } from 'react'

import { Check, Clock } from 'lucide-react'

import type { Order } from '../../types/orders'

interface KitchenQueueCardProps {
  order: Order
  onUpdateStatus: (orderId: string) => void
  isUpdating: boolean
}

export default function KitchenQueueCard({
  order,
  onUpdateStatus,
  isUpdating,
}: KitchenQueueCardProps) {
  const [elapsed, setElapsed] = useState<string>('0m')

  useEffect(() => {
    const calculateElapsed = () => {
      const created = new Date(order.created_at).getTime()
      const now = Date.now()
      const diffMs = now - created
      const diffMins = Math.floor(diffMs / 1000 / 60)
      if (diffMins < 60) {
        setElapsed(`${diffMins}m`)
      } else {
        const hours = Math.floor(diffMins / 60)
        const mins = diffMins % 60
        setElapsed(`${hours}h ${mins}m`)
      }
    }

    calculateElapsed()
    const interval = setInterval(calculateElapsed, 30000) // update every 30s
    return () => clearInterval(interval)
  }, [order.created_at])

  const getUrgencyClass = () => {
    const created = new Date(order.created_at).getTime()
    const diffMins = Math.floor((Date.now() - created) / 1000 / 60)
    if (diffMins > 15) return 'text-[#D62828] font-bold animate-pulse' // Delayed/High Priority
    if (diffMins > 10) return 'text-[#F7B731] font-semibold'
    return 'text-neutral-400 font-medium'
  }

  const getButtonText = () => {
    switch (order.status) {
      case 'pending':
        return 'Start Cooking'
      case 'preparing':
        return 'Mark Ready'
      case 'ready':
        return 'Dispatch Order'
      default:
        return 'Next Stage'
    }
  }

  return (
    <div className="bg-[#161616] border border-neutral-800 rounded-lg p-4 space-y-3 flex flex-col justify-between hover:border-neutral-700 transition-colors">
      <div className="space-y-2.5">
        {/* Ticket Header */}
        <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
          <span className="text-[10px] font-bold text-neutral-450 tracking-wider">
            ORDER #{order.id.slice(-6).toUpperCase()}
          </span>
          <div className="flex items-center gap-1.5 text-xs">
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            <span className={getUrgencyClass()}>{elapsed} ago</span>
          </div>
        </div>

        {/* Item Production Checklist */}
        <div className="space-y-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="text-neutral-300 font-mono text-sm flex items-start gap-2">
              <span className="text-[#F7B731] font-bold shrink-0">{item.quantity}x</span>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-white truncate block">{item.productName}</span>
                {item.variantName && (
                  <span className="text-[10px] text-neutral-500 block">Variant: {item.variantName}</span>
                )}
                {item.specialInstructions && (
                  <span className="text-[10px] text-[#F7B731] italic block mt-0.5 leading-tight">
                    &ldquo;{item.specialInstructions}&rdquo;
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Special Instructions / Notes */}
        {order.special_instructions && (
          <div className="bg-[#0A0A0A] p-2 rounded border border-neutral-800/40 text-xs text-neutral-400 italic">
            <strong>Note:</strong> &ldquo;{order.special_instructions}&rdquo;
          </div>
        )}
      </div>

      {/* Action CTA */}
      <button
        onClick={() => onUpdateStatus(order.id)}
        disabled={isUpdating}
        className="w-full h-9 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 hover:text-white rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 select-none active:scale-[0.98] cursor-pointer"
      >
        {isUpdating ? (
          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Check className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>{getButtonText()}</span>
          </>
        )}
      </button>
    </div>
  )
}
