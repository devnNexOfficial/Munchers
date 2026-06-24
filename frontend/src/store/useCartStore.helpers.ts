import type { SelectedMealOption } from '@/hooks/useMealSelector'

import type { CartItem } from './useCartStore.types'

/**
 * Clamps a quantity between 1 and maxQty.
 * Callers must use store actions rather than mutating cartItems directly.
 */
export function clampQuantity(qty: number, maxQty = 99): number {
  return Math.max(1, Math.min(qty, Math.max(1, maxQty)))
}

/** Calculates the total contribution of all meal add-ons for one cart item. */
export function getMealTotal(mealOptions: SelectedMealOption[]): number {
  return mealOptions.reduce(
    (total, option) => total + option.quantity * option.extraPrice,
    0
  )
}

/** Returns an item's price without its meal add-ons. */
export function getTotalWithoutMeal(item: CartItem): number {
  return item.totalPrice - getMealTotal(item.mealOptions)
}


