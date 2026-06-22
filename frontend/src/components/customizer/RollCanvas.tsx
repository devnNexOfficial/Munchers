'use client'

import { useMemo } from 'react'
import Image from 'next/image'

import { AnimatePresence, motion } from 'framer-motion'

import type { CustomizerIngredient as Ingredient, IngredientSelection } from '@/lib/layerConfig'
import { useCustomizerStore } from '@/store/useCustomizerStore'

interface RollCanvasProps {
  ingredients: Ingredient[]
}

interface RollLayer {
  ingredient: Ingredient
  selection: IngredientSelection
}

type IngredientTier = 'low' | 'medium' | 'high'

function getLayerImage(ingredient: Ingredient, quantity: number, tier?: IngredientTier) {
  if (ingredient.category !== 'topping') return ingredient.pngImageUrl
  const activeTier = tier ?? (quantity === 1 ? 'low' : quantity === 2 ? 'medium' : 'high')

  if (activeTier === 'low') return ingredient.pngQtyLow ?? ingredient.pngImageUrl
  if (activeTier === 'medium') return ingredient.pngQtyMedium ?? ingredient.pngImageUrl
  return ingredient.pngQtyHigh ?? ingredient.pngImageUrl
}

export function RollCanvas({ ingredients }: RollCanvasProps) {
  const selections = useCustomizerStore((state) => state.selections)

  const layers = useMemo<RollLayer[]>(() => {
    return ingredients
      .reduce<RollLayer[]>((selected, ingredient) => {
        const selection = selections[ingredient.id]
        if (!selection || selection.qty <= 0) return selected

        selected.push({ ingredient, selection })
        return selected
      }, [])
      .sort((first, second) => first.ingredient.sortOrder - second.ingredient.sortOrder)
  }, [ingredients, selections])

  const wrap = layers.find(({ ingredient }) => ingredient.category === 'bun')
  const fillings = layers.filter(({ ingredient }) => ingredient.category !== 'bun')

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0A0A0A] p-8">
      <div className="absolute inset-x-[6%] top-[22%] h-[56%] rounded-[42%] bg-[#E9C88E] shadow-[inset_0_-18px_0_rgba(177,110,43,0.24)]" />

      {wrap && (
        <Image
          src={wrap.ingredient.pngImageUrl}
          alt={wrap.ingredient.name}
          fill
          priority={wrap.ingredient.isCore}
          sizes="(max-width: 768px) 90vw, 520px"
          className="object-contain p-6"
        />
      )}

      <AnimatePresence mode="popLayout">
        {fillings.map(({ ingredient, selection }, index) => {
          const leftOffset = 14 + index * (70 / Math.max(fillings.length, 1))
          const yOffset = index % 2 === 0 ? 34 : 43

          return (
            <motion.div
              key={ingredient.id}
              className="absolute h-[24%] w-[30%]"
              initial={{ x: -90, opacity: 0, scale: 0.7 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.75 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              style={{
                left: `${leftOffset}%`,
                top: `${yOffset}%`,
                zIndex: ingredient.zIndex,
              }}
            >
              <Image
                src={getLayerImage(ingredient, selection.qty, selection.tier)}
                alt={ingredient.name}
                fill
                sizes="180px"
                className="object-contain"
                style={{
                  opacity: ingredient.category === 'sauce' ? Math.min(0.55 + selection.qty * 0.15, 0.9) : 1,
                  mixBlendMode: ingredient.category === 'sauce' ? 'multiply' : 'normal',
                }}
              />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
