'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { ChefHat, Clock, Home, ShoppingBag, User } from 'lucide-react'

interface NavItem {
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Customize', path: '/customize', icon: ChefHat },
  { label: 'Cart', path: '/cart', icon: ShoppingBag },
  { label: 'Track', path: '/track', icon: Clock },
  { label: 'Profile', path: '/profile', icon: User },
]

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col max-w-md mx-auto border-x border-neutral-900 relative">
      {/* Dynamic Header */}
      <header className="sticky top-0 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-neutral-900 h-14 flex items-center justify-between px-4 z-40">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-[#D62828] flex items-center justify-center font-bold text-white text-sm shadow-[0_0_10px_rgba(214,40,40,0.5)]">
            M
          </div>
          <span className="font-bold tracking-wider text-sm uppercase">Muncherz</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse"></span>
          <span className="text-xs text-neutral-400 font-medium">Open</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation Panel */}
      <nav className="fixed bottom-0 max-w-md w-full bg-[#121212]/90 backdrop-blur-md border-t border-neutral-800 h-16 flex items-center justify-around z-50">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center w-12 h-12 transition-all duration-200 ${
                active ? 'text-[#D62828] scale-105' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
