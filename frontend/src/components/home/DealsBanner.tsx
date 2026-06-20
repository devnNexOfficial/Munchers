'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Deal } from '@/lib/queries/home'

export function DealsBanner({ deals }: { deals: Deal[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-scroll logic
  useEffect(() => {
    if (deals.length <= 1 || isPaused) return

    const intervalId = setInterval(() => {
      if (containerRef.current) {
        const nextIndex = (currentIndex + 1) % deals.length
        
        // Use standard scroll API for snap container
        const cardWidth = containerRef.current.scrollWidth / deals.length
        containerRef.current.scrollTo({
          left: cardWidth * nextIndex,
          behavior: 'smooth'
        })
        
        setCurrentIndex(nextIndex)
      }
    }, 4000)

    return () => clearInterval(intervalId)
  }, [currentIndex, deals.length, isPaused])

  if (!deals || deals.length === 0) return null

  return (
    <div className="w-full py-6 bg-muncherz-white overflow-hidden">
      <div 
        ref={containerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar px-4 pb-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onScroll={(e) => {
          // Update current index based on scroll position if user scrolls manually
          const container = e.currentTarget
          const cardWidth = container.scrollWidth / deals.length
          const newIndex = Math.round(container.scrollLeft / cardWidth)
          if (newIndex !== currentIndex && newIndex >= 0 && newIndex < deals.length) {
            setCurrentIndex(newIndex)
          }
        }}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {deals.map((deal) => (
          <motion.div 
            key={deal.id}
            className="flex-none w-[85vw] max-w-[320px] snap-center bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Image section */}
            <div className="relative w-full aspect-video bg-gray-100">
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
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                  No Image
                </div>
              )}
            </div>

            {/* Content section */}
            <div className="p-4 flex flex-col flex-1 justify-between gap-3">
              <h3 className="font-bold text-lg text-muncherz-black leading-tight line-clamp-2">
                {deal.name}
              </h3>
              
              <div className="flex items-end justify-between mt-auto">
                <div className="flex flex-col">
                  {deal.original_price && deal.original_price > deal.deal_price && (
                    <span className="text-xs text-gray-400 line-through">
                      Rs. {deal.original_price}
                    </span>
                  )}
                  <span className="text-xl font-extrabold text-muncherz-red">
                    Rs. {deal.deal_price}
                  </span>
                </div>
                
                <button 
                  className="bg-muncherz-red text-white text-sm font-semibold px-4 py-2 rounded-xl active:scale-95 transition-transform"
                >
                  Order Now
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Pagination indicators */}
      {deals.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {deals.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-6 bg-muncherz-red' : 'w-1.5 bg-gray-200'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
