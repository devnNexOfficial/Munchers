import type { Metadata } from 'next'
import { Suspense } from 'react'

import CustomizerPageClient from './CustomizerPageClient'

export const dynamic = 'force-dynamic'

export function generateMetadata(): Metadata {
  return {
    title: 'Customize | Muncherz',
  }
}

export default function CustomizePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#0A0A0A] text-white">
          Loading...
        </main>
      }
    >
      <CustomizerPageClient />
    </Suspense>
  )
}
