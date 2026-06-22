'use client'

import { useMemo } from 'react'

import { AnimatePresence } from 'framer-motion'

import type { CustomizerIngredient as Ingredient, IngredientSelection } from '@/lib/layerConfig'
import { getLayerConfig, getLayerRole } from '@/lib/layerConfig'
import { useCustomizerStore } from '@/store/useCustomizerStore'

import { IngredientLayer } from './IngredientLayer'

interface BurgerCanvasProps {
  ingredients: Ingredient[]
}

interface SelectedLayer {
  ingredient: Ingredient
  selection: IngredientSelection
  zIndex: number
  sortOrder: number
}

function compareLayers(firstLayer: SelectedLayer, secondLayer: SelectedLayer) {
  return firstLayer.sortOrder - secondLayer.sortOrder
}

function getCanvasSortOrder(ingredient: Ingredient) {
  const role = getLayerRole(ingredient)
  if (role === 'bottom_bun') return 1
  if (role === 'top_bun') return 10

  return getLayerConfig(ingredient).zIndex
}

export function BurgerCanvas({ ingredients }: BurgerCanvasProps) {
  const selections = useCustomizerStore((state) => state.selections)

  const selectedLayers = useMemo<SelectedLayer[]>(() => {
    return ingredients
      .reduce<SelectedLayer[]>((layers, ingredient) => {
        const selection = selections[ingredient.id]
        if (!selection || selection.qty <= 0) return layers

        layers.push({
          ingredient,
          selection,
          zIndex: getLayerConfig(ingredient).zIndex,
          sortOrder: getCanvasSortOrder(ingredient),
        })

        return layers
      }, [])
      .sort(compareLayers)
  }, [ingredients, selections])

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0A0A0A]">
      <AnimatePresence mode="popLayout">
        {selectedLayers.map(({ ingredient, selection, zIndex }) => (
          <div
            key={ingredient.id}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex, willChange: 'transform' }}
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
}
