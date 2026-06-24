'use client'

import { useState } from 'react'
import { ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react'

export interface OrderHistoryItem {
  menu_item_name: string
  quantity: number
  item_total: number
}

export type OrderHistoryEntry = {
  id: string
  order_number: string
  status: string
  total: number
  created_at: string
  items: OrderHistoryItem[] | null
}

export function OrderHistorySection({ orders }: { orders: OrderHistoryEntry[] }) {
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true
    const date = new Date(o.created_at)
    const now = new Date()
    if (filter === 'week') return (now.getTime() - date.getTime()) < 7 * 24 * 60 * 60 * 1000
    if (filter === 'month') return (now.getTime() - date.getTime()) < 30 * 24 * 60 * 60 * 1000
    return true
  })

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-black text-muncherz-black">Order History</h3>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value as 'all' | 'week' | 'month')}
          className="rounded-lg border-gray-200 bg-white py-1 pl-2 pr-8 text-sm outline-none"
        >
          <option value="all">All</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
            No past orders
          </div>
        ) : (
          filteredOrders.map((order: OrderHistoryEntry) => {
            const isExpanded = expandedId === order.id
            const dateStr = new Date(order.created_at).toLocaleDateString()
            return (
              <div key={order.id} className="rounded-2xl bg-white p-4 shadow-sm transition-all">
                <div 
                  className="flex cursor-pointer items-center justify-between"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50">
                      <ShoppingBag className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{order.order_number}</p>
                      <p className="text-xs text-gray-500">{dateStr} • Rs. {order.total}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-gray-100 px-2 py-1 text-[10px] font-black uppercase text-gray-600">
                      {order.status}
                    </span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 border-t pt-4">
                    <div className="mb-4 space-y-2">
                      {Array.isArray(order.items) && (order.items as OrderHistoryItem[]).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700">{item.quantity}x {item.menu_item_name}</span>
                          <span className="font-medium">Rs. {item.item_total}</span>
                        </div>
                      ))}
                    </div>
                    <button className="w-full rounded-xl border-2 border-muncherz-red py-2 font-bold text-muncherz-red transition hover:bg-red-50">
                      Reorder Items
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
