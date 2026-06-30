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
import { useRouter } from 'next/navigation'

import type { Deal } from '@/lib/queries/home'
import { formatPKR } from '@/lib/utils/formatCurrency'
import { DEALS_SCROLL_INTERVAL_MS } from '@/lib/constants'
import { useCartStore } from '@/store/useCartStore'

interface DealsBannerProps {
  deals: Deal[]
}

export function DealsBanner({ deals }: DealsBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const router = useRouter()

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
    <section className="w-full overflow-hidden bg-surface py-6">
      <div
        ref={containerRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-gutter overflow-x-auto px-margin-mobile pb-4"
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
                <div className="absolute inset-0 bg-gradient-to-br from-[#D62828] to-red-800">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-white/80">
                      Hot Deal
                    </p>
                    <p className="mt-1 line-clamp-2 text-2xl font-black leading-tight text-white">
                      {deal.name}
                    </p>
                  </div>
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

                <button
                  onClick={() => {
                    useCartStore.getState().addItem({
                      cartItemId: crypto.randomUUID(),
                      menuItemId: deal.id,
                      name: deal.name,
                      imageUrl: deal.image_url ?? '',
                      basePrice: deal.deal_price,
                      selections: [],
                      mealOptions: [],
                      totalPrice: deal.deal_price,
                      quantity: 1,
                      specialInstructions: '',
                    })
                    router.push('/cart')
                  }}
                  className="rounded-lg bg-muncherz-red px-4 py-2 text-sm font-semibold text-white transition-transform active:scale-95"
                >
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
