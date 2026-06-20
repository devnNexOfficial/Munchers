import Image from 'next/image'
import Link from 'next/link'
import { Search } from 'lucide-react'

export function HomeHeader() {
  return (
    <header className="sticky top-0 z-10 w-full bg-white border-b border-gray-100 shadow-sm px-4 h-16 flex items-center justify-between">
      {/* Left: Logo */}
      <Link href="/" className="flex items-center gap-2 relative">
        <div className="relative w-8 h-8 bg-muncherz-red rounded-full flex items-center justify-center text-white font-bold text-xs overflow-hidden">
          {/* Real logo goes here later */}
          <span className="absolute z-10">M</span>
        </div>
        <span className="font-extrabold text-lg text-muncherz-black tracking-tight">Muncherz</span>
      </Link>

      {/* Center: Location */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Delivering to</span>
        <button className="text-sm font-bold text-muncherz-black flex items-center gap-1 hover:text-muncherz-red transition-colors">
          Lahore
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Right: Search */}
      <Link 
        href="/search"
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 text-muncherz-black transition-colors"
      >
        <Search className="w-5 h-5" />
      </Link>
    </header>
  )
}
