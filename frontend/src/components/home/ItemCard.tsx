'use client'

/**
 * COMPONENT: ItemCard
 * PURPOSE:   Displays a menu item in the home page grid with image, name,
 *            badges (Best Seller / Chef's Pick), price with discount, and
 *            two action buttons (Add Standard / Customize).
 * DEPENDENCIES: next/image, Framer Motion, MenuItem type
 * SIDE EFFECTS: None — delegates interactions to onOpenDetail callback.
 * PERFORMANCE: React.memo — stable as long as item data and callbacks don't change.
 *   Keyboard-accessible: Enter/Space opens detail modal (role="button" pattern).
 */

import React from 'react'

import Image from 'next/image'
import { motion } from 'framer-motion'

import type { MenuItem } from '@/lib/queries/home'
import { formatPKR } from '@/lib/utils/formatCurrency'

interface ItemCardProps {
  item: MenuItem
  isRestaurantClosed: boolean
  onOpenDetail: (item: MenuItem) => void
}

/** Inline SVG placeholder — prevents broken image boxes before Supabase images load */
const ITEM_PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"%3E%3Crect width="320" height="320" fill="%23FAFAFA"/%3E%3Ccircle cx="160" cy="160" r="86" fill="%23fff" stroke="%23F1F1F1" stroke-width="8"/%3E%3Cpath d="M94 174h132c-3 30-26 50-66 50s-63-20-66-50Zm16-28c9-36 28-58 50-58s41 22 50 58H110Z" fill="%23D62828"/%3E%3C/svg%3E'

/**
 * Calculates the discount percentage shown on the deal badge.
 * Returns null if no discount, 0 if discount exists but calculates to zero.
 * PRIVATE: only used within ItemCard.
 */
function getDiscountPercent(item: MenuItem): number | null {
  if (!item.show_discount || !item.discount_price) return null

  const highPrice = Math.max(item.base_price, item.discount_price)
  const lowPrice = Math.min(item.base_price, item.discount_price)
  if (highPrice <= 0 || highPrice === lowPrice) return 0

  return Math.round(((highPrice - lowPrice) / highPrice) * 100)
}

export const ItemCard = React.memo(function ItemCard({
  item,
  isRestaurantClosed,
  onOpenDetail,
}: ItemCardProps) {
  const discountPercent = getDiscountPercent(item)
  const originalPrice = item.discount_price
  const hasDiscount = item.show_discount && originalPrice !== null

  // Disabled styling when restaurant is closed — visually dims the card
  const disabledClass = isRestaurantClosed
    ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
    : ''

  return (
    <motion.article
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetail(item)}
      onKeyDown={(event) => {
        // Keyboard accessibility: Enter/Space opens the detail modal
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpenDetail(item)
        }
      }}
      className="flex h-full cursor-pointer flex-col overflow-hidden rounded-xl bg-surface-brown border border-outline-variant/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-container focus:ring-offset-2 focus:ring-offset-surface"
    >
      {/* Item image + discount badge */}
      <div className="relative aspect-square bg-gray-50">
        <Image
          src={item.image_url ?? ITEM_PLACEHOLDER}
          alt={item.name_en}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          unoptimized={!item.image_url}
          className="object-cover"
        />
        {item.show_discount && discountPercent !== null && (
          <span className="absolute left-2 top-2 rounded-full bg-muncherz-red px-2.5 py-1 text-[11px] font-extrabold text-white shadow-sm">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3">
        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          {item.is_best_seller && (
            <span className="rounded-full bg-muncherz-yellow px-2 py-0.5 text-[10px] font-bold text-muncherz-black">
              Best Seller
            </span>
          )}
          {item.is_chefs_pick && (
            <span className="rounded-full bg-muncherz-yellow px-2 py-0.5 text-[10px] font-bold text-muncherz-black">
              Chef&apos;s Pick
            </span>
          )}
        </div>

        {/* Name + description */}
        <div className="min-h-[74px]">
          <h3 className="line-clamp-2 text-sm font-extrabold text-muncherz-black sm:text-base">
            {item.name_en}
          </h3>
          {item.description_en && (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
              {item.description_en}
            </p>
          )}
        </div>

        {/* Price row */}
        <div className="mt-auto flex items-baseline gap-2">
          {hasDiscount && (
            <span className="text-xs font-semibold text-gray-400 line-through">
              {formatPKR(originalPrice!)}
            </span>
          )}
          <span className="text-base font-extrabold text-muncherz-red">
            {formatPKR(item.base_price)}
          </span>
        </div>

        {/* CTA buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isRestaurantClosed}
            onClick={(event) => event.stopPropagation()}
            className={`rounded-lg border border-muncherz-red bg-white px-2 py-2 text-xs font-bold text-muncherz-red transition active:scale-95 ${disabledClass}`}
          >
            Add Standard
          </button>
          <button
            type="button"
            disabled={isRestaurantClosed}
            onClick={(event) => event.stopPropagation()}
            className={`rounded-lg border border-muncherz-red bg-muncherz-red px-2 py-2 text-xs font-bold text-white transition active:scale-95 ${
              isRestaurantClosed ? 'cursor-not-allowed border-gray-200 bg-gray-200 text-gray-400' : ''
            }`}
          >
            Customize
          </button>
        </div>
      </div>
    </motion.article>
  )
})
