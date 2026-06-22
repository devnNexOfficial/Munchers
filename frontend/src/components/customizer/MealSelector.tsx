'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'

import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'

import type { MealOption, SelectedMealOption } from '@/hooks/useMealSelector'

interface MealSelectorProps {
  isOpen: boolean
  onClose: () => void
  mealOptions: MealOption[]
  baseItemName: string
  onAddMeal: (selectedOptions: SelectedMealOption[]) => void
  onSkip: () => void
}

const placeholder =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120"%3E%3Crect width="160" height="120" fill="%23FAFAFA"/%3E%3Ccircle cx="80" cy="60" r="34" fill="%23D62828" opacity=".9"/%3E%3C/svg%3E'

function formatPrice(price: number) {
  return `+PKR ${Math.round(price)}`
}

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

export function MealSelector({
  isOpen,
  onClose,
  mealOptions,
  baseItemName,
  onAddMeal,
  onSkip,
}: MealSelectorProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!isOpen) setQuantities({})
  }, [isOpen])

  const selectedOptions = useMemo(
    () => selectedToArray(mealOptions, quantities),
    [mealOptions, quantities]
  )
  const totalMealPrice = selectedOptions.reduce(
    (total, option) => total + option.quantity * option.extraPrice,
    0
  )

  function toggleOption(option: MealOption) {
    setQuantities((current) => ({
      ...current,
      [option.id]: current[option.id] ? 0 : 1,
    }))
  }

  function updateQuantity(option: MealOption, delta: number) {
    setQuantities((current) => ({
      ...current,
      [option.id]: Math.max(0, (current[option.id] ?? 0) + delta),
    }))
  }

  function handleSkip() {
    onSkip()
    onClose()
  }

  function handleAddMeal() {
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
            onClick={(event) => event.stopPropagation()}
          >
            <div className="max-h-[88svh] overflow-y-auto p-5">
              <div className="space-y-1">
                <h2 id="meal-selector-title" className="text-2xl font-black text-muncherz-black">
                  Make it a Meal?
                </h2>
                <p className="text-sm font-bold text-gray-500">{baseItemName}</p>
              </div>

              <div className="mt-5 space-y-3">
                {mealOptions.map((option) => {
                  const quantity = quantities[option.id] ?? 0
                  return (
                    <article key={option.id} className="rounded-lg border border-gray-100 p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muncherz-white">
                          <Image
                            src={option.imageUrl ?? placeholder}
                            alt={option.nameEn}
                            fill
                            sizes="64px"
                            unoptimized={!option.imageUrl}
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-black text-muncherz-black">
                            {option.nameEn}
                          </h3>
                          <p className="text-xs font-black text-muncherz-red">
                            {formatPrice(option.extraPrice)}
                          </p>
                        </div>
                        {option.isCustomizable ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(option, -1)}
                              className="grid h-8 w-8 place-items-center rounded-full border border-gray-200"
                            >
                              <Minus className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <span className="w-5 text-center text-sm font-black">{quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(option, 1)}
                              className="grid h-8 w-8 place-items-center rounded-full bg-muncherz-red text-white"
                            >
                              <Plus className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleOption(option)}
                            className={`rounded-full border px-4 py-2 text-xs font-black ${
                              quantity > 0
                                ? 'border-muncherz-red bg-muncherz-red text-white'
                                : 'border-gray-200 text-muncherz-black'
                            }`}
                          >
                            {quantity > 0 ? 'Selected' : 'Add'}
                          </button>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-sm font-black text-muncherz-black">Meal add-on</span>
                <span className="text-xl font-black text-muncherz-red">
                  {formatPrice(totalMealPrice)}
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
}
