'use client'

import React, { useState } from 'react'

import {
  Bell,
  ChevronRight,
  Clock,
  Globe,
  Lock,
  Palette,
  Save,
  Settings,
  Store,
  Truck,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SettingsSection {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const SECTIONS: SettingsSection[] = [
  { id: 'restaurant', label: 'Restaurant Info',   icon: Store   },
  { id: 'hours',      label: 'Operating Hours',   icon: Clock   },
  { id: 'delivery',   label: 'Delivery Settings', icon: Truck   },
  { id: 'branding',   label: 'Branding & Theme',  icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell    },
  { id: 'security',   label: 'Security',          icon: Lock    },
  { id: 'regional',   label: 'Regional & Locale', icon: Globe   },
]

// ─── Field helpers ────────────────────────────────────────────────────────────

function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-4 border-b border-neutral-900 last:border-0">
      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold text-white block">{label}</span>
        {description && (
          <span className="text-[11px] text-neutral-500 mt-0.5 block leading-snug">{description}</span>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-[#22C55E]' : 'bg-neutral-700'
      }`}
      aria-checked={checked}
      role="switch"
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`bg-[#0A0A0A] border border-neutral-800 focus:border-[#F7B731] rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 ${className}`}
    />
  )
}

// ─── Section Panels ───────────────────────────────────────────────────────────

function RestaurantSection() {
  const [name, setName] = useState('Muncherz HQ')
  const [tagline, setTagline] = useState("Pakistan's first 2.5D burger customizer")
  const [phone, setPhone] = useState('+92 300 9876543')
  const [address, setAddress] = useState('Block 5, Clifton, Karachi')
  const [saved, setSaved] = useState(false)

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div className="space-y-0">
      <SettingRow label="Restaurant Name" description="Displayed across all customer-facing surfaces.">
        <TextInput value={name} onChange={setName} className="w-52" />
      </SettingRow>
      <SettingRow label="Tagline" description="Short brand statement shown on the landing page.">
        <TextInput value={tagline} onChange={setTagline} className="w-64" />
      </SettingRow>
      <SettingRow label="Contact Phone" description="Customer support contact number.">
        <TextInput value={phone} onChange={setPhone} className="w-44" />
      </SettingRow>
      <SettingRow label="Address" description="Physical restaurant address for delivery calculations.">
        <TextInput value={address} onChange={setAddress} className="w-64" />
      </SettingRow>
      <div className="pt-4">
        <button
          onClick={save}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
            saved
              ? 'bg-[#22C55E] text-black'
              : 'bg-[#D62828] hover:bg-[#b52020] text-white shadow-[0_4px_12px_rgba(214,40,40,0.2)]'
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

function HoursSection() {
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const [hours, setHours] = useState(
    DAYS.map((d) => ({ day: d, open: true, from: '10:00', to: '23:00' }))
  )

  const toggle = (i: number) =>
    setHours((prev) => prev.map((h, idx) => (idx === i ? { ...h, open: !h.open } : h)))

  return (
    <div className="space-y-0">
      {hours.map((h, i) => (
        <div key={h.day} className="flex items-center justify-between py-3.5 border-b border-neutral-900 last:border-0 gap-4">
          <div className="flex items-center gap-3 w-32 shrink-0">
            <Toggle checked={h.open} onChange={() => toggle(i)} />
            <span className={`text-sm font-semibold ${h.open ? 'text-white' : 'text-neutral-600'}`}>
              {h.day}
            </span>
          </div>
          {h.open ? (
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <input
                type="time"
                defaultValue={h.from}
                className="bg-[#0A0A0A] border border-neutral-800 focus:border-[#F7B731] rounded-lg px-2 py-1.5 text-xs text-white outline-none transition-colors"
              />
              <span>to</span>
              <input
                type="time"
                defaultValue={h.to}
                className="bg-[#0A0A0A] border border-neutral-800 focus:border-[#F7B731] rounded-lg px-2 py-1.5 text-xs text-white outline-none transition-colors"
              />
            </div>
          ) : (
            <span className="text-[11px] text-neutral-600 italic">Closed</span>
          )}
        </div>
      ))}
    </div>
  )
}

function DeliverySection() {
  const [freeAbove, setFreeAbove] = useState('1500')
  const [baseFee, setBaseFee] = useState('99')
  const [maxRadius, setMaxRadius] = useState('10')
  const [selfPickup, setSelfPickup] = useState(true)
  const [deliveryEnabled, setDeliveryEnabled] = useState(true)
  const [saved, setSaved] = useState(false)
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div className="space-y-0">
      <SettingRow label="Delivery Enabled" description="Toggle home delivery on or off platform-wide.">
        <Toggle checked={deliveryEnabled} onChange={setDeliveryEnabled} />
      </SettingRow>
      <SettingRow label="Self-Pickup Option" description="Allow customers to pick up orders at the counter.">
        <Toggle checked={selfPickup} onChange={setSelfPickup} />
      </SettingRow>
      <SettingRow label="Base Delivery Fee (PKR)" description="Charged per order unless free delivery threshold is met.">
        <TextInput value={baseFee} onChange={setBaseFee} className="w-28" />
      </SettingRow>
      <SettingRow label="Free Delivery Above (PKR)" description="Orders above this value get free delivery.">
        <TextInput value={freeAbove} onChange={setFreeAbove} className="w-28" />
      </SettingRow>
      <SettingRow label="Max Delivery Radius (km)" description="Orders outside this radius will be declined.">
        <TextInput value={maxRadius} onChange={setMaxRadius} className="w-28" />
      </SettingRow>
      <div className="pt-4">
        <button
          onClick={save}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
            saved ? 'bg-[#22C55E] text-black' : 'bg-[#D62828] hover:bg-[#b52020] text-white shadow-[0_4px_12px_rgba(214,40,40,0.2)]'
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

function NotificationsSection() {
  const [prefs, setPrefs] = useState({
    newOrder:    true,
    orderReady:  true,
    lowStock:    true,
    reviews:     false,
    dailyReport: true,
    smsAlerts:   false,
  })
  const toggle = (key: keyof typeof prefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }))

  const rows: { key: keyof typeof prefs; label: string; desc: string }[] = [
    { key: 'newOrder',    label: 'New Order Alert',       desc: 'Notify when a new order is placed.'         },
    { key: 'orderReady',  label: 'Order Ready Alert',     desc: 'Notify when kitchen marks order as ready.'  },
    { key: 'lowStock',    label: 'Low Stock Warnings',    desc: 'Alert when inventory falls below threshold.' },
    { key: 'reviews',     label: 'New Review Alert',      desc: 'Notify when a customer submits a review.'   },
    { key: 'dailyReport', label: 'Daily Summary Report',  desc: 'Receive an end-of-day summary email.'       },
    { key: 'smsAlerts',   label: 'SMS Notifications',     desc: 'Receive alerts via SMS on critical events.' },
  ]

  return (
    <div className="space-y-0">
      {rows.map(({ key, label, desc }) => (
        <SettingRow key={key} label={label} description={desc}>
          <Toggle checked={prefs[key]} onChange={() => toggle(key)} />
        </SettingRow>
      ))}
    </div>
  )
}

function SecuritySection() {
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [twoFA, setTwoFA] = useState(false)

  return (
    <div className="space-y-0">
      <SettingRow label="Current Password" description="Enter your existing password to make changes.">
        <input
          type="password"
          value={currentPw}
          onChange={(e) => setCurrentPw(e.target.value)}
          placeholder="••••••••"
          className="bg-[#0A0A0A] border border-neutral-800 focus:border-[#F7B731] rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 w-48"
        />
      </SettingRow>
      <SettingRow label="New Password" description="Minimum 8 characters.">
        <input
          type="password"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          placeholder="••••••••"
          className="bg-[#0A0A0A] border border-neutral-800 focus:border-[#F7B731] rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 w-48"
        />
      </SettingRow>
      <SettingRow label="Confirm New Password">
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          className="bg-[#0A0A0A] border border-neutral-800 focus:border-[#F7B731] rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 w-48"
        />
      </SettingRow>
      <SettingRow label="Two-Factor Authentication" description="Add a second layer of security to your account.">
        <Toggle checked={twoFA} onChange={setTwoFA} />
      </SettingRow>
      <div className="pt-4">
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#D62828] hover:bg-[#b52020] text-white rounded-lg text-xs font-bold shadow-[0_4px_12px_rgba(214,40,40,0.2)] transition-all cursor-pointer select-none">
          <Lock className="w-3.5 h-3.5" />
          Update Password
        </button>
      </div>
    </div>
  )
}

function GenericSection({ label }: { label: string }) {
  return (
    <div className="py-10 text-center text-neutral-600 space-y-2">
      <Settings className="w-8 h-8 mx-auto opacity-30" />
      <p className="text-sm font-semibold">{label} settings coming soon.</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('restaurant')

  const renderContent = () => {
    switch (activeSection) {
      case 'restaurant':    return <RestaurantSection />
      case 'hours':         return <HoursSection />
      case 'delivery':      return <DeliverySection />
      case 'notifications': return <NotificationsSection />
      case 'security':      return <SecuritySection />
      default:
        return <GenericSection label={SECTIONS.find((s) => s.id === activeSection)?.label ?? ''} />
    }
  }

  const activeLabel = SECTIONS.find((s) => s.id === activeSection)?.label ?? ''

  return (
    <div className="text-white font-sans max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-neutral-900 pb-6">
        <Settings className="w-7 h-7 text-[#D62828]" />
        <div>
          <h1 className="text-2xl font-extrabold tracking-wide uppercase">Settings</h1>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Configure your restaurant, delivery rules, notifications, and security.
          </p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <aside className="w-52 shrink-0 space-y-1">
          {SECTIONS.map((s) => {
            const Icon = s.icon
            const active = activeSection === s.id
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none text-left ${
                  active
                    ? 'bg-[#D62828] text-white shadow-[0_4px_12px_rgba(214,40,40,0.2)]'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{s.label}</span>
                </div>
                {active && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            )
          })}
        </aside>

        {/* Content panel */}
        <div className="flex-1 min-w-0 bg-[#111111] border border-neutral-800 rounded-xl p-6">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-white mb-5 pb-4 border-b border-neutral-900">
            {activeLabel}
          </h2>
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
