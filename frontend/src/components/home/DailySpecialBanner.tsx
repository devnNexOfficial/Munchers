'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'

import { useRestaurantStatus } from '@/context/RestaurantStatusContext'
import type { MenuItem } from '@/lib/queries/home'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/useCartStore'

interface DailySpecialBannerProps {
  item: MenuItem | null
}

const specialPlaceholder =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240"%3E%3Crect width="320" height="240" fill="%23FAFAFA"/%3E%3Ccircle cx="160" cy="120" r="72" fill="%23fff" stroke="%23F7B731" stroke-width="8"/%3E%3Cpath d="M102 132h116c-4 24-25 40-58 40s-54-16-58-40Zm14-24c9-28 25-44 44-44s35 16 44 44h-88Z" fill="%23D62828"/%3E%3C/svg%3E'

function getRemainingMs(endsAt: string | null) {
  if (!endsAt) return 0
  return Math.max(new Date(endsAt).getTime() - Date.now(), 0)
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, '0'))
    .join(':')
}

export function DailySpecialBanner({ item }: DailySpecialBannerProps) {
  const [remainingMs, setRemainingMs] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const { isRestaurantClosed } = useRestaurantStatus()
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    const nextRemaining = getRemainingMs(item?.special_ends_at ?? null)
    setRemainingMs(nextRemaining)
    setIsVisible(Boolean(item && nextRemaining > 0))
  }, [item])

  useEffect(() => {
    if (!item || !item.special_ends_at) return

    const intervalId = setInterval(() => {
      const nextRemaining = getRemainingMs(item.special_ends_at)
      setRemainingMs(nextRemaining)

      if (nextRemaining <= 0) {
        setIsVisible(false)
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [item])

  if (!item) return null

  function scrollToItem(itemId: string) {
    document.getElementById(`menu-item-${itemId}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="bg-muncherz-white px-4 py-4"
        >
          <div
            role="button"
            tabIndex={0}
            onClick={() => scrollToItem(item.id)}
            className="flex w-full overflow-hidden rounded-xl bg-white text-left shadow-sm ring-1 ring-gray-100 cursor-pointer"
          >
            <span className="relative block h-32 w-32 flex-none bg-gray-50">
              <Image
                src={item.image_url ?? specialPlaceholder}
                alt={item.name_en}
                fill
                sizes="128px"
                unoptimized={!item.image_url}
                className="object-cover"
              />
            </span>
            <span className="flex min-w-0 flex-1 flex-col justify-between gap-2 p-4">
              <span>
                <span className="inline-flex rounded-full bg-muncherz-yellow px-2.5 py-1 text-[11px] font-extrabold text-muncherz-black">
                  Today&apos;s Special
                </span>
                <span className="mt-2 block truncate text-base font-extrabold text-muncherz-black">
                  {item.name_en}
                </span>
                <span className="mt-1 block text-xs font-semibold text-gray-500" suppressHydrationWarning>
                  Available for {formatCountdown(remainingMs)}
                </span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isRestaurantClosed}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isRestaurantClosed) return
                    addItem({
                      cartItemId: crypto.randomUUID(),
                      menuItemId: item.id,
                      name: item.name_en,
                      imageUrl: item.image_url ?? '',
                      basePrice: item.base_price,
                      selections: [],
                      mealOptions: [],
                      totalPrice: item.base_price,
                      quantity: 1,
                      specialInstructions: '',
                    })
                    router.push('/cart')
                  }}
                  className={`rounded-lg border px-2 py-2 text-center text-xs font-bold ${
                    isRestaurantClosed
                      ? 'border-gray-200 bg-gray-100 text-gray-400'
                      : 'border-muncherz-red bg-white text-muncherz-red'
                  }`}
                >
                  Add Standard
                </button>
                <button
                  type="button"
                  disabled={isRestaurantClosed}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isRestaurantClosed) return
                    router.push(`/customize?itemId=${item.id}`)
                  }}
                  className={`rounded-lg border px-2 py-2 text-center text-xs font-bold ${
                    isRestaurantClosed
                      ? 'border-gray-200 bg-gray-200 text-gray-400'
                      : 'border-muncherz-red bg-muncherz-red text-white'
                  }`}
                >
                  Customize
                </button>
              </div>
            </span>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  )
}
