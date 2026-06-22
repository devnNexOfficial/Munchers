'use client'

import { useEffect } from 'react'

import Image from 'next/image'

import { AnimatePresence, motion, useSpring, useTransform } from 'framer-motion'

import type { Ingredient } from '@/components/customizer/BurgerCanvas'
import { useCustomizerStore } from '@/store/useCustomizerStore'

interface SummaryListProps {
  ingredients?: Ingredient[]
  basePrice?: number
  basePrepTime?: number
  onAddToCart?: () => void
}

function formatPkr(value: number) {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(value)
}

function AnimatedValue({
  value,
  formatter,
}: {
  value: number
  formatter: (value: number) => string
}) {
  const spring = useSpring(value, { stiffness: 120, damping: 20 })
  const displayValue = useTransform(spring, (latest) => formatter(Math.round(latest)))

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return <motion.span>{displayValue}</motion.span>
}

export default function SummaryList({
  ingredients = [],
  basePrice = 0,
  basePrepTime = 0,
  onAddToCart,
}: SummaryListProps) {
  const selections = useCustomizerStore((state) => state.selections)
  const calculateSubtotal = useCustomizerStore((state) => state.calculateSubtotal)
  const calculatePrepTime = useCustomizerStore((state) => state.calculatePrepTime)

  const selectedIngredients = ingredients
    .map((ingredient) => ({ ingredient, selection: selections[ingredient.id] }))
    .filter((item): item is { ingredient: Ingredient; selection: NonNullable<typeof item.selection> } =>
      Boolean(item.selection)
    )

  const subtotal = calculateSubtotal(basePrice, ingredients)
  const prepTime = calculatePrepTime(basePrepTime, ingredients)
  const missingRequired = ingredients.filter(
    (ingredient) => ingredient.isRequired && (selections[ingredient.id]?.qty ?? 0) <= 0
  )
  const isCartDisabled = missingRequired.length > 0

  return (
    <aside className="flex h-full w-full flex-col bg-white p-5 text-neutral-950">
      <h2 className="text-lg font-bold">Your Build</h2>

      <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {selectedIngredients.map(({ ingredient, selection }) => (
            <motion.div
              key={ingredient.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 16 }}
              className="grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-lg border border-neutral-100 p-2"
            >
              <div className="relative h-11 w-11 overflow-hidden rounded-md bg-neutral-100">
                <Image
                  src={ingredient.pngImageUrl}
                  alt={ingredient.name}
                  fill
                  sizes="44px"
                  className="object-contain p-1"
                  unoptimized
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{ingredient.name}</p>
                <p className="text-xs text-neutral-500">x{selection.qty}</p>
              </div>
              <p className="text-right text-sm font-bold">
                {formatPkr(selection.qty * ingredient.pricePerUnit)}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>

        {selectedIngredients.length === 0 ? (
          <p className="rounded-lg bg-neutral-50 p-4 text-sm text-neutral-500">
            Start with the required ingredients.
          </p>
        ) : null}
      </div>

      <div className="border-t border-neutral-200 pt-4">
        {isCartDisabled ? (
          <p className="mb-3 text-xs font-semibold text-muncherz-red">
            Missing: {missingRequired.map((ingredient) => ingredient.name).join(', ')}
          </p>
        ) : null}
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">Subtotal</span>
          <span className="font-bold">
            <AnimatedValue value={subtotal} formatter={formatPkr} />
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-neutral-500">Prep time</span>
          <span className="font-bold">
            <AnimatedValue value={prepTime} formatter={(value) => `${value}`} /> min
          </span>
        </div>
        <button
          type="button"
          disabled={isCartDisabled}
          onClick={onAddToCart}
          className="mt-4 w-full rounded-lg bg-muncherz-red px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          Add to Cart
        </button>
      </div>
    </aside>
  )
}
