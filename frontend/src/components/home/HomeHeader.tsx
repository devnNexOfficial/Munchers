import Image from 'next/image'
import Link from 'next/link'
import { Search } from 'lucide-react'

const logoPlaceholder =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"%3E%3Crect width="64" height="64" rx="16" fill="%23D72B2B"/%3E%3Cpath d="M17 45V19h7l8 12 8-12h7v26h-7V31L32 43 24 31v14z" fill="%23fff"/%3E%3C/svg%3E'

export function HomeHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-outline-variant/30 bg-surface/90 backdrop-blur-md px-margin-mobile shadow-md shadow-ember-glow">
      <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Muncherz home">
        <Image
          src={logoPlaceholder}
          alt="Muncherz"
          width={36}
          height={36}
          priority
          unoptimized
          className="h-9 w-9 rounded-lg"
        />
        <div className="flex flex-col">
          <span className="font-display text-[20px] font-black text-primary-container uppercase leading-tight tracking-tighter">
            MUNCHERZ
          </span>
          <div className="flex items-center gap-1 opacity-80">
            <span className="text-label-sm text-on-surface-variant">Downtown Oasis</span>
          </div>
        </div>
      </Link>

      <Link
        href="/search"
        className="flex h-10 w-10 items-center justify-center rounded-full text-primary hover:text-primary-fixed transition-colors active:scale-90"
        aria-label="Search menu"
      >
        <Search className="h-5 w-5" aria-hidden="true" />
      </Link>
    </header>
  )
}
