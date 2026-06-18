'use client'

import React from 'react'

import { BarChart3, ShoppingBag, Star, TrendingUp, Users, Zap } from 'lucide-react'

const MOCK_REVENUE = [
  { day: 'Mon', value: 24500 },
  { day: 'Tue', value: 31200 },
  { day: 'Wed', value: 18900 },
  { day: 'Thu', value: 42100 },
  { day: 'Fri', value: 55800 },
  { day: 'Sat', value: 67300 },
  { day: 'Sun', value: 49200 },
]

const TOP_ITEMS = [
  { name: 'Double Smash Burger', orders: 147, revenue: 103929, pct: 92 },
  { name: 'Crispy Chicken Wrap', orders: 112, revenue: 67200, pct: 78 },
  { name: 'Loaded Fries', orders: 98, revenue: 29400, pct: 68 },
  { name: 'Classic Beef Burger', orders: 84, revenue: 54600, pct: 58 },
  { name: 'Muncherz Combo Meal', orders: 76, revenue: 83600, pct: 53 },
]

const STATS = [
  { label: 'Total Revenue', value: 'Rs. 2,89,100', delta: '+14.2%', up: true, icon: TrendingUp, color: 'text-[#22C55E]' },
  { label: 'Total Orders', value: '517', delta: '+8.6%', up: true, icon: ShoppingBag, color: 'text-[#F7B731]' },
  { label: 'New Customers', value: '143', delta: '+21.3%', up: true, icon: Users, color: 'text-[#3B82F6]' },
  { label: 'Avg. Order Value', value: 'Rs. 559', delta: '-2.1%', up: false, icon: Zap, color: 'text-[#D62828]' },
]

const MAX_REV = Math.max(...MOCK_REVENUE.map((d) => d.value))

function formatK(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(0)}k` : n.toString()
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 text-white font-sans max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-[#D62828]" />
          <div>
            <h1 className="text-2xl font-extrabold tracking-wide uppercase">Analytics</h1>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Last 7 days &mdash; revenue, orders, and top-performing items.
            </p>
          </div>
        </div>
        <div className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider border border-neutral-800 px-3 py-1.5 rounded-lg">
          Demo Data
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => {
          const Icon = s.icon
          return (
            <div
              key={i}
              className="bg-[#111111] border border-neutral-800 rounded-xl p-5 flex flex-col gap-3 hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  {s.label}
                </span>
                <div className={`w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-xl font-extrabold text-white leading-tight">{s.value}</div>
                <div
                  className={`text-[11px] font-bold mt-1 ${
                    s.up ? 'text-[#22C55E]' : 'text-[#D62828]'
                  }`}
                >
                  {s.delta} vs last week
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Revenue Bar Chart */}
      <div className="bg-[#111111] border border-neutral-800 rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-wider">Weekly Revenue</h2>
          <p className="text-[11px] text-neutral-500 mt-0.5">Daily revenue breakdown (PKR)</p>
        </div>

        <div className="flex items-end gap-3 h-48">
          {MOCK_REVENUE.map((d) => {
            const pct = (d.value / MAX_REV) * 100
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[10px] text-neutral-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatK(d.value)}
                </span>
                <div className="w-full relative rounded-t-md overflow-hidden bg-neutral-800/40 flex-1 flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-[#D62828] to-[#F7B731]/60 rounded-t-md transition-all duration-700 hover:from-[#b52020] hover:to-[#e5a828]/60"
                    style={{ height: `${pct}%`, minHeight: '4px' }}
                  />
                </div>
                <span className="text-[10px] font-bold text-neutral-500">{d.day}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top Items Table */}
      <div className="bg-[#111111] border border-neutral-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
              <Star className="w-4 h-4 text-[#F7B731]" />
              Top Performing Items
            </h2>
            <p className="text-[11px] text-neutral-500 mt-0.5">Ranked by order volume this week</p>
          </div>
        </div>

        <div className="divide-y divide-neutral-900">
          {TOP_ITEMS.map((item, i) => (
            <div
              key={i}
              className="px-6 py-4 flex items-center gap-5 hover:bg-neutral-900/30 transition-colors"
            >
              {/* Rank */}
              <span
                className={`text-xs font-extrabold w-6 text-center shrink-0 ${
                  i === 0
                    ? 'text-[#F7B731]'
                    : i === 1
                    ? 'text-neutral-400'
                    : i === 2
                    ? 'text-amber-700'
                    : 'text-neutral-600'
                }`}
              >
                #{i + 1}
              </span>

              {/* Name + bar */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <span className="text-sm font-semibold text-white block truncate">{item.name}</span>
                <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#D62828] to-[#F7B731] rounded-full transition-all duration-700"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="text-right shrink-0 space-y-0.5">
                <div className="text-xs font-bold text-white">{item.orders} orders</div>
                <div className="text-[10px] text-[#F7B731] font-mono">
                  Rs. {item.revenue.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
