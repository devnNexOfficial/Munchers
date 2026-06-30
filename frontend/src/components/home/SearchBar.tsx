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
    <div className="px-margin-mobile py-3">
      <label className="relative block">
        <span className="sr-only">Search menu</span>
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant/50"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search burgers, deals, items..."
          className="h-12 w-full rounded-full bg-surface-container border border-outline-variant/20 pl-12 pr-12 text-sm font-medium text-on-surface placeholder:text-on-surface-variant/50 outline-none transition focus:border-primary-container focus:ring-2 focus:ring-ember-glow"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-high hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </label>
    </div>
  )
}
