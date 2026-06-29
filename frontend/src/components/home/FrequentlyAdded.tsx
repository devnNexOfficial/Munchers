'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

import { useRestaurantStatus } from '@/context/RestaurantStatusContext'
import type { MenuItem } from '@/lib/queries/home'
import { useCartStore } from '@/store/useCartStore'

interface FrequentlyAddedProps {
  items: MenuItem[]
}

const itemPlaceholder =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"%3E%3Crect width="240" height="240" fill="%23FAFAFA"/%3E%3Ccircle cx="120" cy="120" r="58" fill="%23fff" stroke="%23F1F1F1" stroke-width="6"/%3E%3Cpath d="M76 130h88c-3 20-19 34-44 34s-41-14-44-34Zm10-20c8-22 20-34 34-34s26 12 34 34H86Z" fill="%23D62828"/%3E%3C/svg%3E'

function formatPrice(price: number) {
  return `Rs. ${Math.round(price)}`
}

export function FrequentlyAdded({ items }: FrequentlyAddedProps) {
  const { isRestaurantClosed } = useRestaurantStatus()
  const addItem = useCartStore((state) => state.addItem)

  if (items.length === 0) return null

  return (
    <section className="bg-muncherz-white py-4">
      <h2 className="px-4 text-base font-extrabold text-muncherz-black">
        Frequently Added
      </h2>
      <div className="hide-scrollbar mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
        {items.map((item) => (
          <motion.article
            key={item.id}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="w-36 flex-none snap-start overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100"
          >
            <div className="relative aspect-square bg-gray-50">
              <Image
                src={item.image_url ?? itemPlaceholder}
                alt={item.name_en}
                fill
                sizes="144px"
                unoptimized={!item.image_url}
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-2 p-3">
              <h3 className="line-clamp-2 min-h-9 text-xs font-extrabold text-muncherz-black">
                {item.name_en}
              </h3>
              <p className="text-sm font-extrabold text-muncherz-red">
                {formatPrice(item.base_price)}
              </p>
              <button
                type="button"
                disabled={isRestaurantClosed}
                onClick={() => {
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
                }}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition active:scale-95 ${
                  isRestaurantClosed
                    ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                    : 'bg-muncherz-red text-white'
                }`}
              >
                Quick Add
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
