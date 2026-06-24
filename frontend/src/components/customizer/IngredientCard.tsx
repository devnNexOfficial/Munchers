'use client'

/**
 * COMPONENT: IngredientCard
 * PURPOSE:   Displays one ingredient in the left panel with its image, name,
 *            price, and interaction controls (+/-, tier selector for toppings).
 * DEPENDENCIES: LimitBar, next/image, Framer Motion, lucide-react icons
 * SIDE EFFECTS: None — calls onAdd/onRemove callbacks provided by parent.
 * PERFORMANCE:
 *   - React.memo: prevents re-render unless ingredient data, qty, or disabled state changes
 *   - useCallback on onAdd/onRemove (applied in IngredientPanel) keeps these stable
 *   - AnimatePresence wraps controls for smooth show/hide transitions
 *
 * INTERFACE SEGREGATION: Only receives exactly what this card needs — no full
 *   store object, no raw supabase client, no extraneous props.
 */

import React, { useState } from 'react'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, X } from 'lucide-react'

import type { CustomizerIngredient } from '@/lib/layerConfig'
import { formatPKR } from '@/lib/utils/formatCurrency'

import { LimitBar } from './LimitBar'

interface IngredientCardProps {
  ingredient: CustomizerIngredient
  /** Current selected quantity (0 = not added) */
  currentQty: number
  /** Called when the user taps + or selects a tier. tier is only set for toppings. */
  onAdd: (tier?: 'low' | 'medium' | 'high') => void
  /** Called when the user taps - or the remove (×) badge */
  onRemove: () => void
  /** True when the ingredient is out of stock — all interactions are disabled */
  isDisabled: boolean
}

export const IngredientCard = React.memo(function IngredientCard({
  ingredient,
  currentQty,
  onAdd,
  onRemove,
  isDisabled,
}: IngredientCardProps) {
  // Controls are shown inline for core items; toggled by tapping for flexible ones
  const [showControls, setShowControls] = useState(false)
  const isMaxed = currentQty >= ingredient.maxLimit

  /**
   * Tapping the card:
   * - Core items: controls always visible (isCore handles this in renderControls)
   * - Topping items: show tier buttons (not a simple tap-to-add)
   * - Flexible items at qty 0: tap to add immediately
   * - Flexible items at qty > 0: toggle the +/- controls
   */
  function handleCardTap(): void {
    if (isDisabled) return
    if (ingredient.isCore || ingredient.category === 'topping') return

    if (currentQty === 0) {
      onAdd()
    } else {
      setShowControls((prev) => !prev)
    }
  }

  /**
   * Renders the appropriate controls for the ingredient category:
   * - Topping: 3-tier selector (Light / Regular / Extra)
   * - Core: always-visible +/- stepper
   * - Flexible: toggled +/- stepper (via showControls)
   */
  function renderControls(): React.ReactNode {
    // Toppings use the 3-tier quantity system (L/R/E) per ai-instructions spec
    if (ingredient.category === 'topping') {
      return (
        <div className="mt-2 flex w-full justify-between gap-1">
          {(['low', 'medium', 'high'] as const).map((tier) => (
            <button
              key={tier}
              disabled={isDisabled || isMaxed}
              onClick={(e) => {
                e.stopPropagation()
                onAdd(tier)
              }}
              className="flex-1 rounded-full bg-gray-100 py-1 text-[10px] font-bold uppercase text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-50"
            >
              {/* L = Light, R = Regular, E = Extra */}
              {tier === 'low' ? 'L' : tier === 'medium' ? 'R' : 'E'}
            </button>
          ))}
        </div>
      )
    }

    if (ingredient.isCore || showControls) {
      return (
        <div className="mt-2 flex w-full items-center justify-between rounded-full bg-gray-100 p-1">
          <button
            disabled={isDisabled || (ingredient.isCore && currentQty <= 1)}
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm disabled:opacity-50"
          >
            <Minus className="h-3 w-3 text-gray-700" />
          </button>
          <span className="text-xs font-bold text-gray-900">{currentQty}</span>
          <button
            disabled={isDisabled || isMaxed}
            onClick={(e) => {
              e.stopPropagation()
              onAdd()
            }}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-muncherz-red shadow-sm disabled:opacity-50"
          >
            <Plus className="h-3 w-3 text-white" />
          </button>
        </div>
      )
    }

    return null
  }

  return (
    <motion.div
      whileTap={isDisabled ? undefined : { scale: 0.95 }}
      onClick={handleCardTap}
      className={`relative flex flex-col items-center rounded-xl bg-white p-3 shadow-sm transition-shadow hover:shadow-md ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${currentQty > 0 ? 'ring-2 ring-muncherz-red' : 'ring-1 ring-gray-200'}`}
    >
      {/* Quantity badge — shown for flexible items when controls are hidden */}
      {currentQty > 0 && !ingredient.isCore && !showControls && ingredient.category !== 'topping' && (
        <div className="absolute -left-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-muncherz-red text-[10px] font-bold text-white shadow-sm">
          x{currentQty}
        </div>
      )}

      {/* Remove button — shown for flexible items when controls are hidden */}
      {currentQty > 0 && !ingredient.isCore && !showControls && ingredient.category !== 'topping' && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-600 shadow-sm hover:bg-gray-300"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Ingredient image */}
      <div className="relative mb-2 h-16 w-16">
        <Image
          src={ingredient.pngImageUrl || '/placeholder.png'}
          alt={ingredient.name}
          fill
          className="object-contain"
        />
      </div>

      <span className="text-center text-xs font-bold text-gray-800 line-clamp-1">
        {ingredient.name}
      </span>
      {/* Use formatPKR for consistent currency formatting across the app */}
      <span className="text-[10px] font-bold text-gray-500">
        + {formatPKR(ingredient.pricePerUnit)}
      </span>

      <div className="mt-auto w-full pt-2">
        <AnimatePresence mode="wait">
          {renderControls()}
        </AnimatePresence>
        <LimitBar current={currentQty} max={ingredient.maxLimit} />
      </div>
    </motion.div>
  )
})
