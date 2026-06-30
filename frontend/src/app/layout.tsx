import type { Metadata } from 'next'
import './globals.css'

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
      <body
        className="bg-surface text-on-surface font-body antialiased selection:bg-primary-container selection:text-on-primary-container"
        suppressHydrationWarning
      >
        <RTLProvider>
          {children}
        </RTLProvider>
      </body>
    </html>
  )
}
