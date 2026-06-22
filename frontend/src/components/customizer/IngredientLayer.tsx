'use client'

import Image from 'next/image'

import { motion } from 'framer-motion'

import { getLayerConfig } from '@/lib/layerConfig'
import type { CustomizerIngredient } from '@/lib/layerConfig'

interface IngredientLayerProps {
  ingredient: CustomizerIngredient
}

export function IngredientLayer({ ingredient }: IngredientLayerProps) {
  const layerConfig = getLayerConfig(ingredient)

  return (
    <motion.div
      className="absolute left-1/2 flex -translate-x-1/2 justify-center"
      data-ingredient-id={ingredient.id}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={{
        top: layerConfig.yPosition,
        width: layerConfig.widthRatio,
        zIndex: layerConfig.zIndex,
        willChange: 'transform',
      }}
    >
      <Image
        src={ingredient.pngImageUrl}
        alt={ingredient.name}
        width={900}
        height={520}
        className="pointer-events-none h-auto w-full select-none object-contain"
      />
    </motion.div>
  )
}
