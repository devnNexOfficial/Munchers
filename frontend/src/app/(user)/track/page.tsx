import type { Metadata } from 'next'

import { OrderTrackerPage } from '@/components/tracker/OrderTrackerPage'

export function generateMetadata(): Metadata {
  return {
    title: {
      absolute: 'Track Order | Muncherz',
    },
  }
}

type TrackSearchParams = Promise<{ orderId?: string | string[] }>

export default async function Page({ searchParams }: { searchParams: TrackSearchParams }) {
  const params = await searchParams
  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId

  return <OrderTrackerPage initialOrderId={orderId ?? null} />
}
