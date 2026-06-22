'use client'

import Image from 'next/image'

import { AnimatePresence, motion } from 'framer-motion'

import type { CustomizerIngredient as Ingredient } from '@/lib/layerConfig'
import { getLayerConfig } from '@/lib/layerConfig'

type IngredientTier = 'low' | 'medium' | 'high'

interface IngredientLayerProps {
  ingredient: Ingredient
  quantity: number
  tier?: IngredientTier
}

const layerTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
} as const

function getIngredientPng(ingredient: Ingredient, tier?: IngredientTier) {
  if (ingredient.category !== 'topping') return ingredient.pngImageUrl

  if (tier === 'low') return ingredient.pngQtyLow ?? ingredient.pngImageUrl
  if (tier === 'medium') return ingredient.pngQtyMedium ?? ingredient.pngImageUrl
  if (tier === 'high') return ingredient.pngQtyHigh ?? ingredient.pngImageUrl

  return ingredient.pngImageUrl
}

export function IngredientLayer({ ingredient, quantity, tier }: IngredientLayerProps) {
  const imageUrl = getIngredientPng(ingredient, tier)
  const layerConfig = getLayerConfig(ingredient)
  const imageCopies = ingredient.category === 'sauce' && quantity >= 2 ? [1, 2] : [1]

  return (
    <AnimatePresence mode="popLayout">
      {quantity > 0 && (
        <motion.div
          key={ingredient.id}
          layoutId={ingredient.id}
          initial={{ x: -200, opacity: 0, scale: 0.6 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={layerTransition}
          className="absolute left-0 right-0 mx-auto"
          style={{
            top: layerConfig.yPosition,
            width: layerConfig.widthRatio,
            zIndex: layerConfig.zIndex,
          }}
        >
          <div className="relative aspect-[5/2] w-full">
            {imageCopies.map((copyNumber) => (
              <Image
                key={`${ingredient.id}-${copyNumber}`}
                src={imageUrl}
                alt={ingredient.name}
                fill
                sizes="(max-width: 768px) 80vw, 420px"
                className="object-contain"
                style={{ opacity: copyNumber === 2 ? 0.7 : 1 }}
                priority={ingredient.isCore}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
