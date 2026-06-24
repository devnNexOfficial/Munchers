import type { Metadata } from 'next'

import type { Address } from '@/components/checkout/AddressSelector'
import type { RestaurantSettings } from '@/components/checkout/PaymentMethodSelector'
import { createServerClient } from '@/lib/supabase/server'

import { CheckoutPageClient } from './CheckoutPageClient'

export function generateMetadata(): Metadata {
  return {
    title: {
      absolute: 'Checkout | Muncherz',
    },
  }
}

const fallbackSettings: RestaurantSettings = {
  delivery_charge: 150,
  surge_enabled: false,
  surge_charge: 50,
  surge_start: null,
  surge_end: null,
  gst_enabled: false,
  gst_percentage: 0,
  min_order_amount: 0,
  cod_enabled: true,
  jazzcash_enabled: true,
  easypaisa_enabled: true,
  card_enabled: true,
  prep_time_minutes: 25,
}

function toNumber(value: number | string | null | undefined, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback
  const nextValue = Number(value)
  return Number.isFinite(nextValue) ? nextValue : fallback
}

type CheckoutSearchParams = Promise<{ table?: string | string[] }>

export default async function Page({ searchParams }: { searchParams: CheckoutSearchParams }) {
  const params = await searchParams
  const qrTableNumber = Array.isArray(params.table) ? params.table[0] : params.table
  const supabase = await createServerClient()
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user.id
  const phone = sessionData.session?.user.phone ?? ''

  const { data: settingsData } = await supabase
    .from('restaurant_settings')
    .select(
      'delivery_charge, surge_enabled, surge_charge, surge_start_time, surge_end_time, gst_enabled, gst_percent, min_order_amount, cod_enabled, jazzcash_enabled, easypaisa_enabled, card_enabled, prep_buffer_minutes'
    )
    .limit(1)
    .maybeSingle()

  const settingsRow = settingsData as {
    delivery_charge: number | string | null
    surge_enabled: boolean | null
    surge_charge: number | string | null
    surge_start_time: string | null
    surge_end_time: string | null
    gst_enabled: boolean | null
    gst_percent: number | string | null
    min_order_amount: number | string | null
    cod_enabled: boolean | null
    jazzcash_enabled: boolean | null
    easypaisa_enabled: boolean | null
    card_enabled: boolean | null
    prep_buffer_minutes: number | null
  } | null

  const settings: RestaurantSettings = settingsRow
    ? {
        delivery_charge: toNumber(settingsRow.delivery_charge, fallbackSettings.delivery_charge),
        surge_enabled: settingsRow.surge_enabled ?? fallbackSettings.surge_enabled,
        surge_charge: toNumber(settingsRow.surge_charge, fallbackSettings.surge_charge),
        surge_start: settingsRow.surge_start_time,
        surge_end: settingsRow.surge_end_time,
        gst_enabled: settingsRow.gst_enabled ?? fallbackSettings.gst_enabled,
        gst_percentage: toNumber(settingsRow.gst_percent, fallbackSettings.gst_percentage),
        min_order_amount: toNumber(settingsRow.min_order_amount, fallbackSettings.min_order_amount),
        cod_enabled: settingsRow.cod_enabled ?? fallbackSettings.cod_enabled,
        jazzcash_enabled: settingsRow.jazzcash_enabled ?? fallbackSettings.jazzcash_enabled,
        easypaisa_enabled: settingsRow.easypaisa_enabled ?? fallbackSettings.easypaisa_enabled,
        card_enabled: settingsRow.card_enabled ?? fallbackSettings.card_enabled,
        prep_time_minutes: 25 + (settingsRow.prep_buffer_minutes ?? 0),
      }
    : fallbackSettings

  const { data: addressData } = userId
    ? await supabase
        .from('addresses')
        .select('id, label, address_text, landmark, latitude, longitude, is_default')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
    : { data: [] }

  return (
    <CheckoutPageClient
      initialPhone={phone}
      initialSettings={settings}
      qrTableNumber={qrTableNumber}
      savedAddresses={(addressData ?? []) as Address[]}
    />
  )
}
