'use client'

import { useEffect, useMemo, useState } from 'react'

import { AlertCircle, Building2, Home, MapPin, Plus } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { addressSchema, type AddressInput } from '@/lib/validators/checkout'

export interface Address {
  id: string
  label: AddressInput['label']
  address_text: string
  landmark: string | null
  lat?: number | string | null
  lng?: number | string | null
  latitude?: number | string | null
  longitude?: number | string | null
  is_default: boolean
}

interface AddressSelectorProps {
  savedAddresses: Address[]
  onSelect: (address: Address, status: { isBlocked: boolean; reason?: string }) => void
  onAddNew: (address: AddressInput) => void
}

const labelIcons = { Home, Office: Building2, Other: MapPin }
const restaurantLat = Number(process.env.NEXT_PUBLIC_RESTAURANT_LAT)
const restaurantLng = Number(process.env.NEXT_PUBLIC_RESTAURANT_LNG)

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return undefined
  const nextValue = Number(value)
  return Number.isFinite(nextValue) ? nextValue : undefined
}

function distanceKm(from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const earthRadiusKm = 6371
  const latDelta = ((to.lat - from.lat) * Math.PI) / 180
  const lngDelta = ((to.lng - from.lng) * Math.PI) / 180
  const startLat = (from.lat * Math.PI) / 180
  const endLat = (to.lat * Math.PI) / 180
  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(lngDelta / 2) ** 2
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function AddressSelector({ savedAddresses, onSelect, onAddNew }: AddressSelectorProps) {
  const defaultAddressId = savedAddresses.find((address) => address.is_default)?.id
  const [selectedId, setSelectedId] = useState(defaultAddressId ?? savedAddresses[0]?.id ?? '')
  const [isAdding, setIsAdding] = useState(savedAddresses.length === 0)
  const [maxDeliveryKm, setMaxDeliveryKm] = useState<number | null>(null)
  const [form, setForm] = useState<AddressInput>({ address_text: '', landmark: '', label: 'Home' })
  const [formError, setFormError] = useState<string | null>(null)
  const selectedAddress = savedAddresses.find((address) => address.id === selectedId)

  useEffect(() => {
    async function fetchDeliveryRadius() {
      const supabase = createClient()
      const { data } = await supabase
        .from('restaurant_settings')
        .select('max_delivery_km')
        .limit(1)
        .maybeSingle()
      const settings = data as { max_delivery_km: number | string | null } | null
      setMaxDeliveryKm(toNumber(settings?.max_delivery_km) ?? null)
    }

    fetchDeliveryRadius()
  }, [])

  const radiusStatus = useMemo(() => {
    if (!selectedAddress) return { isBlocked: false }
    const lat = toNumber(selectedAddress.lat ?? selectedAddress.latitude)
    const lng = toNumber(selectedAddress.lng ?? selectedAddress.longitude)
    if (lat === undefined || lng === undefined) {
      return { isBlocked: false, reason: 'Map pin missing. Server will verify delivery coverage.' }
    }
    if (!Number.isFinite(restaurantLat) || !Number.isFinite(restaurantLng) || maxDeliveryKm === null) {
      return { isBlocked: false, reason: 'Delivery radius will be confirmed before checkout.' }
    }
    const km = distanceKm({ lat: restaurantLat, lng: restaurantLng }, { lat, lng })
    if (km > maxDeliveryKm) {
      return { isBlocked: true, reason: `This address is ${km.toFixed(1)} km away, outside delivery range.` }
    }
    return { isBlocked: false }
  }, [maxDeliveryKm, selectedAddress])

  useEffect(() => {
    if (selectedAddress) onSelect(selectedAddress, radiusStatus)
  }, [onSelect, radiusStatus, selectedAddress])

  function handleSubmit() {
    const result = addressSchema.safeParse(form)
    if (!result.success) {
      setFormError(result.error.issues[0]?.message ?? 'Enter a valid address')
      return
    }
    setFormError(null)
    onAddNew(result.data)
  }

  return (
    <section className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="text-lg font-black text-muncherz-black">Delivery address</h2>
      <div className="mt-4 space-y-3">
        {savedAddresses.map((address) => {
          const Icon = labelIcons[address.label]
          return (
            <label key={address.id} className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 p-3">
              <input type="radio" name="delivery-address" checked={selectedId === address.id} onChange={() => setSelectedId(address.id)} className="mt-1 accent-muncherz-red" />
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muncherz-white text-muncherz-red">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-sm font-black text-muncherz-black">
                  {address.label}
                  {address.is_default && <span className="text-xs text-muncherz-red">Default</span>}
                </span>
                <span className="mt-1 block text-sm font-bold leading-5 text-gray-500">{address.address_text}</span>
                {address.landmark && <span className="mt-1 block text-xs font-bold text-gray-400">{address.landmark}</span>}
              </span>
            </label>
          )
        })}
      </div>
      {radiusStatus.reason && (
        <p className={`mt-3 flex gap-2 text-sm font-bold ${radiusStatus.isBlocked ? 'text-error' : 'text-warning'}`}>
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {radiusStatus.reason}
        </p>
      )}
      <button type="button" onClick={() => setIsAdding((value) => !value)} className="mt-4 inline-flex items-center gap-2 text-sm font-black text-muncherz-red">
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add New Address
      </button>
      {isAdding && (
        <div className="mt-4 space-y-3 rounded-xl border border-gray-200 p-3">
          <input value={form.address_text} onChange={(event) => setForm({ ...form, address_text: event.target.value })} placeholder="House number, street, area" className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm font-bold outline-none focus:border-muncherz-red" />
          <input value={form.landmark} onChange={(event) => setForm({ ...form, landmark: event.target.value })} placeholder="Nearby landmark" className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm font-bold outline-none focus:border-muncherz-red" />
          <select value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value as AddressInput['label'] })} className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm font-bold outline-none focus:border-muncherz-red">
            <option>Home</option>
            <option>Office</option>
            <option>Other</option>
          </select>
          <div className="grid min-h-24 place-items-center rounded-lg bg-muncherz-white text-center text-xs font-black text-gray-400">
            <MapPin className="mb-1 h-5 w-5 text-muncherz-red" aria-hidden="true" />
            {/* TODO: Google Maps API integration - post MVP */}
            Map pin placeholder
          </div>
          {formError && <p className="text-sm font-bold text-error">{formError}</p>}
          <button type="button" onClick={handleSubmit} className="w-full rounded-xl bg-muncherz-red px-4 py-3 text-sm font-black text-white">
            Save Address
          </button>
        </div>
      )}
    </section>
  )
}
