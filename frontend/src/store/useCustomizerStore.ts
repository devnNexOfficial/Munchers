'use client'

/**
 * STORE: useCustomizerStore
 * PURPOSE:   Single source of truth for the active customization session.
 *            Tracks ingredient selections, enforces core/required rules,
 *            and exposes price/prep-time calculations for the UI.
 * DEPENDENCIES: CustomizerIngredient, IngredientSelection (lib/layerConfig)
 * SIDE EFFECTS: None â€” all state is local. API calls happen at checkout only.
 * PERFORMANCE: Zustand selectors â€” components subscribe to the slice they need.
 *   Example: useCustomizerStore(state => state.selections) re-renders ONLY
 *   when selections changes, not on alertMessage changes.
 *
 * ENCAPSULATION: clampQuantity is a module-private helper â€” it is intentionally
 *   NOT exported. External code must use the store actions (addItem, removeItem,
 *   setItemQuantity) â€” never mutate state directly.
 */

import { create } from 'zustand'

import type { CustomizerIngredient, IngredientSelection } from '@/lib/layerConfig'
import { getPricingStrategy } from '@/lib/pricing/pricingStrategies'

import {
  addItemHelper,
  calculatePrepTimeHelper,
  removeItemHelper,
  setItemQuantityHelper,
} from './useCustomizerStore.helpers'

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface CustomizerState {
  /** Map of ingredientId â†’ selection data. Use store selectors to read. */
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
      return addItemHelper(state.selections, ingredientId, maxLimit, isCore)
    })
  },

  removeItem: (ingredientId, isCore) => {
    set((state) => {
      return removeItemHelper(state.selections, ingredientId, isCore)
    })
  },

  setItemQuantity: (ingredientId, qty, isCore = false) => {
    set((state) => {
      return setItemQuantityHelper(state.selections, ingredientId, qty, isCore)
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
    return getPricingStrategy('customized').calculate(basePrice, selections, ingredientsList)
  },

  calculatePrepTime: (baseTime, ingredientsList) => {
    const { selections } = get()
    return calculatePrepTimeHelper(baseTime, ingredientsList, selections)
  },
}))


