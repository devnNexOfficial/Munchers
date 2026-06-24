'use client'

/**
 * COMPONENT: DealsBanner
 * PURPOSE:   Auto-scrolling horizontal carousel of active deals on the home page.
 *            Pauses on hover/touch and resumes after release.
 * DEPENDENCIES: Deal type (lib/queries/home), Framer Motion, next/image
 * SIDE EFFECTS: setInterval for auto-scroll (cleaned up in useEffect return).
 * PERFORMANCE:
 *   - clearInterval cleanup prevents memory leaks on unmount
 *   - isPaused prevents interval from scrolling while user is dragging
 *   - Scroll syncs currentIndex via onScroll handler for dot indicators
 */

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

import type { Deal } from '@/lib/queries/home'
import { formatPKR } from '@/lib/utils/formatCurrency'
import { DEALS_SCROLL_INTERVAL_MS } from '@/lib/constants'

interface DealsBannerProps {
  deals: Deal[]
}

export function DealsBanner({ deals }: DealsBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container || deals.length <= 1 || isPaused) return

    const intervalId = setInterval(() => {
      const nextIndex = (currentIndex + 1) % deals.length
      const cardWidth = container.scrollWidth / deals.length

      container.scrollTo({
        left: cardWidth * nextIndex,
        behavior: 'smooth',
      })
      setCurrentIndex(nextIndex)
    }, DEALS_SCROLL_INTERVAL_MS)

    return () => clearInterval(intervalId)
  }, [currentIndex, deals.length, isPaused])

  if (deals.length === 0) return null

  return (
    <section className="w-full overflow-hidden bg-muncherz-white py-6">
      <div
        ref={containerRef}
        className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4"
        onPointerDown={() => setIsPaused(true)}
        onPointerUp={() => setIsPaused(false)}
        onPointerCancel={() => setIsPaused(false)}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onScroll={(event) => {
          const container = event.currentTarget
          const cardWidth = container.scrollWidth / deals.length
          const newIndex = Math.round(container.scrollLeft / cardWidth)

          if (newIndex !== currentIndex && newIndex >= 0 && newIndex < deals.length) {
            setCurrentIndex(newIndex)
          }
        }}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {deals.map((deal) => (
          <motion.article
            key={deal.id}
            className="flex w-[85vw] max-w-[320px] flex-none snap-center flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="relative aspect-video w-full bg-gray-100">
              {deal.image_url ? (
                <Image
                  src={deal.image_url}
                  alt={deal.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 85vw, 320px"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
                  No Image
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col justify-between gap-3 p-4">
              <h3 className="line-clamp-2 text-lg font-bold leading-tight text-muncherz-black">
                {deal.name}
              </h3>

              <div className="mt-auto flex items-end justify-between gap-3">
                <div className="flex flex-col">
                  {deal.original_price && deal.original_price > deal.deal_price && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatPKR(deal.original_price)}
                    </span>
                  )}
                  <span className="text-xl font-extrabold text-muncherz-red">
                    {formatPKR(deal.deal_price)}
                  </span>
                </div>

                <button className="rounded-lg bg-muncherz-red px-4 py-2 text-sm font-semibold text-white transition-transform active:scale-95">
                  Order Now
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {deals.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {deals.map((deal, index) => (
            <div
              key={deal.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'w-6 bg-muncherz-red' : 'w-1.5 bg-gray-200'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
