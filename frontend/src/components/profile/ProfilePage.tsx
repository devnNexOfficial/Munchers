'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useProfileStore } from '@/store/useProfileStore'
import { ProfileHeader } from './ProfileHeader'
import { SavedCreationsSection } from './SavedCreationsSection'
import { AddressesSection } from './AddressesSection'
import { LoyaltySection } from './LoyaltySection'
import { OrderHistorySection } from './OrderHistorySection'
import { AccountSection } from './AccountSection'

import type { IngredientSelection } from '@/lib/layerConfig'
import type { OrderHistoryEntry } from './OrderHistorySection'

type Profile = { id: string; name: string | null; phone: string; language: string; loyalty_stamps: number }
type SavedCreation = { id: string; name: string; menu_item_id: string; total_price: number; customizations: IngredientSelection[] }
type Address = { id: string; label: string; address_text: string; is_default: boolean }
type RestaurantSettings = { loyalty_enabled: boolean; loyalty_stamp_count: number; loyalty_reward_item: string }

export function ProfilePage() {
  const router = useRouter()
  const { preferredLanguage, setLanguage, isRTL } = useProfileStore()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [creations, setCreations] = useState<SavedCreation[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [orders, setOrders] = useState<OrderHistoryEntry[]>([])
  const [settings, setSettings] = useState<RestaurantSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    async function loadData() {
      const supabase = createClient()

      // Timeout fallback: if session check takes more than 3 seconds, redirect to login
      timeoutId = setTimeout(() => {
        router.push('/login')
      }, 3000)

      const { data: { user } } = await supabase.auth.getUser()
      clearTimeout(timeoutId)

      if (!user) {
        router.push('/login')
        return
      }

      const uid = user.id

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
      if (orderRes.data) setOrders(orderRes.data as OrderHistoryEntry[])
      if (setRes.data) setSettings(setRes.data as RestaurantSettings)

      setLoading(false)
    }
    loadData()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [router])

  if (loading) {
    return <div className="flex h-screen items-center justify-center p-4">Loading profile...</div>
  }

  if (!profile) {
    return null
  }

  return (
    <div className={`mx-auto max-w-lg space-y-8 p-4 pb-24 ${isRTL ? 'text-right' : 'text-left'}`}>
      <ProfileHeader profile={profile} lang={preferredLanguage} setLang={setLanguage} />
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
