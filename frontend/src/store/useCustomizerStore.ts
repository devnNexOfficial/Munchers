'use client'

/**
 * STORE: useCustomizerStore
 * PURPOSE:   Single source of truth for the active customization session.
 *            Tracks ingredient selections, enforces core/required rules,
 *            and exposes price/prep-time calculations for the UI.
 * DEPENDENCIES: CustomizerIngredient, IngredientSelection (lib/layerConfig)
 * SIDE EFFECTS: None — all state is local. API calls happen at checkout only.
 * PERFORMANCE: Zustand selectors — components subscribe to the slice they need.
 *   Example: useCustomizerStore(state => state.selections) re-renders ONLY
 *   when selections changes, not on alertMessage changes.
 *
 * ENCAPSULATION: clampQuantity is a module-private helper — it is intentionally
 *   NOT exported. External code must use the store actions (addItem, removeItem,
 *   setItemQuantity) — never mutate state directly.
 */

import { create } from 'zustand'

import type { CustomizerIngredient, IngredientSelection } from '@/lib/layerConfig'

// ---------------------------------------------------------------------------
// Private helpers (not exported — encapsulation)
// ---------------------------------------------------------------------------

/**
 * Clamps a quantity between 0 and maxLimit.
 * maxLimit is floored at 1 to prevent division errors.
 * PRIVATE: This is an implementation detail — callers use store actions.
 */
function clampQuantity(qty: number, maxLimit: number): number {
  return Math.max(0, Math.min(qty, Math.max(1, maxLimit)))
}

/** Alert shown when a core ingredient removal is blocked */
const CORE_INGREDIENT_BLOCKED_MESSAGE = "Chef's Rule: this ingredient is required."

