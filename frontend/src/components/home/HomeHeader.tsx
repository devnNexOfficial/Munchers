import Image from 'next/image'
import Link from 'next/link'
import { Search } from 'lucide-react'

const logoPlaceholder =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"%3E%3Crect width="64" height="64" rx="16" fill="%23D62828"/%3E%3Cpath d="M17 45V19h7l8 12 8-12h7v26h-7V31L32 43 24 31v14z" fill="%23fff"/%3E%3C/svg%3E'

export function HomeHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-gray-100 bg-white px-4">
      <Link href="/" className="flex min-w-0 items-center gap-2" aria-label="Muncherz home">
        <Image
          src={logoPlaceholder}
          alt="Muncherz"
          width={36}
          height={36}
          priority
          unoptimized
          className="h-9 w-9 rounded-lg"
        />
        <span className="hidden text-lg font-extrabold text-muncherz-black sm:inline">
          Muncherz
        </span>
      </Link>

      <div className="flex flex-1 items-center justify-center px-3 text-center">
        <p className="truncate text-sm font-semibold text-muncherz-black">
          Delivering to Lahore
        </p>
      </div>

      <Link
        href="/search"
        className="flex h-10 w-10 items-center justify-center rounded-full text-muncherz-black transition-colors hover:bg-muncherz-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-muncherz-red"
        aria-label="Search menu"
      >
        <Search className="h-5 w-5" aria-hidden="true" />
      </Link>
    </header>
  )
}
