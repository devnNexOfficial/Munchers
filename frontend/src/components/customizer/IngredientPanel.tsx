'use client'

/**
 * COMPONENT: IngredientPanel
 * PURPOSE:   Left panel of the customizer — shows the ingredient cards for the
 *            current step, navigation arrows, and step progress dots.
 *            Supports swipe gestures for mobile navigation.
 * DEPENDENCIES: IngredientCard, useCustomizerStore, Framer Motion
 * SIDE EFFECTS: None — delegates add/remove to store via callbacks.
 * PERFORMANCE:
 *   - handleAdd and handleRemove are wrapped in useCallback to keep IngredientCard
 *     props stable — prevents all cards re-rendering when parent re-renders
 *   - direction uses useRef to avoid triggering renders on prev-step tracking
 *
 * SINGLE RESPONSIBILITY: This component only handles panel UI and navigation.
 *   Store mutations happen through the injected store actions.
 */

import { useRef, useEffect, useState, useCallback } from 'react'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { CustomizerIngredient } from '@/lib/layerConfig'
import { useCustomizerStore } from '@/store/useCustomizerStore'

import { IngredientCard } from './IngredientCard'

interface IngredientPanelProps {
  ingredients: CustomizerIngredient[]
  title: string
  currentStep: number
  totalSteps: number
  onNext: () => void
  onBack: () => void
  canGoNext: boolean
}

/** Slide animation variants for the ingredient grid — direction is injected as custom prop */
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

  // useRef for previous step: avoids triggering renders on step tracking
  const prevStepRef = useRef(currentStep)
  const [direction, setDirection] = useState(0)

  // Determine slide direction when step changes
  useEffect(() => {
    if (currentStep > prevStepRef.current) {
      setDirection(1)
    } else if (currentStep < prevStepRef.current) {
      setDirection(-1)
    }
    prevStepRef.current = currentStep
  }, [currentStep])

  /**
   * Handles adding an ingredient or selecting a topping tier.
   * For core items: swaps out the previously selected core before adding the new one
   * (e.g., switching bun type — only one bun can be selected at a time).
   *
   * useCallback: stable reference prevents all IngredientCard components from
   * re-rendering whenever the parent re-renders (IngredientCard is React.memo'd).
   */
  const handleAdd = useCallback(
    (ingredient: CustomizerIngredient, tier?: 'low' | 'medium' | 'high') => {
      // Core item swap logic (e.g. bun swap): deselect the existing core first
      if (ingredient.isCore) {
        const isCurrentlyUnselected = !selections[ingredient.id] || selections[ingredient.id].qty === 0
        if (isCurrentlyUnselected) {
          const existingCore = ingredients.find(
            (otherIngredient) => otherIngredient.isCore && selections[otherIngredient.id]?.qty > 0
          )
          if (existingCore) {
            // Pass isCore=false to bypass the core-block guard temporarily during swap
            setItemQuantity(existingCore.id, 0, false)
          }
        }
      }

      addItem(ingredient.id, ingredient.maxLimit, ingredient.isCore)

      // If a tier was provided (topping selection), update the tier in the store
      if (tier) {
        useCustomizerStore.setState((state) => ({
          selections: {
            ...state.selections,
            [ingredient.id]: {
              ...state.selections[ingredient.id],
              tier,
            },
          },
        }))
      }
    },
    [addItem, ingredients, selections, setItemQuantity]
  )

  /**
   * Handles removing an ingredient quantity.
   * useCallback: stable reference for IngredientCard memo optimization.
   */
  const handleRemove = useCallback(
    (ingredient: CustomizerIngredient) => {
      removeItem(ingredient.id, ingredient.isCore)
    },
    [removeItem]
  )

  /**
   * Handles swipe-to-navigate on the ingredient grid.
   * swipe = abs(offsetX) * velocityX — positive = swiped right (go back),
   * negative = swiped left (go next).
   */
  const handleDragEnd = (
    _event: unknown,
    { offset, velocity }: { offset: { x: number }; velocity: { x: number } }
  ) => {
    const swipe = Math.abs(offset.x) * velocity.x
    if (swipe < -10_000 && canGoNext) {
      // Swiped left → advance to next step
      onNext()
    } else if (swipe > 10_000) {
      // Swiped right → go back to previous step
      onBack()
    }
  }

  return (
    <div className="flex h-full w-full flex-col bg-white shadow-xl relative">
      {/* Step header with navigation arrows */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b">
        <button
          onClick={onBack}
          disabled={currentStep === 0}
          aria-label="Previous step"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h2 className="text-xl font-black text-muncherz-black">{title}</h2>
        <button
          onClick={onNext}
          disabled={currentStep === totalSteps - 1 || !canGoNext}
          aria-label="Next step"
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            !canGoNext || currentStep === totalSteps - 1
              ? 'bg-gray-100 opacity-30 text-gray-700'
              : 'bg-muncherz-red text-white shadow-md'
          }`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Animated ingredient grid — slides in the direction of navigation */}
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
            onDragEnd={handleDragEnd}
            className="absolute inset-0 overflow-y-auto p-6"
          >
            <div className="grid grid-cols-2 gap-4 pb-20">
              {ingredients.map((ingredient) => (
                <IngredientCard
                  key={ingredient.id}
                  ingredient={ingredient}
                  currentQty={selections[ingredient.id]?.qty ?? 0}
                  onAdd={(tier) => handleAdd(ingredient, tier)}
                  onRemove={() => handleRemove(ingredient)}
                  isDisabled={!ingredient.isAvailable}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step progress dots at the bottom */}
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-white via-white to-transparent pb-6 pt-10">
        <div className="flex justify-center gap-2" role="tablist" aria-label="Customizer steps">
          {Array.from({ length: totalSteps }).map((_, stepIndex) => (
            <div
              key={stepIndex}
              role="tab"
              aria-selected={stepIndex === currentStep}
              className={`h-2 rounded-full transition-all duration-300 ${
                stepIndex === currentStep ? 'w-6 bg-muncherz-red' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
