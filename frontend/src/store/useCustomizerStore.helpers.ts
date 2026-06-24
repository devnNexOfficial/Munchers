import type { CustomizerIngredient, IngredientSelection } from '@/lib/layerConfig'

/** Alert shown when a core ingredient removal is blocked */
export const CORE_INGREDIENT_BLOCKED_MESSAGE = "Chef's Rule: this ingredient is required."

/** Alert shown when an ingredient has hit its restaurant-set maximum */
export const MAX_LIMIT_REACHED_MESSAGE = 'Maximum reached for this ingredient.'

/**
 * Clamps a quantity between 0 and maxLimit.
 * maxLimit is floored at 1 to prevent division errors.
 */
export function clampQuantity(qty: number, maxLimit: number): number {
  return Math.max(0, Math.min(qty, Math.max(1, maxLimit)))
}

/**
 * Client-side prep time estimate in minutes.
 * PERFORMANCE: O(n) single-pass over ingredientsList.
 */
export function calculatePrepTimeHelper(
  baseTime: number,
  ingredientsList: CustomizerIngredient[],
  selections: Record<string, IngredientSelection>
): number {
  return ingredientsList.reduce((total, ingredient) => {
    const qty = selections[ingredient.id]?.qty ?? 0
    return total + qty * ingredient.extraPrepTime
  }, baseTime)
}

export function addItemHelper(
  selections: Record<string, IngredientSelection>,
  ingredientId: string,
  maxLimit: number,
  isCore: boolean
): { selections: Record<string, IngredientSelection>; alertMessage: string | null } | { alertMessage: string } {
  const current = selections[ingredientId]
  const currentQty = current?.qty ?? 0

  if (currentQty >= maxLimit) {
    return { alertMessage: MAX_LIMIT_REACHED_MESSAGE }
  }

  const nextQty = clampQuantity(currentQty + 1, maxLimit)

  return {
    selections: {
      ...selections,
      [ingredientId]: {
        ingredientId,
        qty: nextQty,
        isCore: current?.isCore ?? isCore,
        tier: current?.tier,
      },
    },
    alertMessage: null,
  }
}

export function removeItemHelper(
  selections: Record<string, IngredientSelection>,
  ingredientId: string,
  isCore: boolean
):
  | { selections: Record<string, IngredientSelection>; alertMessage: string | null }
  | { alertMessage: string }
  | Record<string, never> {
  const current = selections[ingredientId]
  if (!current) return {}

  if (isCore && current.qty <= 1) {
    return { alertMessage: CORE_INGREDIENT_BLOCKED_MESSAGE }
  }

  const nextQty = current.qty - 1
  const nextSelections = { ...selections }

  if (nextQty <= 0) {
    delete nextSelections[ingredientId]
  } else {
    nextSelections[ingredientId] = { ...current, qty: nextQty }
  }

  return {
    selections: nextSelections,
    alertMessage: null,
  }
}

export function setItemQuantityHelper(
  selections: Record<string, IngredientSelection>,
  ingredientId: string,
  qty: number,
  isCore: boolean
): { selections: Record<string, IngredientSelection>; alertMessage: string | null } | { alertMessage: string } {
  if (isCore && qty <= 0) {
    return { alertMessage: CORE_INGREDIENT_BLOCKED_MESSAGE }
  }

  const nextSelections = { ...selections }

  if (qty <= 0) {
    delete nextSelections[ingredientId]
  } else {
    nextSelections[ingredientId] = {
      ingredientId,
      qty,
      isCore,
      tier: selections[ingredientId]?.tier,
    }
  }

  return {
    selections: nextSelections,
    alertMessage: null,
  }
}


