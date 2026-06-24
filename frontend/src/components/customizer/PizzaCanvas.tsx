'use client'

import { useMemo } from 'react'
import Image from 'next/image'

import { AnimatePresence, motion } from 'framer-motion'

import type { CustomizerIngredient as Ingredient, IngredientSelection } from '@/lib/layerConfig'
import { useCustomizerStore } from '@/store/useCustomizerStore'

interface PizzaCanvasProps {
  ingredients: Ingredient[]
}

interface PizzaLayer {
  ingredient: Ingredient
  selection: IngredientSelection
  index: number
}

type IngredientTier = 'low' | 'medium' | 'high'

const tierByQuantity: Record<number, IngredientTier> = {
  1: 'low',
  2: 'medium',
  3: 'high',
}

function getTieredImage(ingredient: Ingredient, quantity: number, tier?: IngredientTier) {
  const activeTier = tier ?? tierByQuantity[Math.min(quantity, 3)]
  if (activeTier === 'low') return ingredient.pngQtyLow ?? ingredient.pngImageUrl
  if (activeTier === 'medium') return ingredient.pngQtyMedium ?? ingredient.pngImageUrl
  if (activeTier === 'high') return ingredient.pngQtyHigh ?? ingredient.pngImageUrl

  return ingredient.pngImageUrl
}

function getRadialPosition(index: number, total: number) {
  const angle = (index / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2
  const ring = index % 3
  const radius = 18 + ring * 12

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    rotate: (index * 37) % 360,
  }
}

export function PizzaCanvas({ ingredients }: PizzaCanvasProps) {
  const selections = useCustomizerStore((state) => state.selections)

  const layers = useMemo<PizzaLayer[]>(() => {
    return ingredients
      .reduce<PizzaLayer[]>((selected, ingredient) => {
        const selection = selections[ingredient.id]
        if (!selection || selection.qty <= 0) return selected

        selected.push({ ingredient, selection, index: selected.length })
        return selected
      }, [])
      .sort((first, second) => first.ingredient.sortOrder - second.ingredient.sortOrder)
  }, [ingredients, selections])

  const crust = layers.find(({ ingredient }) => ingredient.category === 'bun')
  const sauceLayers = layers.filter(({ ingredient }) => ingredient.category === 'sauce')
  const toppings = layers.filter(({ ingredient }) => ingredient.category === 'topping')

  return (
    <div className="relative aspect-square w-full overflow-hidden bg-muncherz-white p-8">
      <div className="absolute inset-[10%] rounded-full bg-[#C77933] shadow-[inset_0_0_0_14px_rgba(255,202,112,0.45)]" />

      {crust && (
        <Image
          src={crust.ingredient.pngImageUrl}
          alt={crust.ingredient.name}
          fill
          priority={crust.ingredient.isCore}
          sizes="(max-width: 768px) 90vw, 520px"
          className="object-contain p-8"
        />
      )}

      <div className="absolute inset-[19%] rounded-full bg-[#B82920]" />

      <AnimatePresence mode="popLayout">
        {sauceLayers.map(({ ingredient, selection }, index) => (
          <motion.div
            key={ingredient.id}
            className="absolute inset-[20%] rounded-full"
            initial={{ scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: Math.min(0.45 + selection.qty * 0.18, 0.85) }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            style={{
              backgroundColor: index % 2 === 0 ? 'rgba(190, 36, 26, 0.8)' : 'rgba(244, 176, 66, 0.35)',
              mixBlendMode: 'multiply',
            }}
          />
        ))}

        {toppings.map(({ ingredient, selection }, index) => {
          const position = getRadialPosition(index, toppings.length)
          return (
            <motion.div
              key={ingredient.id}
              className="absolute left-1/2 top-1/2 h-[28%] w-[28%]"
              initial={{ x: '-50%', y: '-50%', scale: 0.3, opacity: 0 }}
              animate={{
                x: `calc(-50% + ${position.x}%)`,
                y: `calc(-50% + ${position.y}%)`,
                scale: 1,
                opacity: 1,
                rotate: position.rotate,
              }}
              exit={{ x: '-50%', y: '-50%', scale: 0.4, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              style={{ zIndex: ingredient.zIndex }}
            >
              <Image
                src={getTieredImage(ingredient, selection.qty, selection.tier)}
                alt={ingredient.name}
                fill
                sizes="160px"
                className="object-contain"
              />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
