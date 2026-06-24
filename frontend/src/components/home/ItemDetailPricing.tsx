'use client'

/**
 * COMPONENT: ItemDetailPricing
 * PURPOSE:   Price display section inside the item detail modal.
 *            Shows the effective price with optional discount strikethrough,
 *            size variant chips, and cooking preference chips.
 * DEPENDENCIES: None — purely display, no stores or API.
 * PERFORMANCE: React.memo — re-renders only when price/selection props change.
 */

import React from 'react'
import type { MenuItemSizeVariant } from '@/lib/queries/home'
import { formatPKR } from '@/lib/utils/formatCurrency'

interface ItemDetailPricingProps {
  hasDiscount: boolean
  basePrice: number
  discountPrice?: number | null
  displayedPrice: number
  hasVariants: boolean
  variants: MenuItemSizeVariant[]
  selectedSize: MenuItemSizeVariant | null
  onSelectSize: (variant: MenuItemSizeVariant) => void
  hasCookingOptions: boolean
  cookingOptions: string[]
  selectedCookingPreference: string
  onSelectCookingPreference: (preference: string) => void
}

function formatPrice(price: number) {
  return `Rs. ${Math.round(price)}`
}

function chipClass(isSelected: boolean, weight = 'font-bold') {
  return `rounded-full border px-4 py-2 text-sm ${weight} transition active:scale-95 ${
    isSelected
      ? 'border-muncherz-red bg-muncherz-red text-white'
      : 'border-gray-200 bg-muncherz-white text-muncherz-black'
  }`
}

export const ItemDetailPricing = React.memo(function ItemDetailPricing({
  hasDiscount,
  basePrice,
  discountPrice,
  displayedPrice,
  hasVariants,
  variants,
  selectedSize,
  onSelectSize,
  hasCookingOptions,
  cookingOptions,
  selectedCookingPreference,
  onSelectCookingPreference,
}: ItemDetailPricingProps) {
  return (
    <>
      <div className="flex items-end gap-2">
        {hasDiscount && (
          <span className="pb-0.5 text-sm font-bold text-gray-400 line-through">
            {formatPKR(discountPrice ?? basePrice)}
          </span>
        )}
        <span className="text-3xl font-black text-muncherz-red">
          {formatPKR(displayedPrice)}
        </span>
      </div>

      {hasVariants && (
        <section aria-label="Size options">
          <h3 className="text-sm font-extrabold text-muncherz-black">Choose size</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {variants.map((variant) => {
              const isSelected = selectedSize?.label === variant.label
              return (
                <button
                  key={`${variant.label}-${variant.price}`}
                  type="button"
                  onClick={() => onSelectSize(variant)}
                  className={chipClass(isSelected, 'font-extrabold')}
                >
                  {variant.label} — {formatPKR(variant.price)}
                </button>
              )
            })}
          </div>
        </section>
      )}

      {hasCookingOptions && (
        <section aria-label="Cooking preference">
          <h3 className="text-sm font-extrabold text-muncherz-black">Cooking preference</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {cookingOptions.map((option) => {
              const isSelected = selectedCookingPreference === option
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onSelectCookingPreference(option)}
                  className={chipClass(isSelected)}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </section>
      )}
    </>
  )
})
