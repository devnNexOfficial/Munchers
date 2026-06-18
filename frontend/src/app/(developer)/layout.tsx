'use client'

import React, { useEffect,useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Activity, Cpu, Database, FileCode, LogOut,Shield, Terminal } from 'lucide-react'

interface DeveloperNavItem {
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: DeveloperNavItem[] = [
  { label: 'SYS_DASHBOARD', path: '/developer/dashboard', icon: Terminal },
  { label: 'HEALTH_TRAFFIC', path: '/developer/health', icon: Activity },
  { label: 'ERROR_LOG_VIEW', path: '/developer/logs', icon: Cpu },
  { label: 'ACTIVITY_LOGS', path: '/developer/activity', icon: Shield },
  { label: 'DATABASE_STATUS', path: '/developer/db', icon: Database },
  { label: 'CONFIG_FILES', path: '/developer', icon: FileCode },
]

export default function DeveloperLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [systemTime, setSystemTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setSystemTime(now.toISOString().replace('T', ' ').substring(0, 19))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const isLoginPage = pathname === '/developer/login'

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[#020202] text-neutral-300 font-mono select-none">
        {children}
      </div>
    )
  }

  const isActive = (path: string) => {
    if (path === '/developer') {
      return pathname === '/developer'
    }
    return pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-[#020202] text-neutral-300 font-mono flex select-none">
      {/* Monospace Sidebar Controller */}
      <aside className="w-72 bg-[#0A0A0A] border-r border-neutral-900 flex flex-col p-6 space-y-6 shrink-0 relative">
        {/* Terminal Header Decoration */}
        <div className="border border-neutral-900 bg-black/50 p-3 rounded text-[10px] space-y-1">
          <div className="flex items-center justify-between text-[#F7B731]">
            <span className="font-bold">MUNCHERZ MASTER UNIT</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F7B731] animate-ping"></span>
          </div>
          <div className="text-neutral-500">SYS_LOC: PROD-PK-01</div>
          <div className="text-neutral-500">NODE_VER: 20.11.0</div>
        </div>

        {/* Sidebar Nav */}
        <div className="flex-1 space-y-4">
          <div className="text-neutral-600 text-[10px] font-bold tracking-widest uppercase px-2">
            {"// MAIN_NAVIGATION"}
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded text-xs transition-all duration-150 relative ${
                    active
                      ? 'bg-neutral-900/60 text-[#F7B731] border-l-2 border-[#F7B731]'
                      : 'text-neutral-500 hover:bg-neutral-950 hover:text-neutral-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-semibold tracking-wider">{item.label}</span>
                  {active && (
                    <span className="absolute right-3 w-1.5 h-1.5 bg-[#F7B731] rounded-full"></span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer info & Sign Out */}
        <div className="space-y-3 pt-4 border-t border-neutral-900">
          <div className="text-[10px] text-neutral-600 font-bold tracking-wider px-2">
            STABLE_SESSION: OK
          </div>
          <Link
            href="/developer/login"
            className="flex items-center space-x-3 px-3 py-2.5 rounded text-xs text-neutral-500 hover:bg-neutral-950 hover:text-red-500 transition-all duration-150 font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span>TERMINATE_SESSION</span>
          </Link>
        </div>
      </aside>

      {/* Main Panel Console */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Console Bar */}
        <header className="h-14 bg-[#0A0A0A] border-b border-neutral-900 px-6 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-neutral-600">$</span>
              <span className="text-neutral-400 font-semibold">user@muncherz-master:</span>
              <span className="text-[#F7B731]">{pathname}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-neutral-500 font-medium">
            <span>SYS_TIME: <code className="text-neutral-300 font-mono">{systemTime || '...' }</code></span>
            <span className="h-3 w-px bg-neutral-800"></span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded bg-green-500 inline-block shadow-[0_0_8px_#22C55E]"></span>
              <span className="text-neutral-400">STATUS: ACTIVE</span>
            </span>
          </div>
        </header>

        {/* Child Routing Container */}
        <main className="flex-1 p-8 overflow-y-auto bg-[#020202]">
          {/* Decorative Terminal Wrap */}
          <div className="min-h-full border border-neutral-950 bg-black/20 rounded-md p-6 relative overflow-hidden">
            {/* Terminal Scanline Overlay (Visual Polish) */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%] opacity-15"></div>
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
