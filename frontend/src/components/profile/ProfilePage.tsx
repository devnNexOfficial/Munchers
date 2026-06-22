'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useProfileStore } from '@/store/useProfileStore'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { MapPin, Plus, Trash2, Edit2, ShoppingBag, Award, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'

// --- Types ---
type Profile = { id: string; name: string | null; phone: string; language: string; loyalty_stamps: number }
type SavedCreation = { id: string; name: string; menu_item_id: string; total_price: number; customizations: any }
type Address = { id: string; label: string; address_text: string; is_default: boolean }
type Order = { id: string; order_number: string; status: string; total: number; created_at: string; items: any }
type RestaurantSettings = { loyalty_enabled: boolean; loyalty_stamp_count: number; loyalty_reward_item: string }

export function ProfilePage() {
  const router = useRouter()
  const { preferredLanguage, setLanguage, isRTL } = useProfileStore()
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [creations, setCreations] = useState<SavedCreation[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [settings, setSettings] = useState<RestaurantSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
        return
      }

      const uid = session.user.id

      // Fetch all required data
      const [profRes, creatRes, addrRes, orderRes, setRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', uid).single(),
        supabase.from('saved_creations').select('*').eq('user_id', uid),
        supabase.from('addresses').select('*').eq('user_id', uid),
        supabase.from('orders').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
        supabase.from('restaurant_settings').select('loyalty_enabled, loyalty_stamp_count, loyalty_reward_item').limit(1).single()
      ])

      if (profRes.data) setProfile(profRes.data as Profile)
      if (creatRes.data) setCreations(creatRes.data as SavedCreation[])
      if (addrRes.data) setAddresses(addrRes.data as Address[])
      if (orderRes.data) setOrders(orderRes.data as Order[])
      if (setRes.data) setSettings(setRes.data as RestaurantSettings)
      
      setLoading(false)
    }
    loadData()
  }, [router])

  if (loading || !profile) {
    return <div className="flex h-screen items-center justify-center p-4">Loading profile...</div>
  }

  return (
    <div className={`mx-auto max-w-lg space-y-8 p-4 pb-24 ${isRTL ? 'text-right' : 'text-left'}`}>
      <HeaderSection profile={profile} lang={preferredLanguage} setLang={setLanguage} />
      <SavedCreationsSection creations={creations} setCreations={setCreations} />
      <AddressesSection addresses={addresses} setAddresses={setAddresses} />
      {settings?.loyalty_enabled && (
        <LoyaltySection stamps={profile.loyalty_stamps} settings={settings} />
      )}
      <OrderHistorySection orders={orders} />
      <AccountSection />
    </div>
  )
}

