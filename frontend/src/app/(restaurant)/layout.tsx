'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  BarChart3,
  Boxes,
  ClipboardList,
  LogOut,
  MessageSquare,
  MonitorPlay,
  Percent,
  Settings,
  Truck,
  UserCheck,
  UtensilsCrossed,
} from 'lucide-react'

interface NavItem {
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { label: 'Live KDS',         path: '/kds',             icon: MonitorPlay    },
  { label: 'Menu Manager',     path: '/menu',            icon: UtensilsCrossed},
  { label: 'Inventory Control',path: '/inventory',       icon: Boxes          },
  { label: 'Deals Manager',    path: '/deals',           icon: Percent        },
  { label: 'Orders & Finance', path: '/dashboard/orders',icon: ClipboardList  },
  { label: 'Analytics',        path: '/analytics',       icon: BarChart3      },
  { label: 'Delivery Manager', path: '/delivery',        icon: Truck          },
  { label: 'Feedback Log',     path: '/feedback',        icon: MessageSquare  },
  { label: 'Settings',         path: '/settings',        icon: Settings       },
]

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Skip rendering sidebar and header on the login page
  const isLoginPage = pathname === '/restaurant/login'

  if (isLoginPage) {
    return <div className="min-h-screen bg-[#0A0A0A] text-white">{children}</div>
  }

  const isActive = (path: string) => {
    return pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      {/* Left Structural Sidebar Panel */}
      <aside className="w-64 bg-[#111111] border-r border-neutral-800 flex flex-col p-5 space-y-6 shrink-0">
        <div className="flex items-center space-x-3 px-2 py-4">
          <div className="w-10 h-10 rounded-lg bg-[#D62828] flex items-center justify-center font-bold text-white text-lg shadow-[0_0_15px_rgba(214,40,40,0.4)]">
            M
          </div>
          <div>
            <h1 className="font-extrabold tracking-wider text-base uppercase leading-none">Muncherz</h1>
            <span className="text-[10px] text-neutral-500 font-semibold tracking-widest uppercase">Workspace</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  active
                    ? 'bg-[#D62828] text-white shadow-[0_4px_12px_rgba(214,40,40,0.25)]'
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-neutral-900">
          <Link
            href="/restaurant/login"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold text-neutral-400 hover:bg-neutral-900 hover:text-[#D62828] transition-all duration-150"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Right Side Panel */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-hidden">
        {/* Header Dashboard Block */}
        <header className="h-16 bg-[#111111] border-b border-neutral-800 px-8 flex items-center justify-between z-10 shrink-0">
          {/* Active Operator Shift Metadata */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
              <UserCheck className="w-4 h-4 text-[#F7B731]" />
              <span>Shift:</span>
              <span className="text-white">Manager On Duty</span>
            </div>
            <span className="h-4 w-px bg-neutral-850"></span>
            <div className="text-xs text-neutral-400 font-medium">
              Station ID: <code className="bg-neutral-900 text-neutral-300 px-1.5 py-0.5 rounded font-mono">ST-M104</code>
            </div>
          </div>

          {/* Status Ticker with Muncherz Yellow */}
          <div className="flex items-center space-x-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F7B731] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F7B731]"></span>
            </span>
            <div className="bg-[#F7B731] text-[#0A0A0A] font-extrabold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded shadow-[0_0_10px_rgba(247,183,49,0.3)]">
              KDS Live Stream Active
            </div>
          </div>
        </header>

        {/* Child Component Integration Container */}
        <main className="flex-1 p-8 overflow-y-auto bg-[#0A0A0A]">
          {children}
        </main>
      </div>
    </div>
  )
}
