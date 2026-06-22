'use client'

import { useState } from 'react'

import Image from 'next/image'

import { motion } from 'framer-motion'

import type { Ingredient } from '@/components/customizer/BurgerCanvas'
import { useCustomizerStore } from '@/store/useCustomizerStore'

import LimitBar from './LimitBar'

interface IngredientCardProps {
  ingredient: Ingredient
  currentQty: number
  onAdd: () => void
  onRemove: () => void
  isDisabled: boolean
}

const toppingTiers = [
  { label: 'Light', qty: 1 },
  { label: 'Regular', qty: 2 },
  { label: 'Extra', qty: 3 },
] as const

export default function IngredientCard({
  ingredient,
  currentQty,
  onAdd,
  onRemove,
  isDisabled,
}: IngredientCardProps) {
  const [showControls, setShowControls] = useState(false)
  const setItemQuantity = useCustomizerStore((state) => state.setItemQuantity)
  const isAtLimit = currentQty >= ingredient.maxLimit
  const isTopping = ingredient.category === 'topping'
  const canRemove = !ingredient.isCore || currentQty > 1

  function handleCardTap() {
    if (isDisabled) return

    if (ingredient.isCore || isTopping) {
      return
    }

    if (currentQty <= 0) {
      onAdd()
      return
    }

    setShowControls(true)
  }

  function handleRemove() {
    if (isDisabled) return
    onRemove()
  }

  return (
    <motion.article
      whileTap={{ scale: 0.95 }}
      onClick={handleCardTap}
      className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/5"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
        <Image
          src={ingredient.pngImageUrl}
          alt={ingredient.name}
          fill
          sizes="128px"
          className="object-contain p-2"
          unoptimized
        />
        {currentQty > 0 ? (
          <span className="absolute right-2 top-2 rounded-full bg-muncherz-red px-2 py-0.5 text-xs font-bold text-white">
            x{currentQty}
          </span>
        ) : null}
      </div>

      <h3 className="mt-3 min-h-10 text-center text-sm font-semibold leading-tight text-neutral-950">
        {ingredient.name}
      </h3>

      <div className="mt-3 space-y-3">
        {isTopping ? (
          <div className="grid grid-cols-3 gap-1">
            {toppingTiers.map((tier) => {
              const tierQty = Math.min(tier.qty, ingredient.maxLimit)
              const isActive = currentQty === tierQty

              return (
                <button
                  key={tier.label}
                  type="button"
                  disabled={isDisabled}
                  onClick={(event) => {
                    event.stopPropagation()
                    setItemQuantity(ingredient.id, tierQty, ingredient.isCore)
                  }}
                  className={`rounded-full px-2 py-1 text-[11px] font-bold transition ${
                    isActive
                      ? 'bg-muncherz-red text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {tier.label}
                </button>
              )
            })}
          </div>
        ) : ingredient.isCore || showControls ? (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={isDisabled || !canRemove}
              onClick={(event) => {
                event.stopPropagation()
                handleRemove()
              }}
              className="grid h-8 w-8 place-items-center rounded-full bg-neutral-100 text-lg font-bold text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Remove ${ingredient.name}`}
            >
              -
            </button>
            <span className="w-8 text-center text-sm font-bold tabular-nums">{currentQty}</span>
            <button
              type="button"
              disabled={isDisabled || isAtLimit}
              onClick={(event) => {
                event.stopPropagation()
                onAdd()
              }}
              className="grid h-8 w-8 place-items-center rounded-full bg-muncherz-red text-lg font-bold text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
              aria-label={`Add ${ingredient.name}`}
            >
              +
            </button>
          </div>
        ) : currentQty > 0 ? (
          <button
            type="button"
            disabled={isDisabled}
            onClick={(event) => {
              event.stopPropagation()
              handleRemove()
            }}
            className="w-full rounded-full bg-neutral-100 px-3 py-2 text-xs font-bold text-neutral-800 disabled:opacity-50"
          >
            Remove
          </button>
        ) : null}

        <LimitBar current={currentQty} max={ingredient.maxLimit} />
      </div>
    </motion.article>
  )
}
