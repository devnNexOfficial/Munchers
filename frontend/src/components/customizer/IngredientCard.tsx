'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, X } from 'lucide-react'
import type { CustomizerIngredient } from '@/lib/layerConfig'
import { LimitBar } from './LimitBar'

interface IngredientCardProps {
  ingredient: CustomizerIngredient
  currentQty: number
  onAdd: (tier?: 'low' | 'medium' | 'high') => void
  onRemove: () => void
  isDisabled: boolean
}

export function IngredientCard({
  ingredient,
  currentQty,
  onAdd,
  onRemove,
  isDisabled,
}: IngredientCardProps) {
  const [showControls, setShowControls] = useState(false)
  const isMaxed = currentQty >= ingredient.maxLimit

  const handleCardTap = () => {
    if (isDisabled) return
    if (ingredient.isCore || ingredient.category === 'topping') return

    // Flexible ingredients logic
    if (currentQty === 0) {
      onAdd()
    } else {
      setShowControls((prev) => !prev)
    }
  }

  const renderControls = () => {
    if (ingredient.category === 'topping') {
      return (
        <div className="mt-2 flex w-full justify-between gap-1">
          {(['low', 'medium', 'high'] as const).map((tier) => (
            <button
              key={tier}
              disabled={isDisabled || isMaxed}
              onClick={(e) => {
                e.stopPropagation()
                onAdd(tier)
              }}
              className="flex-1 rounded-full bg-gray-100 py-1 text-[10px] font-bold uppercase text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-50"
            >
              {tier === 'low' ? 'L' : tier === 'medium' ? 'R' : 'E'}
            </button>
          ))}
        </div>
      )
    }

    if (ingredient.isCore || showControls) {
      return (
        <div className="mt-2 flex w-full items-center justify-between rounded-full bg-gray-100 p-1">
          <button
            disabled={isDisabled || (ingredient.isCore && currentQty <= 1)}
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm disabled:opacity-50"
          >
            <Minus className="h-3 w-3 text-gray-700" />
          </button>
          <span className="text-xs font-bold text-gray-900">{currentQty}</span>
          <button
            disabled={isDisabled || isMaxed}
            onClick={(e) => {
              e.stopPropagation()
              onAdd()
            }}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-muncherz-red shadow-sm disabled:opacity-50"
          >
            <Plus className="h-3 w-3 text-white" />
          </button>
        </div>
      )
    }

    return null
  }

  return (
    <motion.div
      whileTap={isDisabled ? undefined : { scale: 0.95 }}
      onClick={handleCardTap}
      className={`relative flex flex-col items-center rounded-xl bg-white p-3 shadow-sm transition-shadow hover:shadow-md ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${currentQty > 0 ? 'ring-2 ring-muncherz-red' : 'ring-1 ring-gray-200'}`}
    >
      {/* Active Badge for Flexible items not showing controls yet */}
      {currentQty > 0 && !ingredient.isCore && !showControls && ingredient.category !== 'topping' && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-600 shadow-sm hover:bg-gray-300"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {currentQty > 0 && !ingredient.isCore && !showControls && ingredient.category !== 'topping' && (
        <div className="absolute -left-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-muncherz-red text-[10px] font-bold text-white shadow-sm">
          x{currentQty}
        </div>
      )}

      <div className="relative mb-2 h-16 w-16">
        <Image
          src={ingredient.pngImageUrl || '/placeholder.png'}
          alt={ingredient.name}
          fill
          className="object-contain"
        />
      </div>

      <span className="text-center text-xs font-bold text-gray-800 line-clamp-1">
        {ingredient.name}
      </span>
      <span className="text-[10px] font-bold text-gray-500">
        + Rs. {ingredient.pricePerUnit}
      </span>

      <div className="mt-auto w-full pt-2">
        <AnimatePresence mode="wait">
          {renderControls()}
        </AnimatePresence>
        <LimitBar current={currentQty} max={ingredient.maxLimit} />
      </div>
    </motion.div>
  )
}
