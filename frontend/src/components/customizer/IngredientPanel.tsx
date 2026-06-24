'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { CustomizerIngredient } from '@/lib/layerConfig'
import { useCustomizerStore } from '@/store/useCustomizerStore'

import { IngredientGrid } from './IngredientGrid'
import { IngredientPanelHeader } from './IngredientPanelHeader'
import { IngredientStepDots } from './IngredientStepDots'

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
  const prevStepRef = useRef(currentStep)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    if (currentStep > prevStepRef.current) {
      setDirection(1)
    } else if (currentStep < prevStepRef.current) {
      setDirection(-1)
    }
    prevStepRef.current = currentStep
  }, [currentStep])

  const handleAdd = useCallback(
    (ingredient: CustomizerIngredient, tier?: 'low' | 'medium' | 'high') => {
      if (ingredient.isCore) {
        const isCurrentlyUnselected = !selections[ingredient.id] || selections[ingredient.id].qty === 0
        if (isCurrentlyUnselected) {
          const existingCore = ingredients.find(
            (otherIngredient) => otherIngredient.isCore && selections[otherIngredient.id]?.qty > 0
          )
          if (existingCore) {
            setItemQuantity(existingCore.id, 0, false)
          }
        }
      }

      addItem(ingredient.id, ingredient.maxLimit, ingredient.isCore)

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

  const handleRemove = useCallback(
    (ingredient: CustomizerIngredient) => {
      removeItem(ingredient.id, ingredient.isCore)
    },
    [removeItem]
  )

  const handleDragEnd = (
    _event: unknown,
    { offset, velocity }: { offset: { x: number }; velocity: { x: number } }
  ) => {
    const swipe = Math.abs(offset.x) * velocity.x
    if (swipe < -10_000 && canGoNext) {
      onNext()
    } else if (swipe > 10_000) {
      onBack()
    }
  }

  return (
    <div className="flex h-full w-full flex-col bg-white shadow-xl relative">
      <IngredientPanelHeader
        title={title}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={onNext}
        onBack={onBack}
        canGoNext={canGoNext}
      />
      <IngredientGrid
        ingredients={ingredients}
        selections={selections}
        currentStep={currentStep}
        direction={direction}
        onDragEnd={handleDragEnd}
        onAdd={handleAdd}
        onRemove={handleRemove}
      />
      <IngredientStepDots currentStep={currentStep} totalSteps={totalSteps} />
    </div>
  )
}

