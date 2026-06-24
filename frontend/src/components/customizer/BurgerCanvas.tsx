'use client'

/**
 * COMPONENT: BurgerCanvas
 * PURPOSE:   Renders the live 2.5D burger stack on the black customizer canvas.
 *            Each selected ingredient appears as a positioned image layer,
 *            sorted by z-index and animated in/out with Framer Motion.
 * DEPENDENCIES: useCustomizerStore (selections only), IngredientLayer, layerConfig
 * SIDE EFFECTS: None — purely reactive to Zustand state.
 * PERFORMANCE:
 *   - React.memo: re-renders only when `ingredients` prop changes reference
 *   - useCustomizerStore selector: subscribes to `selections` only — avoids
 *     re-renders on alertMessage or other store slices changing
 *   - selectedLayers is memoized: only recomputed when ingredients or selections change
 *   - Sort is stable: tie-breaker by ingredient.id ensures deterministic order
 *   - willChange: 'transform' on layer wrappers hints GPU compositing to browser
 *
 * DEPENDENCY INVERSION: BurgerCanvas receives `ingredients` as props from the parent
 *   (CustomizerPageClient). It does NOT own the store connection for ingredient data —
 *   only reads the current selections. This makes BurgerCanvas testable in isolation.
 */

import React, { useMemo } from 'react'

import { AnimatePresence } from 'framer-motion'

import type { CustomizerIngredient as Ingredient, IngredientSelection } from '@/lib/layerConfig'
import { getLayerConfig, getLayerRole } from '@/lib/layerConfig'
import { useCustomizerStore } from '@/store/useCustomizerStore'

import { IngredientLayer } from './IngredientLayer'

interface BurgerCanvasProps {
  /** Full ingredient list for the active menu item */
  ingredients: Ingredient[]
}

interface SelectedLayer {
  ingredient: Ingredient
  selection: IngredientSelection
  zIndex: number
  /** Used for stable sort order — buns get fixed positions, others by zIndex */
  sortOrder: number
}

/**
 * Determines the visual sort order for this ingredient on the canvas.
 * Bottom bun is always 1, top bun always 10, others use their DB zIndex.
 * PRIVATE: implementation detail of the canvas rendering logic.
 */
function getCanvasSortOrder(ingredient: Ingredient): number {
  const role = getLayerRole(ingredient)
  if (role === 'bottom_bun') return 1
  if (role === 'top_bun') return 10
  return getLayerConfig(ingredient).zIndex
}

/**
 * Stable comparator for layers.
 * Tie-breaker by ingredient.id ensures deterministic sort when two layers
 * have the same sortOrder (e.g., two toppings at the same z-index).
 */
function compareLayers(firstLayer: SelectedLayer, secondLayer: SelectedLayer): number {
  const primary = firstLayer.sortOrder - secondLayer.sortOrder
  // Stable tie-breaker: localeCompare for consistent ordering
  return primary !== 0 ? primary : firstLayer.ingredient.id.localeCompare(secondLayer.ingredient.id)
}

export const BurgerCanvas = React.memo(function BurgerCanvas({ ingredients }: BurgerCanvasProps) {
  // Subscribe to selections only — avoids re-render on alertMessage changes
  const selections = useCustomizerStore((state) => state.selections)

  /**
   * Build and sort the list of layers to render.
   * MEMOIZED: only recomputed when ingredients or selections change.
   * Single-pass reduce: filter + map + push in one O(n) pass (no chained array methods).
   */
  const selectedLayers = useMemo<SelectedLayer[]>(() => {
    return ingredients
      .reduce<SelectedLayer[]>((layers, ingredient) => {
        const selection = selections[ingredient.id]
        // Skip ingredients with no selection or zero quantity
        if (!selection || selection.qty <= 0) return layers

        layers.push({
          ingredient,
          selection,
          zIndex: getLayerConfig(ingredient).zIndex,
          sortOrder: getCanvasSortOrder(ingredient),
        })

        return layers
      }, [])
      // Stable sort: primary by sortOrder, tie-breaker by id
      .sort(compareLayers)
  }, [ingredients, selections])

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-muncherz-white">
      <AnimatePresence mode="popLayout">
        {selectedLayers.map(({ ingredient, selection, zIndex }) => (
          <div
            key={ingredient.id}
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex,
              // willChange: GPU compositing hint — critical for 60fps on mid-range Android
              willChange: 'transform',
            }}
          >
            <IngredientLayer
              ingredient={ingredient}
              quantity={selection.qty}
              tier={selection.tier}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
})