/** Alert shown when an ingredient has hit its restaurant-set maximum */
const MAX_LIMIT_REACHED_MESSAGE = 'Maximum reached for this ingredient.'

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface CustomizerState {
  /** Map of ingredientId → selection data. Use store selectors to read. */
  selections: Record<string, IngredientSelection>
  /**
   * User-facing alert message to display in a toast.
   * null when no alert is active. Components should call clearAlert() after
   * displaying to reset state.
   */
  alertMessage: string | null

  /**
   * Adds one unit of an ingredient, respecting the restaurant's max limit.
   * Sets alertMessage if the max limit has already been reached.
   *
   * @param ingredientId - UUID of the ingredient to add
   * @param maxLimit     - Maximum quantity allowed (from menu_item_ingredients)
   * @param isCore       - Whether this is a core (non-removable) ingredient
   */
  addItem: (ingredientId: string, maxLimit: number, isCore?: boolean) => void

  /**
   * Removes one unit of an ingredient.
   * Blocks removal if the ingredient is core and quantity would reach 0.
   * Sets alertMessage if blocked.
   *
   * @param ingredientId - UUID of the ingredient to remove
   * @param isCore       - Whether this is a core ingredient
   */
  removeItem: (ingredientId: string, isCore: boolean) => void

  /**
   * Sets an ingredient's quantity directly (bypassing the +1/-1 flow).
   * Used for: bun auto-placement, topping tier swaps, edit-mode pre-loading.
   * Blocks setting core items to 0.
   *
   * @param ingredientId - UUID of the ingredient
   * @param qty          - The exact quantity to set (0 = remove from selections)
   * @param isCore       - Whether this is a core ingredient
   */
  setItemQuantity: (ingredientId: string, qty: number, isCore?: boolean) => void

  /**
   * Resets the entire customizer to a blank state.
   * Called when the customizer is closed or a new item is opened.
   */
  resetCustomizer: () => void

  /**
   * Loads a pre-existing set of selections (edit mode).
   * Used when the user taps "Edit" on a saved cart item.
   *
   * @param selectionsArray - Array of IngredientSelection objects to restore
   */
  loadSelections: (selectionsArray: IngredientSelection[]) => void

  /** Clears the active alert message after it has been displayed */
  clearAlert: () => void

  /**
   * Client-side price estimate. Server ALWAYS recalculates before order creation.
   * PERFORMANCE: O(n) single-pass over ingredientsList.
   *
   * @param basePrice      - Item's base price from the DB
   * @param ingredientsList - Full list of customizer ingredients with prices
   * @returns              - Estimated total price in PKR
   */
  calculateSubtotal: (basePrice: number, ingredientsList: CustomizerIngredient[]) => number

  /**
   * Client-side prep time estimate in minutes.
   * PERFORMANCE: O(n) single-pass over ingredientsList.
   *
   * @param baseTime       - Item's base prep time in minutes
   * @param ingredientsList - Full list with extraPrepTime per ingredient
   * @returns              - Estimated total prep time in minutes
   */
  calculatePrepTime: (baseTime: number, ingredientsList: CustomizerIngredient[]) => number
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useCustomizerStore = create<CustomizerState>((set, get) => ({
  selections: {},
  alertMessage: null,

  addItem: (ingredientId, maxLimit, isCore = false) => {
    set((state) => {
      const current = state.selections[ingredientId]
      const currentQty = current?.qty ?? 0

      // Block if already at max — set alert for the UI to display
      if (currentQty >= maxLimit) {
        return { alertMessage: MAX_LIMIT_REACHED_MESSAGE }
      }

      const nextQty = clampQuantity(currentQty + 1, maxLimit)

      return {
        selections: {
          ...state.selections,
          [ingredientId]: {
            ingredientId,
            qty: nextQty,
            // Preserve existing isCore flag if already set; else use provided value
            isCore: current?.isCore ?? isCore,
            tier: current?.tier,
          },
        },
        alertMessage: null,
      }
    })
  },

  removeItem: (ingredientId, isCore) => {
    set((state) => {
      const current = state.selections[ingredientId]
      if (!current) return state

      // Block removal of core ingredients at minimum quantity
      if (isCore && current.qty <= 1) {
        return { alertMessage: CORE_INGREDIENT_BLOCKED_MESSAGE }
      }

      const nextQty = current.qty - 1
      const nextSelections = { ...state.selections }

      if (nextQty <= 0) {
        // Remove entirely from the map when quantity reaches 0
        delete nextSelections[ingredientId]
      } else {
        nextSelections[ingredientId] = { ...current, qty: nextQty }
      }

      return {
        selections: nextSelections,
        alertMessage: null,
      }
    })
  },

  setItemQuantity: (ingredientId, qty, isCore = false) => {
    set((state) => {
      // Block setting core items to 0 (must always have at least 1)
      if (isCore && qty <= 0) {
        return { alertMessage: CORE_INGREDIENT_BLOCKED_MESSAGE }
      }

      const nextSelections = { ...state.selections }

      if (qty <= 0) {
        delete nextSelections[ingredientId]
      } else {
        nextSelections[ingredientId] = {
          ingredientId,
          qty,
          isCore,
          // Preserve existing tier if present (topping tier selection)
          tier: state.selections[ingredientId]?.tier,
        }
      }

      return {
        selections: nextSelections,
        alertMessage: null,
      }
    })
  },

  resetCustomizer: () => set({ selections: {}, alertMessage: null }),

  loadSelections: (selectionsArray) => {
    // Convert array to Map-style Record for O(1) lookups
    const newSelections: Record<string, IngredientSelection> = {}
    selectionsArray.forEach((sel) => {
      newSelections[sel.ingredientId] = sel
    })
    set({ selections: newSelections, alertMessage: null })
  },

  clearAlert: () => set({ alertMessage: null }),

  calculateSubtotal: (basePrice, ingredientsList) => {
    const { selections } = get()
    // Single-pass O(n) — avoids filter().map().reduce() chaining
    return ingredientsList.reduce((total, ingredient) => {
      const qty = selections[ingredient.id]?.qty ?? 0
      return total + qty * ingredient.pricePerUnit
    }, basePrice)
  },

  calculatePrepTime: (baseTime, ingredientsList) => {
    const { selections } = get()
    // Single-pass O(n)
    return ingredientsList.reduce((total, ingredient) => {
      const qty = selections[ingredient.id]?.qty ?? 0
      return total + qty * ingredient.extraPrepTime
    }, baseTime)
  },
}))
