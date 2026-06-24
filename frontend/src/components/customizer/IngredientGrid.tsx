import { AnimatePresence, motion } from 'framer-motion'

import type { CustomizerIngredient, IngredientSelection } from '@/lib/layerConfig'

import { IngredientCard } from './IngredientCard'

const SLIDE_VARIANTS = {
  enter: (dir: number) => ({
    x: dir > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir < 0 ? 100 : -100,
    opacity: 0,
  }),
} as const

interface IngredientGridProps {
  ingredients: CustomizerIngredient[]
  selections: Record<string, IngredientSelection>
  currentStep: number
  direction: number
  onDragEnd: (
    event: unknown,
    info: { offset: { x: number }; velocity: { x: number } }
  ) => void
  onAdd: (ingredient: CustomizerIngredient, tier?: 'low' | 'medium' | 'high') => void
  onRemove: (ingredient: CustomizerIngredient) => void
}

export function IngredientGrid({
  ingredients,
  selections,
  currentStep,
  direction,
  onDragEnd,
  onAdd,
  onRemove,
}: IngredientGridProps) {
  return (
    <div className="relative flex-1 overflow-hidden">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentStep}
          custom={direction}
          variants={SLIDE_VARIANTS}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={onDragEnd}
          className="absolute inset-0 overflow-y-auto p-6"
        >
          <div className="grid grid-cols-2 gap-4 pb-20">
            {ingredients.map((ingredient) => (
              <IngredientCard
                key={ingredient.id}
                ingredient={ingredient}
                currentQty={selections[ingredient.id]?.qty ?? 0}
                onAdd={(tier) => onAdd(ingredient, tier)}
                onRemove={() => onRemove(ingredient)}
                isDisabled={!ingredient.isAvailable}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

