'use client'

/**
 * COMPONENT: MealSelector
 * PURPOSE:   Bottom sheet modal that offers meal upgrade options (drink, fries, etc.)
 *            after the user adds an item to cart. User can pick options, adjust
 *            quantities, and confirm or skip.
 * DEPENDENCIES: MealOptionCard, Framer Motion, useMealSelector types
 * SIDE EFFECTS: None — calls onAddMeal/onSkip callbacks on completion.
 * PERFORMANCE:
 *   - selectedOptions is memoized — only recomputes when mealOptions or quantities change
 *   - selectedToArray is a single-pass O(n) reduce — no chained filter/map
 *   - React.memo: re-renders only when props change (isOpen flip, new mealOptions)
 */

import React, { useEffect, useMemo, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'

import type { MealOption, SelectedMealOption } from '@/hooks/useMealSelector'
import { formatPKR } from '@/lib/utils/formatCurrency'

import { MealOptionCard } from './MealOptionCard'

interface MealSelectorProps {
  isOpen: boolean
  onClose: () => void
  mealOptions: MealOption[]
  baseItemName: string
  onAddMeal: (selectedOptions: SelectedMealOption[]) => void
  onSkip: () => void
}

/**
 * Converts the quantities Record into a SelectedMealOption array for the parent.
 * Single-pass O(n) reduce — skips options with zero quantity.
 * PRIVATE: implementation detail; callers see only SelectedMealOption[].
 */
function selectedToArray(
  mealOptions: MealOption[],
  quantities: Record<string, number>
): SelectedMealOption[] {
  return mealOptions.reduce<SelectedMealOption[]>((selected, option) => {
    const quantity = quantities[option.id] ?? 0
    if (quantity <= 0) return selected

    selected.push({
      optionId: option.id,
      nameEn: option.nameEn,
      quantity,
      extraPrice: option.extraPrice,
    })
    return selected
  }, [])
}

export const MealSelector = React.memo(function MealSelector({
  isOpen,
  onClose,
  mealOptions,
  baseItemName,
  onAddMeal,
  onSkip,
}: MealSelectorProps) {
  // Per-option quantity map — reset when the modal closes
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  // Reset quantities when modal closes so next open starts fresh
  useEffect(() => {
    if (!isOpen) setQuantities({})
  }, [isOpen])

  /**
   * Derived selection array — memoized for performance.
   * Only recomputes when quantities or mealOptions reference changes.
   */
  const selectedOptions = useMemo(
    () => selectedToArray(mealOptions, quantities),
    [mealOptions, quantities]
  )

  // Single-pass total for the meal add-on cost
  const totalMealPrice = selectedOptions.reduce(
    (total, option) => total + option.quantity * option.extraPrice,
    0
  )

  /** Toggles a non-customizable option on/off (add once, then remove) */
  function toggleOption(option: MealOption): void {
    setQuantities((current) => ({
      ...current,
      [option.id]: current[option.id] ? 0 : 1,
    }))
  }

  /** Adjusts quantity for a customizable option by delta (+1 or -1) */
  function updateQuantity(option: MealOption, delta: number): void {
    setQuantities((current) => ({
      ...current,
      [option.id]: Math.max(0, (current[option.id] ?? 0) + delta),
    }))
  }

  function handleSkip(): void {
    onSkip()
    onClose()
  }

  function handleAddMeal(): void {
    onAddMeal(selectedOptions)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end bg-black/55 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // Tapping the backdrop skips (same as "No Thanks")
          onClick={handleSkip}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="meal-selector-title"
            className="max-h-[88svh] w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.26, ease: 'easeOut' }}
            // Stop backdrop click from bubbling into the sheet
            onClick={(event) => event.stopPropagation()}
          >
            <div className="max-h-[88svh] overflow-y-auto p-5">
              <div className="space-y-1">
                <h2
                  id="meal-selector-title"
                  className="text-2xl font-black text-muncherz-black"
                >
                  Make it a Meal? 🍟
                </h2>
                <p className="text-sm font-bold text-gray-500">{baseItemName}</p>
              </div>

              <div className="mt-5 space-y-3">
                {mealOptions.map((option) => {
                  const quantity = quantities[option.id] ?? 0
                  return (
                    <MealOptionCard
                      key={option.id}
                      option={option}
                      quantity={quantity}
                      onToggle={() => toggleOption(option)}
                      onUpdateQuantity={(delta) => updateQuantity(option, delta)}
                    />
                  )
                })}
              </div>

              {/* Meal total */}
              <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-sm font-black text-muncherz-black">Meal add-on</span>
                <span className="text-xl font-black text-muncherz-red">
                  {/* Show '+' prefix for add-on pricing clarity */}
                  +{formatPKR(totalMealPrice)}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="rounded-xl border border-muncherz-red bg-white px-4 py-3 text-sm font-black text-muncherz-red"
                >
                  No Thanks
                </button>
                <button
                  type="button"
                  onClick={handleAddMeal}
                  className="rounded-xl border border-muncherz-red bg-muncherz-red px-4 py-3 text-sm font-black text-white"
                >
                  Add Meal
                </button>
              </div>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
})
