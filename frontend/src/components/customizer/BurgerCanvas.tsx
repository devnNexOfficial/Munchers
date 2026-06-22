'use client'

import { useMemo } from 'react'

import { AnimatePresence } from 'framer-motion'

import { getLayerConfig, getLayerRole } from '@/lib/layerConfig'
import type { CustomizerIngredient } from '@/lib/layerConfig'
import { useCustomizerStore } from '@/store/useCustomizerStore'

import { IngredientLayer } from './IngredientLayer'

export type Ingredient = CustomizerIngredient

interface BurgerCanvasProps {
  ingredients: Ingredient[]
}

function isSelectedIngredient(
  ingredient: Ingredient,
  selections: ReturnType<typeof useCustomizerStore.getState>['selections']
) {
  const role = getLayerRole(ingredient)

  if (role === 'bottom_bun' || role === 'top_bun') {
    return true
  }

  return (selections[ingredient.id]?.qty ?? 0) > 0
}

export default function BurgerCanvas({ ingredients }: BurgerCanvasProps) {
  const selections = useCustomizerStore((state) => state.selections)

  const sortedLayers = useMemo(() => {
    return ingredients
      .filter((ingredient) => isSelectedIngredient(ingredient, selections))
      .sort((left, right) => {
        const leftConfig = getLayerConfig(left)
        const rightConfig = getLayerConfig(right)

        if (leftConfig.zIndex !== rightConfig.zIndex) {
          return leftConfig.zIndex - rightConfig.zIndex
        }

        return left.sortOrder - right.sortOrder
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
