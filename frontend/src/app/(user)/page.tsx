import { Metadata } from 'next'
import { getActiveDeals, getCategories, getRestaurantSettings } from '@/lib/queries/home'
import { HomeHeader } from '@/components/home/HomeHeader'
import { DealsBanner } from '@/components/home/DealsBanner'
import { ClosedOverlay } from '@/components/home/ClosedOverlay'
import { RestaurantStatusProvider } from '@/context/RestaurantStatusContext'

export const metadata: Metadata = {
  title: 'Muncherz — Order Fresh, Customize Everything',
  description: "Pakistan's first live 2.5D burger customizer. Order premium, customized burgers directly to your door.",
}

// JSON-LD structured data for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'Restaurant'],
  name: 'Muncherz',
  image: 'https://muncherz.com/logo.png', // Placeholder
  description: "Pakistan's first live 2.5D burger customizer.",
  servesCuisine: 'Burgers',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Lahore',
    addressCountry: 'PK',
  },
  url: 'https://muncherz.com',
}

export default async function HomePage() {
  // Fetch required initial data on server
  const [deals, categories, settings] = await Promise.all([
    getActiveDeals(),
    getCategories(),
    getRestaurantSettings(),
  ])

  return (
    <main className="min-h-screen bg-muncherz-white">
      {/* Insert JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HomeHeader />
      
      {/* 
        Provider wraps the page content so child components can read isRestaurantClosed 
        The ClosedOverlay updates the context state if settings change via Realtime
      */}
      <RestaurantStatusProvider>
        <ClosedOverlay initialSettings={settings} />
        
        <DealsBanner deals={deals} />
        
        {/* Category tabs + item grid — next prompt */}
        <div className="p-4 text-center text-gray-500 mt-10">
          Menu categories and items will load here...
        </div>
      </RestaurantStatusProvider>
    </main>
  )
}
