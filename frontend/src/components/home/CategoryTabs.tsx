'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

import type { Category } from '@/lib/queries/home'

interface CategoryTabsProps {
  categories: Category[]
  activeCategory: string
  onCategoryChange: (id: string) => void
}

const categoryPlaceholder =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"%3E%3Ccircle cx="24" cy="24" r="24" fill="%23FAFAFA"/%3E%3Cpath d="M14 28h20c-.4 4.3-4 7-10 7s-9.6-2.7-10-7Zm2-4c.7-5.5 4.1-9 8-9s7.3 3.5 8 9H16Z" fill="%23D62828"/%3E%3C/svg%3E'

export function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  useEffect(() => {
    if (!activeCategory && categories[0]) {
      onCategoryChange(categories[0].id)
    }
  }, [activeCategory, categories, onCategoryChange])

  useEffect(() => {
    if (!activeCategory) return

    tabRefs.current[activeCategory]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }, [activeCategory])

  if (categories.length === 0) return null

  return (
    <nav aria-label="Menu categories" className="bg-muncherz-white py-3">
      <div className="hide-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4">
        {categories.map((category) => {
          const isActive = category.id === activeCategory

          return (
            <button
              key={category.id}
              ref={(node) => {
                tabRefs.current[category.id] = node
              }}
              type="button"
              onClick={() => onCategoryChange(category.id)}
              className="relative flex min-w-[76px] snap-start flex-col items-center gap-2 px-2 pb-3 pt-1 text-center"
              aria-pressed={isActive}
            >
              <span className="relative h-12 w-12 overflow-hidden rounded-full border border-gray-100 bg-white shadow-sm">
                <Image
                  src={category.image_url ?? categoryPlaceholder}
                  alt={category.name_en}
                  fill
                  sizes="48px"
                  unoptimized={!category.image_url}
                  className="object-cover"
                />
              </span>
              <span
                className={`max-w-[84px] truncate text-xs font-semibold ${
                  isActive ? 'text-muncherz-red' : 'text-gray-500'
                }`}
              >
                {category.name_en}
              </span>
              {isActive && (
                <motion.span
                  layoutId="category-active-indicator"
                  className="absolute bottom-0 h-0.5 w-10 rounded-full bg-muncherz-red"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
