import type { Metadata } from 'next'

import { ClosedOverlay } from '@/components/home/ClosedOverlay'
import { DealsBanner } from '@/components/home/DealsBanner'
import { HomeHeader } from '@/components/home/HomeHeader'
import { ItemGrid } from '@/components/home/ItemGrid'
import { RestaurantStatusProvider } from '@/context/RestaurantStatusContext'
import { getActiveDeals, getCategories, getRestaurantSettings } from '@/lib/queries/home'

export const dynamic = 'force-dynamic'

export function generateMetadata(): Metadata {
  return {
    title: 'Muncherz — Order Fresh, Customize Everything',
    description: "Pakistan's first live 2.5D burger customizer",
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'Restaurant'],
  name: 'Muncherz',
  image: 'https://muncherz.com/logo.png',
  description: "Pakistan's first live 2.5D burger customizer",
  servesCuisine: 'Burgers',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Lahore',
    addressCountry: 'PK',
  },
  url: 'https://muncherz.com',
}

export default async function HomePage() {
  const [deals, categories, settings] = await Promise.all([
    getActiveDeals(),
    getCategories(),
    getRestaurantSettings(),
  ])

  return (
    <main className="min-h-screen bg-muncherz-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HomeHeader />

      <RestaurantStatusProvider>
        <ClosedOverlay initialSettings={settings} />
        <DealsBanner deals={deals} />
        <ItemGrid initialCategories={categories} initialItems={{}} />
      </RestaurantStatusProvider>
    </main>
  )
}
