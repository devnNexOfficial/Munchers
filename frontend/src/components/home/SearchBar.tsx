'use client'

import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(query.trim())
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [onSearch, query])

  function clearSearch() {
    setQuery('')
    onSearch('')
  }

  return (
    <div className="px-4 py-3">
      <label className="relative block">
        <span className="sr-only">Search menu</span>
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search burgers, deals, items..."
          className="h-12 w-full rounded-full bg-white pl-12 pr-12 text-sm font-medium text-muncherz-black shadow-sm outline-none ring-1 ring-gray-100 transition focus:ring-2 focus:ring-muncherz-red"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-gray-500 transition hover:bg-muncherz-white hover:text-muncherz-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-muncherz-red"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </label>
    </div>
  )
}
