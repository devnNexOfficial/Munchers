'use client'

import React, { useState } from 'react'

import { AlertTriangle, Boxes, Edit3, Plus, Search } from 'lucide-react'

type StockLevel = 'healthy' | 'low' | 'critical' | 'out'

interface InventoryItem {
  id: string
  name: string
  category: string
  unit: string
  quantity: number
  threshold: number
  level: StockLevel
  lastUpdated: string
}

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'inv-01', name: 'Beef Patties (200g)', category: 'Proteins', unit: 'pcs', quantity: 340, threshold: 100, level: 'healthy', lastUpdated: '18 Jun 17:00' },
  { id: 'inv-02', name: 'Brioche Buns', category: 'Bakery', unit: 'pcs', quantity: 280, threshold: 80, level: 'healthy', lastUpdated: '18 Jun 17:00' },
  { id: 'inv-03', name: 'Chicken Fillets', category: 'Proteins', unit: 'pcs', quantity: 45, threshold: 60, level: 'low', lastUpdated: '18 Jun 16:30' },
  { id: 'inv-04', name: 'Cheddar Cheese Slices', category: 'Dairy', unit: 'pcs', quantity: 12, threshold: 50, level: 'critical', lastUpdated: '18 Jun 15:00' },
  { id: 'inv-05', name: 'Frozen Fries (5kg bag)', category: 'Sides', unit: 'bags', quantity: 0, threshold: 5, level: 'out', lastUpdated: '18 Jun 14:00' },
  { id: 'inv-06', name: 'Lettuce (heads)', category: 'Produce', unit: 'pcs', quantity: 22, threshold: 15, level: 'healthy', lastUpdated: '18 Jun 17:00' },
  { id: 'inv-07', name: 'Tomatoes (kg)', category: 'Produce', unit: 'kg', quantity: 8, threshold: 10, level: 'low', lastUpdated: '18 Jun 16:00' },
  { id: 'inv-08', name: 'Cooking Oil (5L)', category: 'Essentials', unit: 'cans', quantity: 6, threshold: 4, level: 'healthy', lastUpdated: '18 Jun 17:00' },
  { id: 'inv-09', name: 'Ketchup Sachets', category: 'Condiments', unit: 'pcs', quantity: 150, threshold: 200, level: 'low', lastUpdated: '18 Jun 15:30' },
  { id: 'inv-10', name: 'Packaging Boxes (L)', category: 'Packaging', unit: 'pcs', quantity: 3, threshold: 30, level: 'critical', lastUpdated: '18 Jun 13:00' },
]

