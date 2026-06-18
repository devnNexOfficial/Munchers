'use client'

import React, { useEffect, useState } from 'react'

import { AlertCircle, ClipboardList, Filter, RefreshCw } from 'lucide-react'

import { OrderCardSkeleton, StatsCardSkeleton } from '../../../../components/ui/Skeleton'
import { useToast } from '../../../../components/ui/ToastNotification'
import { useOrderStore } from '../../../../store/useOrderStore'
import type { OrderStatus } from '../../../../types/orders'
import { formatPKR } from '../../../../utils/priceCalculator'

const RESTAURANT_ID = 'muncherz-restaurant-id'

const filterTabs: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function RestaurantOrdersPage() {
  const {
    orders,
    isOperationsLoading,
    activeFilterStatus,
    setActiveFilterStatus,
    loadRestaurantOrders,
    updateOrderStatusAction,
    listenToLiveOrdersPipeline,
  } = useOrderStore()

  const { success, error } = useToast()
  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadRestaurantOrders(RESTAURANT_ID)
    const unsubscribe = listenToLiveOrdersPipeline(RESTAURANT_ID)
    return () => unsubscribe()
  }, [loadRestaurantOrders, listenToLiveOrdersPipeline])

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case 'pending':
        return 'preparing'
      case 'preparing':
        return 'ready'
      case 'ready':
        return 'dispatched'
      case 'dispatched':
        return 'completed'
      default:
        return null
    }
  }

  const handleUpdateStatus = async (orderId: string, currentStatus: OrderStatus) => {
    const next = getNextStatus(currentStatus)
    if (!next) return

    setUpdatingIds((prev) => ({ ...prev, [orderId]: true }))
    try {
      await updateOrderStatusAction(orderId, next)
      const label: Record<string, string> = {
        preparing: '🍳 Order is now being prepared.',
        ready: '✅ Order is ready for pickup.',
        dispatched: '🛵 Order dispatched to customer.',
        completed: '🎉 Order completed.',
      }
      success(label[next] ?? `Order moved to ${next}.`)
    } catch (err) {
      console.error('Failed to transition order:', err)
      error('Failed to update order status. Please try again.')
    } finally {
      setUpdatingIds((prev) => ({ ...prev, [orderId]: false }))
    }
  }

  // Count helper
  const getCountByStatus = (status: OrderStatus | 'all') => {
    if (status === 'all') return orders.length
    return orders.filter((o) => o.status === status).length
  }

  // Filtered list
  const filteredOrders = activeFilterStatus === 'all'
    ? orders
    : orders.filter((o) => o.status === activeFilterStatus)

  return (
    <div className="space-y-8 text-white font-sans max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-neutral-900 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-wide uppercase flex items-center gap-3">
            <ClipboardList className="w-7 h-7 text-[#D62828]" />
            Orders & Finance
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Monitor incoming requests, transition order preparation stages, and review kitchen statistics in real time.
          </p>
        </div>

        <button
          onClick={() => loadRestaurantOrders(RESTAURANT_ID)}
          disabled={isOperationsLoading}
          className="flex items-center justify-center space-x-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-850 text-neutral-300 hover:text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 select-none cursor-pointer"
          aria-label="Refresh orders list"
        >
          <RefreshCw className={`w-4 h-4 ${isOperationsLoading ? 'animate-spin' : ''}`} />
          <span>{isOperationsLoading ? 'Syncing...' : 'Force Refresh'}</span>
        </button>
      </div>

      {/* Stats Summary Rows */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isOperationsLoading && orders.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
        ) : ([
          { label: 'Total Active', count: orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length, color: 'text-white border-neutral-800' },
          { label: 'Pending Approval', count: getCountByStatus('pending'), color: 'text-[#F7B731] border-[#F7B731]/20' },
          { label: 'In Kitchen', count: getCountByStatus('preparing'), color: 'text-[#D62828] border-[#D62828]/20' },
          { label: 'Ready / Dispatched', count: getCountByStatus('ready') + getCountByStatus('dispatched'), color: 'text-[#22C55E] border-[#22C55E]/20' },
        ].map((stat, i) => (
          <div key={i} className={`bg-[#121212] border rounded-xl p-4 flex flex-col justify-between ${stat.color}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{stat.label}</span>
            <span className="text-2xl font-extrabold mt-1">{stat.count}</span>
          </div>
        )))}
      </div>

      {/* Filter Navigation Bar */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-neutral-450 text-xs font-bold uppercase tracking-wider px-1">
          <Filter className="w-4 h-4 text-[#F7B731]" />
          <span>Active Status Tabs</span>
        </div>

        <div className="flex items-center space-x-2.5 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
          {filterTabs.map((tab) => {
            const isActive = activeFilterStatus === tab.value
            const count = getCountByStatus(tab.value)
            return (
              <button
                key={tab.value}
                onClick={() => setActiveFilterStatus(tab.value)}
                className={`px-4 py-2.5 rounded-full text-xs font-extrabold tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer select-none ${
                  isActive
                    ? tab.value === 'pending'
                      ? 'bg-[#F7B731] text-black shadow-[0_4px_12px_rgba(247,183,49,0.25)]'
                      : tab.value === 'preparing'
                        ? 'bg-[#D62828] text-white shadow-[0_4px_12px_rgba(214,40,40,0.25)]'
                        : 'bg-white text-black shadow-[0_4px_12px_rgba(255,255,255,0.15)]'
                    : 'bg-neutral-905 text-neutral-400 hover:text-white hover:bg-neutral-850 border border-neutral-800/40'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-black/10 text-current' : 'bg-neutral-800 text-neutral-500'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Grid View */}
      {isOperationsLoading && orders.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-[#121212] border border-neutral-850 rounded-xl p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center mx-auto text-neutral-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No orders found</h3>
            <p className="text-xs text-neutral-500 mt-1">
              There are no customer orders matching the select status filter currently.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
            const hasNext = getNextStatus(order.status) !== null
            const isPending = order.status === 'pending'
            const isPreparing = order.status === 'preparing'

            return (
              <div
                key={order.id}
                className={`bg-[#121212] border rounded-xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden transition-all group ${
                  isPending
                    ? 'border-neutral-800'
                    : isPreparing
                      ? 'border-[#D62828]/55'
                      : 'border-neutral-800'
                }`}
              >
                {/* Pending Yellow Accent Edge Indicator */}
                {isPending && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#F7B731]" />
                )}

                <div className="space-y-4">
                  {/* Order Meta Header */}
                  <div className="flex items-start justify-between border-b border-neutral-850 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                        Order Code
                      </span>
                      <h3 className="font-extrabold text-sm text-white tracking-wide mt-0.5">
                        #{order.id.slice(-6).toUpperCase()}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                        Total Amount
                      </span>
                      <span className="text-[#F7B731] font-mono text-sm font-bold block mt-0.5">
                        {formatPKR(order.final_total)}
                      </span>
                    </div>
                  </div>

                  {/* Customer Information Section */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                      Customer Info
                    </span>
                    <p className="text-xs text-white font-medium">{order.customer_phone}</p>
                  </div>

                  {/* Component Render of Kitchen Items Display */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                      Itemized Checklist
                    </span>
                    <div className="space-y-1.5 bg-[#0A0A0A]/50 border border-neutral-900 rounded-lg p-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-xs font-mono text-neutral-300 flex items-start gap-1.5">
                          <span className="text-[#F7B731] font-bold">{item.quantity}x</span>
                          <div className="flex-1">
                            <span className="text-neutral-200">{item.productName}</span>
                            {item.variantName && (
                              <span className="text-[10px] text-neutral-500 block">
                                Variant: {item.variantName}
                              </span>
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
                  </div>

                  {/* Special instructions */}
                  {order.special_instructions && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                        Operator Instructions
                      </span>
                      <p className="text-xs text-neutral-400 italic bg-[#0A0A0A] p-2 rounded border border-neutral-850">
                        &ldquo;{order.special_instructions}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* Dashboard Action Row */}
                {hasNext && (
                  <div className="mt-6 pt-4 border-t border-neutral-900">
                    <button
                      onClick={() => handleUpdateStatus(order.id, order.status)}
                      disabled={updatingIds[order.id]}
                      className={`w-full h-11 rounded-lg text-xs font-extrabold tracking-wider uppercase transition-all flex items-center justify-center gap-2 select-none active:scale-[0.98] cursor-pointer ${
                        isPending
                          ? 'bg-[#F7B731] hover:bg-[#e5a828] text-black shadow-[0_4px_12px_rgba(247,183,49,0.2)]'
                          : isPreparing
                            ? 'bg-[#D62828] hover:bg-[#b52020] text-white shadow-[0_4px_12px_rgba(214,40,40,0.2)]'
                            : 'bg-white hover:bg-neutral-200 text-black shadow-[0_4px_12px_rgba(255,255,255,0.1)]'
                      }`}
                    >
                      {updatingIds[order.id] ? (
                        <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      ) : (
                        <span>
                          {order.status === 'pending'
                            ? 'Start Cooking'
                            : order.status === 'preparing'
                              ? 'Mark Ready'
                              : 'Dispatch Order'}
                        </span>
                      )}
                    </button>
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
