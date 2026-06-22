import type { Metadata } from 'next'

import { PaymentStatusPage } from '@/components/checkout/PaymentStatusPage'
import { createServerClient } from '@/lib/supabase/server'

export function generateMetadata(): Metadata {
  return {
    title: {
      absolute: 'Payment | Muncherz',
    },
  }
}

export default async function Page() {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('restaurant_settings')
    .select('cod_enabled')
    .limit(1)
    .maybeSingle()

  const settings = data as { cod_enabled: boolean | null } | null

  return <PaymentStatusPage codEnabled={settings?.cod_enabled ?? true} />
}
