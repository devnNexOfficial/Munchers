'use client'

import React, { useMemo } from 'react'

import { AnimatePresence } from 'framer-motion'

import type { CustomizerIngredient } from '@/lib/layerConfig'
import { useCustomizerStore } from '@/store/useCustomizerStore'

import { SummaryListItem } from './SummaryListItem'
import { SummaryTotals } from './SummaryTotals'

interface SummaryListProps {
  ingredients: CustomizerIngredient[]
  basePrice: number
  basePrepTime: number
  onAddToCart: () => void
  buttonText?: string
}

export const SummaryList = React.memo(function SummaryList({
  ingredients,
  basePrice,
  basePrepTime,
  onAddToCart,
  buttonText = 'Add to Cart',
}: SummaryListProps) {
  const { selections, calculateSubtotal, calculatePrepTime } = useCustomizerStore()
  const subtotal = calculateSubtotal(basePrice, ingredients)
  const prepTime = calculatePrepTime(basePrepTime, ingredients)

  const selectedItems = useMemo(
    () => ingredients.filter((ingredient) => selections[ingredient.id]?.qty > 0),
    [ingredients, selections]
  )

  const missingRequired = useMemo(
    () =>
      ingredients.filter(
        (ingredient) => ingredient.isRequired && !selections[ingredient.id]?.qty
      ),
    [ingredients, selections]
  )

  return (
    <div className="flex h-full flex-col bg-white p-6 shadow-xl">
      <h2 className="mb-4 text-xl font-black text-muncherz-black">Your Order</h2>

      <div className="flex-1 overflow-y-auto pr-2">
        <AnimatePresence mode="popLayout">
          {selectedItems.map((ingredient) => (
            <SummaryListItem
              key={ingredient.id}
              ingredient={ingredient}
              selection={selections[ingredient.id]}
            />
          ))}
        </AnimatePresence>

        {selectedItems.length === 0 && (
          <p className="mt-10 text-center text-sm text-gray-400">
            Nothing added yet — start building! ??
          </p>
        )}
      </div>

      <SummaryTotals
        prepTime={prepTime}
        subtotal={subtotal}
        missingRequired={missingRequired}
        buttonText={buttonText}
        onAddToCart={onAddToCart}
      />
    </div>
  )
})


