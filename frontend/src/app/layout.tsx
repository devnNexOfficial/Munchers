import type { Metadata } from 'next'
import './globals.css'

import { GlobalOrderTimer } from '@/components/tracker/GlobalOrderTimer'
import { RTLProvider } from '@/components/profile/RTLProvider'

export const metadata: Metadata = {
  title: {
    default: 'Muncherz',
    template: '%s | Muncherz',
  },
  description: "Pakistan's first live 2.5D burger customizer.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-muncherz-white text-muncherz-black antialiased">
        <RTLProvider>
          <GlobalOrderTimer />
          {children}
        </RTLProvider>
      </body>
    </html>
  )
}
