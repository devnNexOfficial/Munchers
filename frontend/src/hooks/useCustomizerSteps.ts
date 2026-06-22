'use client'

import { useState, useEffect, useMemo } from 'react'
import type { CustomizerIngredient } from '@/lib/layerConfig'
import { getLayerRole } from '@/lib/layerConfig'
import { useCustomizerStore } from '@/store/useCustomizerStore'

export type StepGroup = {
  title: string
  category: string
  ingredients: CustomizerIngredient[]
}

export function useCustomizerSteps(ingredients: CustomizerIngredient[]) {
  const { selections, setItemQuantity } = useCustomizerStore()

  const groups = useMemo(() => {
    const steps: StepGroup[] = []
    
    // Step 1: Bun (bottom only)
    const buns = ingredients.filter(i => i.category === 'bun' && getLayerRole(i) !== 'top_bun')
    if (buns.length > 1) {
      steps.push({ title: 'Choose Bun', category: 'bun', ingredients: buns })
    }

    // Step 2: Patty
    const patties = ingredients.filter(i => i.category === 'patty')
    if (patties.length > 0) steps.push({ title: 'Choose Patty', category: 'patty', ingredients: patties })

    // Step 3: Cheese
    const cheese = ingredients.filter(i => i.category === 'cheese')
    if (cheese.length > 0) steps.push({ title: 'Add Cheese', category: 'cheese', ingredients: cheese })

    // Step 4: Sauce
    const sauce = ingredients.filter(i => i.category === 'sauce')
    if (sauce.length > 0) steps.push({ title: 'Select Sauces', category: 'sauce', ingredients: sauce })

    // Step 5: Topping
    const toppings = ingredients.filter(i => i.category === 'topping')
    if (toppings.length > 0) steps.push({ title: 'Fresh Toppings', category: 'topping', ingredients: toppings })

    // Step 6: Extras
    const extras = ingredients.filter(i => i.category === 'drink' || i.category === 'side')
    if (extras.length > 0) steps.push({ title: 'Extras', category: 'extras', ingredients: extras })

    return steps
  }, [ingredients])

  const [currentStep, setCurrentStep] = useState(0)

  // Auto-placement logic on init
  useEffect(() => {
    // 1. Auto-place top bun (if it exists)
    const topBuns = ingredients.filter(i => i.category === 'bun' && getLayerRole(i) === 'top_bun')
    if (topBuns.length > 0 && (!selections[topBuns[0].id] || selections[topBuns[0].id].qty === 0)) {
      setItemQuantity(topBuns[0].id, 1, true)
    }

    // 2. Auto-place bottom bun if there's only 1 type
    const bottomBuns = ingredients.filter(i => i.category === 'bun' && getLayerRole(i) !== 'top_bun')
    if (bottomBuns.length === 1 && (!selections[bottomBuns[0].id] || selections[bottomBuns[0].id].qty === 0)) {
      setItemQuantity(bottomBuns[0].id, 1, true)
    }
  }, [ingredients, selections, setItemQuantity])

  const currentGroup = useMemo(() => groups[currentStep] || { title: '', category: '', ingredients: [] }, [groups, currentStep])
  const totalSteps = groups.length
  const isLastStep = currentStep === totalSteps - 1

  // Check if core items for the current step are satisfied
  const canGoNext = useMemo(() => {
    if (!currentGroup.ingredients) return true
    
    // Find all core requirements in the current step
    const requiredItems = currentGroup.ingredients.filter(i => i.isRequired)
    if (requiredItems.length === 0) return true
    
    // At least one required item in this category must be selected
    // Note: If multiple are required (e.g. need exactly 1 patty), we check if total qty > 0 for those required items
    const hasSelectedRequired = requiredItems.some(i => selections[i.id] && selections[i.id].qty > 0)
    
    return hasSelectedRequired
  }, [currentGroup, selections])

  const goNext = () => {
    if (canGoNext && currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  return {
    currentStep,
    totalSteps,
    goNext,
    goBack,
    currentIngredients: currentGroup.ingredients,
    currentTitle: currentGroup.title,
    currentCategory: currentGroup.category,
    canGoNext,
    isLastStep
  }
}