const LEVEL_CONFIG: Record<StockLevel, { label: string; color: string; bg: string; barColor: string }> = {
  healthy: { label: 'Healthy', color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10 border-[#22C55E]/20', barColor: 'bg-[#22C55E]' },
  low:     { label: 'Low',     color: 'text-[#F7B731]', bg: 'bg-[#F7B731]/10 border-[#F7B731]/20', barColor: 'bg-[#F7B731]' },
  critical:{ label: 'Critical',color: 'text-[#D62828]', bg: 'bg-[#D62828]/10 border-[#D62828]/20', barColor: 'bg-[#D62828]' },
  out:     { label: 'Out',     color: 'text-neutral-500',bg: 'bg-neutral-800/50 border-neutral-700',barColor: 'bg-neutral-700' },
}

function getLevel(qty: number, threshold: number): StockLevel {
  if (qty === 0) return 'out'
  if (qty < threshold * 0.3) return 'critical'
  if (qty < threshold) return 'low'
  return 'healthy'
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_INVENTORY)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQty, setEditQty] = useState('')

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase())
  )

  const saveEdit = (id: string) => {
    const qty = parseInt(editQty, 10)
    if (isNaN(qty) || qty < 0) return
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, quantity: qty, level: getLevel(qty, i.threshold), lastUpdated: 'Just now' }
          : i
      )
    )
    setEditingId(null)
    setEditQty('')
  }

  const alertCount = items.filter((i) => i.level === 'critical' || i.level === 'out').length

  return (
    <div className="space-y-8 text-white font-sans max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-neutral-900 pb-6">
        <div className="flex items-center gap-3">
          <Boxes className="w-7 h-7 text-[#D62828]" />
          <div>
            <h1 className="text-2xl font-extrabold tracking-wide uppercase">Inventory Control</h1>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Real-time stock levels, threshold alerts, and quantity management.
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-[#D62828] hover:bg-[#b52020] text-white px-4 py-2.5 rounded-lg text-xs font-bold shadow-[0_4px_12px_rgba(214,40,40,0.2)] transition-all cursor-pointer select-none">
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Alert banner */}
      {alertCount > 0 && (
        <div className="flex items-center gap-3 bg-[#D62828]/10 border border-[#D62828]/30 rounded-xl px-5 py-4">
          <AlertTriangle className="w-5 h-5 text-[#D62828] shrink-0" />
          <p className="text-sm font-semibold text-[#ff6b6b]">
            <strong>{alertCount} item{alertCount > 1 ? 's' : ''}</strong> require immediate restocking — critical or out of stock.
          </p>
        </div>
      )}

      {/* Summary chips */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(['healthy', 'low', 'critical', 'out'] as StockLevel[]).map((lvl) => {
          const cfg = LEVEL_CONFIG[lvl]
          const count = items.filter((i) => i.level === lvl).length
          return (
            <div key={lvl} className={`border rounded-xl p-4 space-y-1 ${cfg.bg}`}>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                {cfg.label}
              </span>
              <span className={`text-2xl font-extrabold ${cfg.color}`}>{count}</span>
            </div>
          )
        })}
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items or categories..."
          className="w-full bg-[#111111] border border-neutral-800 focus:border-[#F7B731] rounded-xl pl-11 pr-4 py-3 text-sm outline-none transition-colors placeholder:text-neutral-600"
        />
      </div>

      {/* Table */}
      <div className="bg-[#111111] border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-[#0d0d0d]">
                {['Item', 'Category', 'Stock Level', 'Quantity', 'Threshold', 'Last Updated', 'Action'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {filtered.map((item) => {
                const cfg = LEVEL_CONFIG[item.level]
                const pct = item.threshold > 0
                  ? Math.min(100, (item.quantity / (item.threshold * 1.5)) * 100)
                  : 0
                const isEditing = editingId === item.id

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors hover:bg-neutral-900/30 ${
                      item.level === 'out' ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Name */}
                    <td className="px-5 py-4 font-semibold text-white whitespace-nowrap">{item.name}</td>

                    {/* Category */}
                    <td className="px-5 py-4 text-neutral-500">{item.category}</td>

                    {/* Level badge */}
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </td>

                    {/* Quantity + mini bar */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 min-w-[80px]">
                        <span className={`font-mono font-bold ${cfg.color}`}>{item.quantity}</span>
                        <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden min-w-[40px]">
                          <div
                            className={`h-full ${cfg.barColor} rounded-full transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-neutral-600">{item.unit}</span>
                      </div>
                    </td>

                    {/* Threshold */}
                    <td className="px-5 py-4 text-neutral-500 font-mono">{item.threshold} {item.unit}</td>

                    {/* Last updated */}
                    <td className="px-5 py-4 text-neutral-600 whitespace-nowrap">{item.lastUpdated}</td>

                    {/* Action */}
                    <td className="px-5 py-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={editQty}
                            onChange={(e) => setEditQty(e.target.value)}
                            className="w-20 bg-[#0A0A0A] border border-neutral-700 focus:border-[#F7B731] rounded-lg px-2 py-1.5 text-xs font-mono outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(item.id)
                              if (e.key === 'Escape') setEditingId(null)
                            }}
                          />
                          <button
                            onClick={() => saveEdit(item.id)}
                            className="px-2.5 py-1.5 bg-[#22C55E] hover:bg-[#16a34a] text-black text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingId(item.id); setEditQty(item.quantity.toString()) }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-neutral-600">
            <Boxes className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">No items match your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}
