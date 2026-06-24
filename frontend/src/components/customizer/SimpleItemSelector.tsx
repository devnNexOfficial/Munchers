'use client'

/**
 * COMPONENT: SimpleItemSelector
 * PURPOSE:   Canvas replacement for simple items (fries, drinks, sides).
 *            Shows size and flavor selectors without an animated ingredient canvas.
 *            Used when menu_items.canvas_type = 'simple'.
 * DEPENDENCIES: useCustomizerStore (selections, setItemQuantity, calculateSubtotal)
 * SIDE EFFECTS: None — calls setItemQuantity on selection changes.
 * PERFORMANCE:
 *   - React.memo: re-renders only when ingredients prop changes
 *   - sizeOptions is memoized — only recomputes when ingredients change
 *   - flavorOptions is memoized — same dependency
 *   - livePrice re-runs calculateSubtotal on each render (store reads are cheap)
 *
 * LISKOV SUBSTITUTION: Works with ANY ingredient array — not coupled to burger logic.
 */

import React, { useMemo, useState } from 'react'

import { Minus, Plus } from 'lucide-react'

import type { CustomizerIngredient as Ingredient } from '@/lib/layerConfig'
import { useCustomizerStore } from '@/store/useCustomizerStore'
import { formatPKR } from '@/lib/utils/formatCurrency'

interface SimpleItemSelectorProps {
  ingredients: Ingredient[]
}

interface SelectorOption {
  label: string
  ingredient: Ingredient | null
}

/** Fallback size options when no S/M/L-named ingredients exist in the DB */
const FALLBACK_SIZES: SelectorOption[] = [
  { label: 'S', ingredient: null },
  { label: 'M', ingredient: null },
  { label: 'L', ingredient: null },
]

/**
 * Pill button class — active state uses brand colors, inactive uses neutral.
 * Extracted as a function to avoid duplication between size and flavor pills.
 */
function pillClass(isActive: boolean): string {
  return `rounded-full border px-4 py-2 text-sm font-black transition active:scale-95 ${
    isActive
      ? 'border-muncherz-red bg-muncherz-red text-white'
      : 'border-gray-200 bg-muncherz-white text-muncherz-black'
  }`
}

/**
 * Maps the ingredient list to S/M/L options.
 * Looks for ingredients whose names match 'S', 'M', 'L' (case-insensitive).
 * Falls back to FALLBACK_SIZES if none match.
 * PRIVATE: used only within SimpleItemSelector.
 */
function buildSizeOptions(ingredients: Ingredient[]): SelectorOption[] {
  const sizes = ['S', 'M', 'L']
  const mapped = sizes.map<SelectorOption>((label) => ({
    label,
    ingredient:
      ingredients.find(
        (ingredient) => ingredient.name.toLowerCase() === label.toLowerCase()
      ) ?? null,
  }))

  return mapped.some((option) => option.ingredient) ? mapped : FALLBACK_SIZES
}

export const SimpleItemSelector = React.memo(function SimpleItemSelector({
  ingredients,
}: SimpleItemSelectorProps) {
  const selections = useCustomizerStore((state) => state.selections)
  const setItemQuantity = useCustomizerStore((state) => state.setItemQuantity)
  const calculateSubtotal = useCustomizerStore((state) => state.calculateSubtotal)

  const [selectedSize, setSelectedSize] = useState('M')
  const [itemQuantity, setItemQuantity_] = useState(1)

  /**
   * Size options — memoized: only recompute when ingredients reference changes.
   * Map for size: O(n) once, then O(1) lookups.
   */
  const sizeOptions = useMemo(() => buildSizeOptions(ingredients), [ingredients])

  /**
   * Flavor options (sauces and toppings) — memoized: single-pass filter.
   */
  const flavorOptions = useMemo(
    () =>
      ingredients.filter(
        (ingredient) =>
          ingredient.category === 'topping' || ingredient.category === 'sauce'
      ),
    [ingredients]
  )

  // Live price estimate — recalculates on each render (store reads are O(n) but fast)
  const livePrice = calculateSubtotal(0, ingredients) * itemQuantity

  /** Selects a size: deselects all other size options first (only one size at a time) */
  function selectSize(option: SelectorOption): void {
    setSelectedSize(option.label)
    sizeOptions.forEach((sizeOption) => {
      if (sizeOption.ingredient) {
        setItemQuantity(sizeOption.ingredient.id, 0, false)
      }
    })
    if (option.ingredient) {
      setItemQuantity(option.ingredient.id, 1, option.ingredient.isCore)
    }
  }

  /** Selects a flavor: deselects all other flavors first (only one flavor at a time) */
  function selectFlavor(selectedIngredient: Ingredient): void {
    flavorOptions.forEach((option) => {
      setItemQuantity(option.id, option.id === selectedIngredient.id ? 1 : 0, false)
    })
  }

  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl">
      <div className="space-y-5">
        {/* Size selector */}
        <section aria-label="Size">
          <h2 className="text-sm font-black text-muncherz-black">Choose Size</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizeOptions.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => selectSize(option)}
                className={pillClass(selectedSize === option.label)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        {/* Flavor selector — only shown if flavor options exist for this item */}
        {flavorOptions.length > 0 && (
          <section aria-label="Flavor">
            <h2 className="text-sm font-black text-muncherz-black">Choose Flavor</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {flavorOptions.map((ingredient) => (
                <button
                  key={ingredient.id}
                  type="button"
                  onClick={() => selectFlavor(ingredient)}
                  className={pillClass((selections[ingredient.id]?.qty ?? 0) > 0)}
                >
                  {ingredient.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Quantity + live price */}
        <section aria-label="Quantity" className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-muncherz-black">Quantity</h2>
            <p className="text-2xl font-black text-muncherz-red">{formatPKR(livePrice)}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setItemQuantity_((current) => Math.max(1, current - 1))}
              aria-label="Decrease quantity"
              className="grid h-10 w-10 place-items-center rounded-full border border-gray-200"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="w-8 text-center text-lg font-black">{itemQuantity}</span>
            <button
              type="button"
              onClick={() => setItemQuantity_((current) => current + 1)}
              aria-label="Increase quantity"
              className="grid h-10 w-10 place-items-center rounded-full bg-muncherz-red text-white"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      </div>
    </div>
  )
})
