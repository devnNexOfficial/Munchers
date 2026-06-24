'use client'

/**
 * HOOK: useCustomizerSteps
 * PURPOSE:   Derives the ordered step sequence for the customizer from the
 *            ingredient list, manages the current step index, and exposes
 *            navigation controls.
 * DEPENDENCIES: useCustomizerStore (selections, setItemQuantity), layerConfig
 * SIDE EFFECTS: Calls setItemQuantity on mount to auto-place buns (no API).
 * PERFORMANCE:
 *   - `groups` is memoized — only re-computed when `ingredients` reference changes
 *   - `currentGroup` is memoized — only re-computed when groups or step changes
 *   - `canGoNext` is memoized — only re-computed when currentGroup or selections change
 *   - ingredientMap uses Map for O(1) lookups when checking selections
 *
 * @param ingredients - The full list of CustomizerIngredient for the active menu item
 * @returns           - Step navigation state and controls for the IngredientPanel
 */

import { useState, useEffect, useMemo } from 'react'

import type { CustomizerIngredient } from '@/lib/layerConfig'
import { getLayerRole } from '@/lib/layerConfig'
import { useCustomizerStore } from '@/store/useCustomizerStore'

export interface StepGroup {
  /** Display title shown in the IngredientPanel header */
  title: string
  /** Ingredient category identifier for this step */
  category: string
  /** The ingredients available in this step */
  ingredients: CustomizerIngredient[]
}

export function useCustomizerSteps(ingredients: CustomizerIngredient[]): {
  currentStep: number
  totalSteps: number
  goNext: () => void
  goBack: () => void
  currentIngredients: CustomizerIngredient[]
  currentTitle: string
  currentCategory: string
  canGoNext: boolean
  isLastStep: boolean
} {
  const { selections, setItemQuantity } = useCustomizerStore()

  /**
   * Build the ordered step sequence from the ingredient list.
   * MEMOIZED: only re-computed when the ingredients array reference changes.
   * Each category becomes one step in the left-panel navigation flow.
   */
  const groups = useMemo<StepGroup[]>(() => {
    const steps: StepGroup[] = []

    // Step 1: Bun — only shown if restaurant has multiple bottom bun options
    // (single bun = auto-placed, no user choice needed)
    const bottomBuns = ingredients.filter(
      (ingredient) =>
        ingredient.category === 'bun' && getLayerRole(ingredient) !== 'top_bun'
    )
    if (bottomBuns.length > 1) {
      steps.push({ title: 'Choose Your Bun', category: 'bun', ingredients: bottomBuns })
    }

    // Step 2: Patty — always shown (is_required = true per spec)
    const patties = ingredients.filter((ingredient) => ingredient.category === 'patty')
    if (patties.length > 0) {
      steps.push({ title: 'Pick Your Patty', category: 'patty', ingredients: patties })
    }

    // Step 3: Cheese — shown if available for this item
    const cheeseOptions = ingredients.filter((ingredient) => ingredient.category === 'cheese')
    if (cheeseOptions.length > 0) {
      steps.push({ title: 'Add Cheese', category: 'cheese', ingredients: cheeseOptions })
    }

    // Step 4: Sauce — optional (is_flexible = true)
    const sauces = ingredients.filter((ingredient) => ingredient.category === 'sauce')
    if (sauces.length > 0) {
      steps.push({ title: 'Select Sauces', category: 'sauce', ingredients: sauces })
    }

    // Step 5: Toppings — optional, uses 3-tier quantity images
    const toppings = ingredients.filter((ingredient) => ingredient.category === 'topping')
    if (toppings.length > 0) {
      steps.push({ title: 'Fresh Toppings', category: 'topping', ingredients: toppings })
    }

    // Step 6: Extras (drinks, sides) — optional
    const extras = ingredients.filter(
      (ingredient) => ingredient.category === 'drink' || ingredient.category === 'side'
    )
    if (extras.length > 0) {
      steps.push({ title: 'Extras', category: 'extras', ingredients: extras })
    }

    return steps
  }, [ingredients])

  const [currentStep, setCurrentStep] = useState(0)

  /**
   * Auto-placement logic runs once when ingredients load.
   * Buns are placed by the system; user does not choose if there is only one type.
   * SIDE EFFECT: updates the Zustand store with initial bun quantities.
   */
  useEffect(() => {
    // Auto-place the top bun (always z-index 10, always rendered on top)
    const topBuns = ingredients.filter(
      (ingredient) => ingredient.category === 'bun' && getLayerRole(ingredient) === 'top_bun'
    )
    if (topBuns.length > 0 && (!selections[topBuns[0].id] || selections[topBuns[0].id].qty === 0)) {
      setItemQuantity(topBuns[0].id, 1, true)
    }

    // Auto-place bottom bun only when there is exactly one type (no user choice needed)
    const bottomBuns = ingredients.filter(
      (ingredient) => ingredient.category === 'bun' && getLayerRole(ingredient) !== 'top_bun'
    )
    if (
      bottomBuns.length === 1 &&
      (!selections[bottomBuns[0].id] || selections[bottomBuns[0].id].qty === 0)
    ) {
      setItemQuantity(bottomBuns[0].id, 1, true)
    }
    // Intentional: only run on mount (ingredients load). selections intentionally excluded
    // from deps — running on every selection change would re-auto-place buns mid-session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ingredients, setItemQuantity])

  /** Current step's group data — memoized for performance */
  const currentGroup = useMemo<StepGroup>(
    () => groups[currentStep] ?? { title: '', category: '', ingredients: [] },
    [groups, currentStep]
  )

  const totalSteps = groups.length
  const isLastStep = currentStep === totalSteps - 1

  /**
   * Whether the user can advance to the next step.
   * Blocked if the current step has required ingredients with 0 quantity.
   * MEMOIZED: Map for O(1) selection checks — ingredient lists can be 50+ items.
   */
  const canGoNext = useMemo<boolean>(() => {
    const requiredIngredients = currentGroup.ingredients.filter(
      (ingredient) => ingredient.isRequired
    )
    if (requiredIngredients.length === 0) return true

    // At least one required ingredient in this step must have qty > 0
    return requiredIngredients.some(
      (ingredient) => selections[ingredient.id] && selections[ingredient.id].qty > 0
    )
  }, [currentGroup, selections])

  const goNext = (): void => {
    if (canGoNext && currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const goBack = (): void => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
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
    isLastStep,
  }
}
