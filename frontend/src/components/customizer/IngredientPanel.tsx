'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CustomizerIngredient } from '@/lib/layerConfig'
import { IngredientCard } from './IngredientCard'
import { useCustomizerStore } from '@/store/useCustomizerStore'

interface IngredientPanelProps {
  ingredients: CustomizerIngredient[]
  title: string
  currentStep: number
  totalSteps: number
  onNext: () => void
  onBack: () => void
  canGoNext: boolean
}

export function IngredientPanel({
  ingredients,
  title,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  canGoNext,
}: IngredientPanelProps) {
  const { selections, addItem, removeItem, setItemQuantity } = useCustomizerStore()

  // Track previous step to determine slide direction
  const [prevStep, setPrevStep] = useState(currentStep)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    if (currentStep > prevStep) {
      setDirection(1)
    } else if (currentStep < prevStep) {
      setDirection(-1)
    }
    setPrevStep(currentStep)
  }, [currentStep, prevStep])

  const variants = {
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
  }

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = Math.abs(offset.x) * velocity.x
    if (swipe < -10000) {
      // swipe left -> next
      if (canGoNext) onNext()
    } else if (swipe > 10000) {
      // swipe right -> back
      onBack()
    }
  }

  const handleAdd = (ingredient: CustomizerIngredient, tier?: 'low' | 'medium' | 'high') => {
    // Check if it's a core swap
    if (ingredient.isCore) {
      const currentQty = selections[ingredient.id]?.qty || 0
      if (currentQty === 0) {
        // Find existing selected core item in the same step
        const existingCore = ingredients.find(i => i.isCore && selections[i.id]?.qty > 0)
        if (existingCore) {
          // Bypass isCore block by passing false, to allow 0 qty temporarily
          setItemQuantity(existingCore.id, 0, false)
        }
      }
    }

    addItem(ingredient.id, ingredient.maxLimit, ingredient.isCore)
    
    // If a tier was provided (topping), we use setItemQuantity to update it
    if (tier) {
      // We know it was just added so qty is at least 1, we just update the object to include tier
      // Actually setItemQuantity preserves tier, but we want to SET tier. 
      // The store currently doesn't have a way to set tier cleanly except modifying it if we had a function.
      // But we can just use `setItemQuantity` and it preserves the old tier.
      // Wait, we need to UPDATE the tier. 
      // Let's use the store's set method directly since Zustand allows it, or use a workaround.
      // The prompt says "do not touch useCustomizerStore".
      useCustomizerStore.setState((state) => ({
        selections: {
          ...state.selections,
          [ingredient.id]: {
            ...state.selections[ingredient.id],
            tier: tier
          }
        }
      }))
    }
  }

  const handleRemove = (ingredient: CustomizerIngredient) => {
    removeItem(ingredient.id, ingredient.isCore)
  }

  return (
    <div className="flex h-full w-full flex-col bg-white shadow-xl relative">
      <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b">
        <button
          onClick={onBack}
          disabled={currentStep === 0}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h2 className="text-xl font-black text-muncherz-black">{title}</h2>
        <button
          onClick={onNext}
          disabled={currentStep === totalSteps - 1 || !canGoNext}
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            !canGoNext || currentStep === totalSteps - 1 ? 'bg-gray-100 opacity-30 text-gray-700' : 'bg-muncherz-red text-white shadow-md'
          }`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 overflow-y-auto p-6"
          >
            <div className="grid grid-cols-2 gap-4 pb-20">
              {ingredients.map(ingredient => (
                <IngredientCard
                  key={ingredient.id}
                  ingredient={ingredient}
                  currentQty={selections[ingredient.id]?.qty || 0}
                  onAdd={(tier) => handleAdd(ingredient, tier)}
                  onRemove={() => handleRemove(ingredient)}
                  isDisabled={!ingredient.isAvailable}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-white via-white to-transparent pb-6 pt-10">
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentStep ? 'w-6 bg-muncherz-red' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
