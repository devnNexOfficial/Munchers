'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useCartStore, type CartItem } from '@/store/useCartStore'

const placeholder =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120"%3E%3Crect width="160" height="120" fill="%23FAFAFA"/%3E%3Ccircle cx="80" cy="60" r="34" fill="%23D62828"/%3E%3C/svg%3E'

export interface QuickAddCardType {
  id: string
  title: string
  subtitle: string
  imageUrl: string | null
  price: number
  actionLabel: string
  items: CartItem[]
}

interface SavedCreationCardProps {
  card: QuickAddCardType
}

export function SavedCreationCard({ card }: SavedCreationCardProps) {
  const addItem = useCartStore((state) => state.addItem)

  return (
    <motion.article
      layout
      className="w-52 shrink-0 rounded-xl bg-white p-3 shadow-sm"
    >
      <div className="relative h-24 overflow-hidden rounded-lg bg-muncherz-white">
        <Image
          src={card.imageUrl ?? placeholder}
          alt={card.title}
          fill
          sizes="208px"
          unoptimized={!card.imageUrl}
          className="object-cover"
        />
      </div>
      <h3 className="mt-3 truncate text-sm font-black text-muncherz-black">{card.title}</h3>
      <p className="mt-1 truncate text-xs font-bold text-gray-500">{card.subtitle}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-black text-muncherz-red">Rs. {Math.round(card.price)}</span>
        <button
          type="button"
          onClick={() => card.items.forEach((item) => addItem({ ...item, cartItemId: crypto.randomUUID() }))}
          className="rounded-full bg-muncherz-red px-4 py-2 text-xs font-black text-white"
        >
          {card.actionLabel}
        </button>
      </div>
    </motion.article>
  )
}
