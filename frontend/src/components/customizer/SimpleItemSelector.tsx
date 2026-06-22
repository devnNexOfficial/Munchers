'use client'

import { useMemo, useState } from 'react'

import { Minus, Plus } from 'lucide-react'

import type { CustomizerIngredient as Ingredient } from '@/lib/layerConfig'
import { useCustomizerStore } from '@/store/useCustomizerStore'

interface SimpleItemSelectorProps {
  ingredients: Ingredient[]
}

interface SelectorOption {
  label: string
  ingredient: Ingredient | null
}

const fallbackSizes: SelectorOption[] = [
  { label: 'S', ingredient: null },
  { label: 'M', ingredient: null },
  { label: 'L', ingredient: null },
]

function formatPrice(price: number) {
  return `Rs. ${Math.round(price)}`
}

function pillClass(isActive: boolean) {
  return `rounded-full border px-4 py-2 text-sm font-black transition active:scale-95 ${
    isActive
      ? 'border-muncherz-red bg-muncherz-red text-white'
      : 'border-gray-200 bg-muncherz-white text-muncherz-black'
  }`
}

function buildSizeOptions(ingredients: Ingredient[]) {
  const sizes = ['S', 'M', 'L']
  const mapped = sizes.map<SelectorOption>((label) => ({
    label,
    ingredient:
      ingredients.find((ingredient) => ingredient.name.toLowerCase() === label.toLowerCase()) ??
      null,
  }))

  return mapped.some((option) => option.ingredient) ? mapped : fallbackSizes
}

export function SimpleItemSelector({ ingredients }: SimpleItemSelectorProps) {
  const selections = useCustomizerStore((state) => state.selections)
  const setItemQuantity = useCustomizerStore((state) => state.setItemQuantity)
  const calculateSubtotal = useCustomizerStore((state) => state.calculateSubtotal)
  const [selectedSize, setSelectedSize] = useState('M')
  const [itemQuantity, setItemQuantityCount] = useState(1)

  const sizeOptions = useMemo(() => buildSizeOptions(ingredients), [ingredients])
  const flavorOptions = useMemo(() => {
    return ingredients.filter((ingredient) => ingredient.category === 'topping' || ingredient.category === 'sauce')
  }, [ingredients])
  const livePrice = calculateSubtotal(0, ingredients) * itemQuantity

  function selectSize(option: SelectorOption) {
    setSelectedSize(option.label)
    sizeOptions.forEach((sizeOption) => {
      if (sizeOption.ingredient) setItemQuantity(sizeOption.ingredient.id, 0, false)
    })
    if (option.ingredient) setItemQuantity(option.ingredient.id, 1, option.ingredient.isCore)
  }

  function setFlavor(ingredient: Ingredient) {
    flavorOptions.forEach((option) => setItemQuantity(option.id, option.id === ingredient.id ? 1 : 0, false))
  }

  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl">
      <div className="space-y-5">
        <section aria-label="Size">
          <h2 className="text-sm font-black text-muncherz-black">Size</h2>
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

        {flavorOptions.length > 0 && (
          <section aria-label="Flavor">
            <h2 className="text-sm font-black text-muncherz-black">Flavor</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {flavorOptions.map((ingredient) => (
                <button
                  key={ingredient.id}
                  type="button"
                  onClick={() => setFlavor(ingredient)}
                  className={pillClass((selections[ingredient.id]?.qty ?? 0) > 0)}
                >
                  {ingredient.name}
                </button>
              ))}
            </div>
          </section>
        )}

        <section aria-label="Quantity" className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-muncherz-black">Quantity</h2>
            <p className="text-2xl font-black text-muncherz-red">{formatPrice(livePrice)}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setItemQuantityCount((current) => Math.max(1, current - 1))}
              className="grid h-10 w-10 place-items-center rounded-full border border-gray-200"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="w-8 text-center text-lg font-black">{itemQuantity}</span>
            <button
              type="button"
              onClick={() => setItemQuantityCount((current) => current + 1)}
              className="grid h-10 w-10 place-items-center rounded-full bg-muncherz-red text-white"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
