'use client'

/**
 * COMPONENT: IngredientLayer
 * PURPOSE:   Renders a single ingredient image positioned on the canvas at the
 *            coordinates defined in the DB (yPosition, widthRatio, zIndex).
 *            Handles the sauce double-opacity blending and topping tier image swap.
 * DEPENDENCIES: next/image, Framer Motion, layerConfig utilities
 * SIDE EFFECTS: None — display only.
 * PERFORMANCE:
 *   - React.memo: stable re-renders only when ingredient, quantity, or tier change
 *   - priority={ingredient.isCore}: core layers (bun, patty) load eagerly;
 *     flexible layers (sauce, topping) are lazy-loaded
 *   - imageCopies: sauce blending via opacity stack (max 2 copies) — no real image duplication
 *
 * LISKOV SUBSTITUTION: IngredientLayer works correctly with ANY valid Ingredient —
 *   burger patty, pizza topping, or roll sauce — without checking category in the
 *   render logic. Category-specific behaviour (topping tier, sauce blending) is
 *   handled via pure functions getIngredientPng() and imageCopies calculation.
 */

import React from 'react'

import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'

import type { CustomizerIngredient as Ingredient } from '@/lib/layerConfig'
import { getLayerConfig } from '@/lib/layerConfig'

type IngredientTier = 'low' | 'medium' | 'high'

interface IngredientLayerProps {
  ingredient: Ingredient
  quantity: number
  tier?: IngredientTier
}

/** Spring animation config — shared constant avoids object recreation on every render */
const LAYER_TRANSITION = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
} as const

/**
 * Returns the correct PNG URL for the ingredient based on category and tier.
 * Toppings use quantity-tier images (low/medium/high) for visual variety.
 * All other categories always use the base pngImageUrl.
 * PRIVATE: callers interact via the IngredientLayer props, not this function.
 */
function getIngredientPng(ingredient: Ingredient, tier?: IngredientTier): string {
  // Non-toppings always use the base image — tier is irrelevant for them
  if (ingredient.category !== 'topping') return ingredient.pngImageUrl

  // Toppings: use the tier-specific image, fall back to base if not set in DB
  if (tier === 'low') return ingredient.pngQtyLow ?? ingredient.pngImageUrl
  if (tier === 'medium') return ingredient.pngQtyMedium ?? ingredient.pngImageUrl
  if (tier === 'high') return ingredient.pngQtyHigh ?? ingredient.pngImageUrl

  return ingredient.pngImageUrl
}

export const IngredientLayer = React.memo(function IngredientLayer({
  ingredient,
  quantity,
  tier,
}: IngredientLayerProps) {
  const imageUrl = getIngredientPng(ingredient, tier)
  const layerConfig = getLayerConfig(ingredient)

  /**
   * Sauce blending: same sauce tapped twice renders two overlapping copies
   * at zero offset with the second at 0.7 opacity — creates a "thicker" visual.
   * See ai-instructions.md Section 7 for the exact spec.
   */
  const imageCopies = ingredient.category === 'sauce' && quantity >= 2 ? [1, 2] : [1]

  return (
    <AnimatePresence mode="popLayout">
      {quantity > 0 && (
        <motion.div
          key={ingredient.id}
          layoutId={ingredient.id}
          initial={{ x: -200, opacity: 0, scale: 0.6 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={LAYER_TRANSITION}
          className="absolute left-0 right-0 mx-auto"
          style={{
            top: layerConfig.yPosition,
            width: layerConfig.widthRatio,
            zIndex: layerConfig.zIndex,
          }}
        >
          <div className="relative aspect-[5/2] w-full">
            {imageCopies.map((copyNumber) => (
              <Image
                key={`${ingredient.id}-${copyNumber}`}
                src={imageUrl}
                alt={ingredient.name}
                fill
                sizes="(max-width: 768px) 80vw, 420px"
                className="object-contain"
                // Second sauce copy at 0.7 opacity simulates extra sauce thickness
                style={{ opacity: copyNumber === 2 ? 0.7 : 1 }}
                // Core layers (bun, patty) load eagerly; others lazy
                priority={ingredient.isCore}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})