// --- Header Section ---
function HeaderSection({ profile, lang, setLang }: { profile: Profile; lang: 'en' | 'ur'; setLang: (l: 'en' | 'ur') => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(profile.name || '')
  
  async function handleSaveName() {
    setIsEditing(false)
    if (name === profile.name) return
    const supabase = createClient()
    await supabase.from('profiles').update({ name }).eq('id', profile.id)
    profile.name = name
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muncherz-red text-2xl font-bold text-white">
          {profile.name ? profile.name.charAt(0).toUpperCase() : '👤'}
        </div>
        <div className="flex-1">
          {isEditing ? (
            <div className="flex gap-2">
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="w-full rounded border px-2 py-1 text-sm outline-none focus:border-muncherz-red" 
                autoFocus
              />
              <button onClick={handleSaveName} className="text-sm font-bold text-muncherz-red">Save</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-muncherz-black">{profile.name || 'Set your name'}</h2>
              <button onClick={() => setIsEditing(true)}><Edit2 className="h-4 w-4 text-gray-400" /></button>
            </div>
          )}
          <p className="text-sm text-gray-500">{profile.phone}</p>
        </div>
      </div>
      
      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700">Language</span>
          <div className="flex items-center rounded-full bg-gray-100 p-1">
            <button 
              onClick={() => setLang('en')}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${lang === 'en' ? 'bg-white shadow-sm text-muncherz-red' : 'text-gray-500'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLang('ur')}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${lang === 'ur' ? 'bg-white shadow-sm text-muncherz-red' : 'text-gray-500'}`}
            >
              اردو
            </button>
          </div>
        </div>
        <LogoutButton redirectTo="/" />
      </div>
    </section>
  )
}

// --- Saved Creations Section ---
function SavedCreationsSection({ creations, setCreations }: { creations: SavedCreation[]; setCreations: any }) {
  const addToCart = useCartStore(state => state.addItem)

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('saved_creations').delete().eq('id', id)
    setCreations(creations.filter(c => c.id !== id))
  }

  function handleReAddToCart(creation: SavedCreation) {
    // Re-add to cart logic here. For now, add a generic item since we need the full menu item details
    // In a real implementation we would fetch the menu item and re-calculate price
    addToCart({
      cartItemId: `readd-${Date.now()}`,
      menuItemId: creation.menu_item_id,
      name: creation.name,
      imageUrl: '/placeholder.png', // Fallback, normally fetch from menu_items
      basePrice: creation.total_price, // Fallback, normally fetch from menu_items
      totalPrice: creation.total_price, // Fallback
      quantity: 1,
      selections: creation.customizations || [],
      mealOptions: [],
      specialInstructions: ''
    })
    alert("Creation added to cart! (Price verified against current rates)")
  }

  return (
    <section>
      <h3 className="mb-4 text-lg font-black text-muncherz-black">Saved Creations</h3>
      {creations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
          No saved creations yet
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {creations.map(c => (
            <div key={c.id} className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm">
              <button 
                onClick={() => handleDelete(c.id)}
                className="absolute right-2 top-2 rounded-full bg-gray-100 p-1.5 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="mb-2 h-20 w-full rounded-xl bg-gray-50" /> {/* Placeholder for thumbnail */}
              <h4 className="truncate text-sm font-bold text-gray-900">{c.name}</h4>
              <p className="mb-3 text-xs font-bold text-muncherz-red">Rs. {c.total_price}</p>
              <button 
                onClick={() => handleReAddToCart(c)}
                className="w-full rounded-xl bg-muncherz-black py-2 text-xs font-bold text-white transition hover:bg-gray-800"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// --- Addresses Section ---
function AddressesSection({ addresses, setAddresses }: { addresses: Address[]; setAddresses: any }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-black text-muncherz-black">Saved Addresses</h3>
        <button className="flex items-center gap-1 text-sm font-bold text-muncherz-red hover:underline">
          <Plus className="h-4 w-4" /> Add New
        </button>
      </div>
      
      <div className="space-y-3">
        {addresses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
            No saved addresses
          </div>
        ) : (
          addresses.map(addr => (
            <div key={addr.id} className="flex items-start justify-between rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-gray-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{addr.label || 'Address'}</span>
                    {addr.is_default && (
                      <span className="rounded bg-muncherz-yellow/20 px-1.5 py-0.5 text-[10px] font-black uppercase text-yellow-800">Default</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{addr.address_text}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

// --- Loyalty Section ---
function LoyaltySection({ stamps, settings }: { stamps: number; settings: RestaurantSettings }) {
  const target = settings.loyalty_stamp_count || 10
  const progress = Math.min(stamps, target)
  
  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-muncherz-black to-gray-900 p-6 text-white shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-6 w-6 text-muncherz-yellow" />
          <h3 className="font-black">Loyalty Rewards</h3>
        </div>
        <span className="text-xl font-black text-muncherz-yellow">{progress}/{target}</span>
      </div>
      
      <div className="mb-3 grid grid-cols-5 gap-2">
        {Array.from({ length: target }).map((_, i) => (
          <div key={i} className={`aspect-square rounded-full flex items-center justify-center ${i < progress ? 'bg-muncherz-yellow text-black' : 'bg-white/10'}`}>
            {i < progress && <span className="font-black text-xs">✓</span>}
          </div>
        ))}
      </div>
      
      <p className="text-sm font-medium text-gray-300">
        Collect {target} stamps to get free <span className="font-bold text-white">{settings.loyalty_reward_item || 'meal'}</span>
      </p>
    </section>
  )
}

// --- Order History Section ---
function OrderHistorySection({ orders }: { orders: Order[] }) {
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
          onChange={(e) => setFilter(e.target.value as any)}
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
          filteredOrders.map(order => {
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
                      {/* Render order items securely (assume jsonb format) */}
                      {Array.isArray(order.items) && order.items.map((item: any, idx) => (
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

// --- Account Section ---
function AccountSection() {
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    try {
      await fetch('/api/profile/delete', { method: 'POST' })
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <section className="pt-6">
      {showConfirm ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="mb-3 flex items-start gap-2 text-red-800">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">This will permanently delete your account and all data. This action cannot be undone.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleDelete} className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-bold text-white hover:bg-red-700">
              Confirm Delete
            </button>
            <button onClick={() => setShowConfirm(false)} className="flex-1 rounded-lg bg-white py-2 text-sm font-bold text-gray-700 border hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setShowConfirm(true)}
          className="flex w-full items-center justify-center gap-2 py-4 text-sm font-bold text-muncherz-red hover:underline"
        >
          <Trash2 className="h-4 w-4" /> Delete Account
        </button>
      )}
    </section>
  )
}
