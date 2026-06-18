import React from 'react'

import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'

import { ToastProvider } from '../components/ui/ToastNotification'
import './globals.css'

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Muncherz - Premium Food Customizer',
  description: 'Pakistan\'s first live 2.5D interactive burger customizer. Order food your way.',
  keywords: ['food ordering', 'burger customizer', 'restaurants', 'Pakistan'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} antialiased`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}


