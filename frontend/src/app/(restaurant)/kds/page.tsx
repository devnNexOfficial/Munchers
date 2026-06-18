'use client'

import React, { useEffect, useState } from 'react'

import { AlertCircle, Clock, MonitorPlay, Zap } from 'lucide-react'

import { useOrderStore } from '../../../store/useOrderStore'
import type { Order, OrderStatus } from '../../../types/orders'

const RESTAURANT_ID = 'muncherz-restaurant-id'

const KDS_COLUMNS: { status: OrderStatus; label: string; color: string; bg: string; border: string }[] = [
  {
    status: 'pending',
    label: 'Incoming',
    color: 'text-[#F7B731]',
    bg: 'bg-[#F7B731]',
    border: 'border-[#F7B731]/25',
  },
  {
    status: 'preparing',
    label: 'Preparing',
    color: 'text-[#D62828]',
    bg: 'bg-[#D62828]',
    border: 'border-[#D62828]/30',
  },
  {
    status: 'ready',
    label: 'Ready',
    color: 'text-[#22C55E]',
    bg: 'bg-[#22C55E]',
    border: 'border-[#22C55E]/25',
  },
]

function ElapsedTimer({ createdAt }: { createdAt: string }) {
  const [elapsed, setElapsed] = useState('')

  useEffect(() => {
    const update = () => {
      const diffMs = Date.now() - new Date(createdAt).getTime()
      const mins = Math.floor(diffMs / 60000)
      const secs = Math.floor((diffMs % 60000) / 1000)
      setElapsed(mins > 0 ? `${mins}m ${secs}s` : `${secs}s`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [createdAt])

  const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
  const urgency =
    mins > 15 ? 'text-[#D62828] animate-pulse' : mins > 8 ? 'text-[#F7B731]' : 'text-neutral-400'

  return (
    <span className={`text-[11px] font-bold tabular-nums ${urgency}`}>{elapsed}</span>
  )
}

function KDSTicket({
  order,
  nextStatus,
  onAdvance,
  advancing,
}: {
  order: Order
  nextStatus: OrderStatus | null
  onAdvance: (id: string) => void
  advancing: boolean
}) {
  const mins = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000)
  const isUrgent = mins > 15
  const isWarning = mins > 8 && !isUrgent

  return (
    <div
      className={`bg-[#111111] rounded-xl border p-4 space-y-3 flex flex-col transition-all hover:scale-[1.01] ${
        isUrgent
          ? 'border-[#D62828]/60 shadow-[0_0_12px_rgba(214,40,40,0.12)]'
          : isWarning
          ? 'border-[#F7B731]/40'
          : 'border-neutral-800'
      }`}
    >
      {/* Ticket header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-extrabold tracking-widest text-neutral-500 uppercase">
          #{order.id.slice(-6).toUpperCase()}
        </span>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-neutral-600" />
          <ElapsedTimer createdAt={order.created_at} />
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1.5">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2 text-xs">
            <span className="text-[#F7B731] font-extrabold shrink-0 w-5 text-right">
              {item.quantity}×
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-white font-semibold leading-tight block truncate">
                {item.productName}
              </span>
              {item.variantName && (
                <span className="text-[10px] text-neutral-500">{item.variantName}</span>
              )}
              {item.specialInstructions && (
                <span className="text-[10px] text-[#F7B731] italic block">
                  &ldquo;{item.specialInstructions}&rdquo;
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Special note */}
      {order.special_instructions && (
        <div className="bg-[#0A0A0A] border border-neutral-800/50 rounded-lg px-2.5 py-2 text-[10px] text-neutral-400 italic">
          Note: &ldquo;{order.special_instructions}&rdquo;
        </div>
      )}

      {/* Customer */}
      <div className="text-[10px] text-neutral-600 font-mono truncate">{order.customer_phone}</div>

      {/* Advance CTA */}
      {nextStatus && (
        <button
          onClick={() => onAdvance(order.id)}
          disabled={advancing}
          className={`w-full h-9 rounded-lg text-[11px] font-extrabold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 select-none active:scale-[0.97] cursor-pointer disabled:opacity-60 ${
            order.status === 'pending'
              ? 'bg-[#F7B731] hover:bg-[#e5a828] text-black'
              : order.status === 'preparing'
              ? 'bg-[#D62828] hover:bg-[#b52020] text-white'
              : 'bg-[#22C55E] hover:bg-[#16a34a] text-black'
          }`}
        >
          {advancing ? (
            <div className="w-3.5 h-3.5 border-2 border-current/40 border-t-current rounded-full animate-spin" />
          ) : (
            <>
              <Zap className="w-3 h-3" />
              {order.status === 'pending'
                ? 'Start Cooking'
                : order.status === 'preparing'
                ? 'Mark Ready'
                : 'Dispatch'}
            </>
          )}
        </button>
      )}
    </div>
  )
}

export default function KDSPage() {
  const { orders, isOperationsLoading, loadRestaurantOrders, updateOrderStatusAction, listenToLiveOrdersPipeline } =
    useOrderStore()
  const [advancingIds, setAdvancingIds] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadRestaurantOrders(RESTAURANT_ID)
    const unsub = listenToLiveOrdersPipeline(RESTAURANT_ID)
    return () => unsub()
  }, [loadRestaurantOrders, listenToLiveOrdersPipeline])

  const getNext = (status: OrderStatus): OrderStatus | null => {
    if (status === 'pending') return 'preparing'
    if (status === 'preparing') return 'ready'
    if (status === 'ready') return 'dispatched'
    return null
  }

  const handleAdvance = async (orderId: string, currentStatus: OrderStatus) => {
    const next = getNext(currentStatus)
    if (!next) return
    setAdvancingIds((p) => ({ ...p, [orderId]: true }))
    try {
      await updateOrderStatusAction(orderId, next)
    } catch (e) {
      console.error(e)
    } finally {
      setAdvancingIds((p) => ({ ...p, [orderId]: false }))
    }
  }

  const activeOrders = orders.filter((o) =>
    ['pending', 'preparing', 'ready'].includes(o.status)
  )

  return (
    <div className="space-y-6 text-white font-sans h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-5">
        <div className="flex items-center gap-3">
          <MonitorPlay className="w-7 h-7 text-[#D62828]" />
          <div>
            <h1 className="text-2xl font-extrabold tracking-wide uppercase">Live KDS</h1>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Real-time kitchen display &mdash; {activeOrders.length} active ticket
              {activeOrders.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {/* Live pulse */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]" />
          </span>
          <span className="text-[10px] font-bold text-[#22C55E] tracking-wider uppercase">
            Live Stream
          </span>
        </div>
      </div>

      {/* Kanban columns */}
      {isOperationsLoading && activeOrders.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {KDS_COLUMNS.map((col) => (
            <div key={col.status} className="space-y-3">
              <div className="h-8 bg-neutral-800/50 rounded-lg animate-pulse" />
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-neutral-800/30 rounded-xl h-40 animate-pulse border border-neutral-800"
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {KDS_COLUMNS.map((col) => {
            const colOrders = orders.filter((o: Order) => o.status === col.status)
            return (
              <div key={col.status} className="space-y-3">
                {/* Column header */}
                <div
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg border ${col.border} bg-[#111111]`}
                >
                  <span className={`text-[11px] font-extrabold tracking-widest uppercase ${col.color}`}>
                    {col.label}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${col.bg} text-black`}
                  >
                    {colOrders.length}
                  </span>
                </div>

                {/* Tickets */}
                {colOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 border border-dashed border-neutral-800 rounded-xl gap-2 text-neutral-700">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">
                      No tickets
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {colOrders.map((order) => (
                      <KDSTicket
                        key={order.id}
                        order={order}
                        nextStatus={getNext(order.status)}
                        onAdvance={(id) => handleAdvance(id, order.status)}
                        advancing={!!advancingIds[order.id]}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
