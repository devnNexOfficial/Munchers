import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { OrderTrackerPage } from '@/components/tracker/OrderTrackerPage'

export const metadata: Metadata = {
  title: 'Track Order | Muncherz',
}

interface TrackPageProps {
  searchParams: Promise<{ orderId?: string }>
}

export default async function TrackPage({ searchParams }: TrackPageProps) {
  const resolvedParams = await searchParams
  const orderId = resolvedParams.orderId

  if (!orderId) {
    redirect('/')
  }

  return <OrderTrackerPage orderId={orderId} />
}
