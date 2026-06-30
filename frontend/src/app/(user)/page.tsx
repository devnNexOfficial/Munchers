import type { Metadata } from 'next'

import { ClosedOverlay } from '@/components/home/ClosedOverlay'
import { DailySpecialBanner } from '@/components/home/DailySpecialBanner'
import { DealsBanner } from '@/components/home/DealsBanner'
import { FrequentlyAdded } from '@/components/home/FrequentlyAdded'
import { HomeHeader } from '@/components/home/HomeHeader'
import { ItemGrid } from '@/components/home/ItemGrid'
import { RestaurantStatusProvider } from '@/context/RestaurantStatusContext'
import {
  getActiveDeals,
  getCategories,
  getDailySpecial,
  getFrequentlyAddedItems,
  getRestaurantSettings,
} from '@/lib/queries/home'

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
  const [deals, categories, settings, dailySpecial, frequentlyAdded] = await Promise.all([
    getActiveDeals(),
    getCategories(),
    getRestaurantSettings(),
    getDailySpecial(),
    getFrequentlyAddedItems(),
  ])

  return (
    <main className="min-h-screen bg-surface">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HomeHeader />

      <RestaurantStatusProvider>
        <ClosedOverlay initialSettings={settings} />
        <DealsBanner deals={deals} />
        <DailySpecialBanner item={dailySpecial} />
        <FrequentlyAdded items={frequentlyAdded} />
        <ItemGrid initialCategories={categories} initialItems={{}} />
      </RestaurantStatusProvider>
    </main>
  )
}
