'use client'

/**
 * COMPONENT: MealOptionCard
 * PURPOSE:   Displays a single meal add-on option with image, name, price,
 *            and an add/quantity control depending on whether it's customizable.
 * DEPENDENCIES: next/image, lucide-react icons
 * SIDE EFFECTS: None — calls onToggle/onUpdateQuantity callbacks.
 * PERFORMANCE: React.memo — stable as long as option data, quantity, and callbacks don't change.
 */

import React from 'react'

import Image from 'next/image'
import { Minus, Plus } from 'lucide-react'

import type { MealOption } from '@/hooks/useMealSelector'
import { formatPKR } from '@/lib/utils/formatCurrency'

interface MealOptionCardProps {
  option: MealOption
  /** Currently selected quantity (0 = not selected) */
  quantity: number
  /** Called when a non-customizable option is toggled on/off */
  onToggle: () => void
  /** Called when a customizable option's quantity is incremented/decremented (+1 or -1) */
  onUpdateQuantity: (delta: number) => void
}

/** Inline SVG placeholder — avoids a network request for missing meal option images */
const MEAL_OPTION_PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120"%3E%3Crect width="160" height="120" fill="%23FAFAFA"/%3E%3Ccircle cx="80" cy="60" r="34" fill="%23D62828" opacity=".9"/%3E%3C/svg%3E'

export const MealOptionCard = React.memo(function MealOptionCard({
  option,
  quantity,
  onToggle,
  onUpdateQuantity,
}: MealOptionCardProps) {
  return (
    <article className="rounded-lg border border-gray-100 p-3">
      <div className="flex items-center gap-3">
        {/* Meal option image */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muncherz-white">
          <Image
            src={option.imageUrl ?? MEAL_OPTION_PLACEHOLDER}
            alt={option.nameEn}
            fill
            sizes="64px"
            // Skip next/image optimization for inline SVG placeholders
            unoptimized={!option.imageUrl}
            className="object-cover"
          />
        </div>

        {/* Option name + price */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-black text-muncherz-black">{option.nameEn}</h3>
          <p className="text-xs font-black text-muncherz-red">
            {/* '+' prefix signals this is an add-on cost, not the item price */}
            +{formatPKR(option.extraPrice)}
          </p>
        </div>

        {/* Quantity control: stepper for customizable, toggle for fixed */}
        {option.isCustomizable ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onUpdateQuantity(-1)}
              aria-label={`Decrease ${option.nameEn} quantity`}
              className="grid h-8 w-8 place-items-center rounded-full border border-gray-200"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="w-5 text-center text-sm font-black">{quantity}</span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(1)}
              aria-label={`Increase ${option.nameEn} quantity`}
              className="grid h-8 w-8 place-items-center rounded-full bg-muncherz-red text-white"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={quantity > 0}
            className={`rounded-full border px-4 py-2 text-xs font-black transition ${
              quantity > 0
                ? 'border-muncherz-red bg-muncherz-red text-white'
                : 'border-gray-200 text-muncherz-black'
            }`}
          >
            {quantity > 0 ? 'Added ✓' : 'Add'}
          </button>
        )}
      </div>
    </article>
  )
})
