'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { motion } from 'framer-motion'
import { Edit3, Minus, Plus, Trash2 } from 'lucide-react'

import type { CartItem } from '@/store/useCartStore'
import { useCartStore } from '@/store/useCartStore'

interface CartLineItemProps {
  item: CartItem
  onRemove: (cartItemId: string) => void
  onQtyChange: (cartItemId: string, qty: number) => void
  onEditMeal: (item: CartItem) => void
}

const logoPlaceholder =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220"%3E%3Crect width="220" height="220" rx="44" fill="%23D62828"/%3E%3Ccircle cx="110" cy="110" r="62" fill="%23F7B731"/%3E%3Cpath d="M70 124h80c-6 24-21 38-40 38s-34-14-40-38Zm12-26c9-26 18-40 28-40s20 14 28 40H82Z" fill="%230A0A0A"/%3E%3C/svg%3E'

function formatPrice(price: number) {
  return `Rs. ${Math.round(price)}`
}

function humanizeId(id: string) {
  return id.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function getSelectionSummary(item: CartItem) {
  if (item.selections.length === 0) return 'Standard build'

  return item.selections
    .map((selection) => {
      const tier = selection.tier ? `${humanizeId(selection.tier)} ` : ''
      return `${selection.qty}x ${tier}${humanizeId(selection.ingredientId)}`
    })
    .join(' • ')
}

function getMealLabel(item: CartItem) {
  if (item.mealOptions.length === 0) return null
  return item.mealOptions.map((meal) => `${meal.quantity}x ${meal.nameEn}`).join(' • ')
}

export function CartLineItem({ item, onRemove, onQtyChange, onEditMeal }: CartLineItemProps) {
  const router = useRouter()
  const updateSpecialInstructions = useCartStore((state) => state.updateSpecialInstructions)
  const mealLabel = getMealLabel(item)
  const isCustomized = item.selections.length > 0

  function handleEditCustomizations() {
    // TODO: pre-load selections in customizer — wire in customize/page.tsx useEffect on editCartItemId param
    router.push(`/customize?itemId=${item.menuItemId}&editCartItemId=${item.cartItemId}`)
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="rounded-xl bg-white p-4 shadow-sm"
    >
      <div className="flex gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muncherz-white">
          <Image
            src={item.imageUrl || logoPlaceholder}
            alt={item.name}
            fill
            sizes="80px"
            unoptimized={!item.imageUrl}
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-base font-black text-muncherz-black">{item.name}</h2>
              <p className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-gray-500">
                {getSelectionSummary(item)}
              </p>
            </div>
            <button
              type="button"
              aria-label={`Remove ${item.name}`}
              onClick={() => onRemove(item.cartItemId)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gray-200 text-muncherz-red"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {isCustomized && (
              <button
                type="button"
                onClick={handleEditCustomizations}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs font-black text-muncherz-black"
              >
                <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                Edit
              </button>
            )}
            {mealLabel ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-muncherz-yellow px-3 py-1 text-xs font-black text-muncherz-black">
                With Meal
                <button type="button" onClick={() => onEditMeal(item)} className="text-muncherz-red">
                  Edit
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onEditMeal(item)}
                className="text-xs font-black text-muncherz-red"
              >
                Add Meal
              </button>
            )}
          </div>

          {mealLabel && <p className="mt-2 text-xs font-bold text-gray-500">{mealLabel}</p>}

          <motion.div layout className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onQtyChange(item.cartItemId, item.quantity - 1)}
                className="grid h-8 w-8 place-items-center rounded-full border border-gray-200"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <motion.span layout className="w-6 text-center text-sm font-black">
                {item.quantity}
              </motion.span>
              <button
                type="button"
                onClick={() => onQtyChange(item.cartItemId, item.quantity + 1)}
                className="grid h-8 w-8 place-items-center rounded-full bg-muncherz-red text-white"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <p className="text-lg font-black text-muncherz-red">
              {formatPrice(item.totalPrice * item.quantity)}
            </p>
          </motion.div>
        </div>
      </div>
      <label className="mt-4 block">
        <span className="text-xs font-black text-muncherz-black">Special instructions</span>
        <input
          value={item.specialInstructions}
          maxLength={100}
          onChange={(event) => updateSpecialInstructions(item.cartItemId, event.target.value)}
          placeholder="Optional, max 100 chars"
          className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-muncherz-red"
        />
      </label>
    </motion.article>
  )
}
