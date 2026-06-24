'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

import { getLayerConfig } from '@/lib/layerConfig'
import type { CustomizerIngredient } from '@/lib/layerConfig'

/**
 * COMPONENT: IngredientLayer
 * PURPOSE: Renders a single ingredient layer on the burger canvas at its
 *          configured position (yPosition, widthRatio, zIndex).
 * DEPENDENCIES: None (pure presentational)
 * PERFORMANCE: Uses willChange for GPU acceleration. Memoized by parent.
 */
interface IngredientLayerProps {
  ingredient: CustomizerIngredient
}

const FALLBACK_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 900 520%22%3E%3Crect width=%22900%22 height=%22520%22 fill=%22transparent%22/%3E%3C/svg%3E'

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
        src={ingredient.png_image_url ?? FALLBACK_IMAGE}
        alt={ingredient.name}
        width={900}
        height={520}
        className="pointer-events-none h-auto w-full select-none object-contain"
      />
    </motion.div>
  )
}
