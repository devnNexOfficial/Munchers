'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { AnimatePresence } from 'framer-motion'

import { getLayerConfig, getLayerRole } from '@/lib/layerConfig'
import type { CustomizerIngredient } from '@/lib/layerConfig'
import { useCustomizerStore } from '@/store/useCustomizerStore'

import { IngredientLayer } from './IngredientLayer'

export type Ingredient = CustomizerIngredient

/**
 * COMPONENT: BurgerCanvas
 * PURPOSE: Renders a fixed-size container where ingredient layers stack
 *          vertically by z-index. The visual representation of the burger.
 * DEPENDENCIES: useCustomizerStore (selections)
 * SIDE EFFECTS: None
 * PERFORMANCE: useMemo for sorted layers — re-sorts only when selections change.
 * COMPOSITION: Built from <IngredientLayer /> components, one per ingredient.
 */
interface BurgerCanvasProps {
  ingredients: Ingredient[]
}

/**
 * Helper: determines if an ingredient should be rendered on the canvas.
 * Bottom/top buns are always present. Core and flexible items render
 * only when quantity > 0.
 * @returns boolean
 */
function isSelectedIngredient(
  ingredient: Ingredient,
  selections: Record<string, { qty: number }>
): boolean {
  const role = getLayerRole(ingredient)
  if (role === 'bottom_bun' || role === 'top_bun') {
    return true
  }
  return (selections[ingredient.id]?.qty ?? 0) > 0
}

export default function BurgerCanvas({ ingredients }: BurgerCanvasProps) {
  // Selective selector — only subscribes to selections, not the whole store
  const selections = useCustomizerStore((state) => state.selections)

  // Memoize: only re-sort when ingredients or selections change
  const sortedLayers = useMemo(() => {
    return ingredients
      .filter((ingredient) => isSelectedIngredient(ingredient, selections))
      .sort((left, right) => {
        const leftConfig = getLayerConfig(left)
        const rightConfig = getLayerConfig(right)
        // Stable sort: primary key = zIndex, tie-breaker = sort_order
        if (leftConfig.zIndex !== rightConfig.zIndex) {
          return leftConfig.zIndex - rightConfig.zIndex
        }
        return (left.sort_order ?? 0) - (right.sort_order ?? 0)
      })
  }, [ingredients, selections])

  return (
    <div className="w-full">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0A0A0A]">
        <AnimatePresence mode="popLayout">
          {sortedLayers.map((ingredient) => (
            <IngredientLayer key={ingredient.id} ingredient={ingredient} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
