'use client'

import React, { useState } from 'react'

import { CheckCircle2, Clock, MapPin, Phone, Truck } from 'lucide-react'

type DeliveryStatus = 'assigned' | 'en_route' | 'delivered'

interface DeliveryRun {
  id: string
  orderId: string
  rider: string
  phone: string
  address: string
  zone: string
  status: DeliveryStatus
  dispatchedAt: string
  eta: string
}

const MOCK_DELIVERIES: DeliveryRun[] = [
  {
    id: 'dr-001',
    orderId: 'A4F91C',
    rider: 'Ahmed Raza',
    phone: '+92 300 1234567',
    address: 'House 12, Block B, Gulshan-e-Iqbal',
    zone: 'Zone A',
    status: 'en_route',
    dispatchedAt: '17:05',
    eta: '17:25',
  },
  {
    id: 'dr-002',
    orderId: 'B7E33A',
    rider: 'Usman Khan',
    phone: '+92 312 9876543',
    address: 'Shop 4, F-7 Markaz, Islamabad',
    zone: 'Zone B',
    status: 'assigned',
    dispatchedAt: '17:15',
    eta: '17:40',
  },
  {
    id: 'dr-003',
    orderId: 'C2D84F',
    rider: 'Bilal Hassan',
    phone: '+92 321 5556789',
    address: 'Flat 3A, DHA Phase 5',
    zone: 'Zone A',
    status: 'delivered',
    dispatchedAt: '16:30',
    eta: '16:50',
  },
]

const STATUS_CONFIG: Record<
  DeliveryStatus,
  { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }
> = {
  assigned: {
    label: 'Assigned',
    color: 'text-[#F7B731]',
    bg: 'bg-[#F7B731]/10 border-[#F7B731]/20',
    icon: Clock,
  },
  en_route: {
    label: 'En Route',
    color: 'text-[#3B82F6]',
    bg: 'bg-[#3B82F6]/10 border-[#3B82F6]/20',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    color: 'text-[#22C55E]',
    bg: 'bg-[#22C55E]/10 border-[#22C55E]/20',
    icon: CheckCircle2,
  },
}

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState<DeliveryRun[]>(MOCK_DELIVERIES)

  const markDelivered = (id: string) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'delivered' } : d))
    )
  }

  const counts = {
    assigned: deliveries.filter((d) => d.status === 'assigned').length,
    en_route: deliveries.filter((d) => d.status === 'en_route').length,
    delivered: deliveries.filter((d) => d.status === 'delivered').length,
  }

  return (
    <div className="space-y-8 text-white font-sans max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-6">
        <div className="flex items-center gap-3">
          <Truck className="w-7 h-7 text-[#D62828]" />
          <div>
            <h1 className="text-2xl font-extrabold tracking-wide uppercase">Delivery Manager</h1>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Track active delivery runs and rider assignments in real time.
            </p>
          </div>
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Assigned', count: counts.assigned, color: 'text-[#F7B731]', border: 'border-[#F7B731]/20' },
          { label: 'En Route', count: counts.en_route, color: 'text-[#3B82F6]', border: 'border-[#3B82F6]/20' },
          { label: 'Delivered', count: counts.delivered, color: 'text-[#22C55E]', border: 'border-[#22C55E]/20' },
        ].map((s) => (
          <div
            key={s.label}
            className={`bg-[#111111] border ${s.border} rounded-xl p-4 flex flex-col gap-1`}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              {s.label}
            </span>
            <span className={`text-3xl font-extrabold ${s.color}`}>{s.count}</span>
          </div>
        ))}
      </div>

      {/* Delivery run cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {deliveries.map((run) => {
          const cfg = STATUS_CONFIG[run.status]
          const Icon = cfg.icon
          return (
            <div
              key={run.id}
              className="bg-[#111111] border border-neutral-800 rounded-xl p-5 space-y-4 hover:border-neutral-700 transition-colors"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                    Order
                  </span>
                  <span className="text-base font-extrabold text-white">#{run.orderId}</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.color}`}
                >
                  <Icon className="w-3 h-3" />
                  {cfg.label}
                </div>
              </div>

              {/* Rider info */}
              <div className="bg-[#0A0A0A] border border-neutral-900 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 text-xs text-neutral-300">
                  <div className="w-7 h-7 rounded-full bg-[#D62828]/20 border border-[#D62828]/30 flex items-center justify-center text-[#D62828] font-bold text-[10px] shrink-0">
                    {run.rider.charAt(0)}
                  </div>
                  <div>
                    <span className="font-semibold text-white block">{run.rider}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">{run.phone}</span>
                  </div>
                </div>
              </div>

              {/* Delivery info */}
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 text-neutral-400">
                  <MapPin className="w-3.5 h-3.5 text-[#F7B731] shrink-0 mt-0.5" />
                  <span className="leading-snug">{run.address}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-400">
                  <Phone className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
                  <span className="font-mono">{run.phone}</span>
                </div>
              </div>

              {/* Time row */}
              <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono pt-1 border-t border-neutral-900">
                <span>Dispatched: <span className="text-white">{run.dispatchedAt}</span></span>
                <span>ETA: <span className="text-[#F7B731]">{run.eta}</span></span>
                <span className="text-neutral-700">{run.zone}</span>
              </div>

              {/* Action */}
              {run.status !== 'delivered' && (
                <button
                  onClick={() => markDelivered(run.id)}
                  className="w-full h-9 bg-[#22C55E] hover:bg-[#16a34a] text-black text-[11px] font-extrabold uppercase tracking-wider rounded-lg transition-all active:scale-[0.97] cursor-pointer"
                >
                  Mark Delivered
                </button>
              )}
              {run.status === 'delivered' && (
                <div className="w-full h-9 flex items-center justify-center gap-2 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-lg text-[11px] font-bold text-[#22C55E] uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Completed
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
