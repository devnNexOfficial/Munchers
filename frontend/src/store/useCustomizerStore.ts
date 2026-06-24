/**
 * STORE: useCustomizerStore
 * PURPOSE: Manages ingredient selections during the food customizer flow.
 * ENCAPSULATION: Only exposes actions and minimal state — internal helpers
 *                are private (not exported). State is never mutated directly.
 * PERFORMANCE: Uses selective selectors to prevent unnecessary re-renders.
 *              O(1) lookup via Record<id, selection>.
 */
import { create } from 'zustand';

/**
 * Represents a single ingredient selection within the customizer.
 */
export interface IngredientSelection {
  qty: number;
  name?: string;
  price?: number;
  prepTime?: number;
}

/**
 * Internal state shape — not exported directly.
 * Components access state through selectors only.
 */
interface CustomizerState {
  /** Map of ingredientId -> selection details */
  selections: Record<string, IngredientSelection>;
}

/**
 * Store actions — the public API.
 */
interface CustomizerActions {
  /**
   * Replace all selections at once (e.g., restoring a saved creation).
   * @param selections - Full selections map
   */
  setSelections: (selections: Record<string, IngredientSelection>) => void;

  /**
   * Update a single ingredient's quantity and optional price.
   * Encapsulates internal state merging.
   * @param id - Ingredient ID
   * @param qty - New quantity (>= 0)
   * @param price - Optional price per unit
   */
  setItemQuantity: (id: string, qty: number, price?: number) => void;

  /**
   * Reset all selections to empty.
   */
  resetCustomizer: () => void;

  /**
   * Calculate subtotal from selections against a price map.
   * Uses a single O(n) reduce — no chained array methods.
   * @param prices - Record of ingredientId -> price per unit
   * @returns Total price of all selections
   */
  calculateSubtotal: (prices: Record<string, number>) => number;

  /**
   * Calculate total prep time from selections against a prep time map.
   * Uses a single O(n) reduce.
   * @param prepTimes - Record of ingredientId -> extra prep time per unit
   * @returns Total extra prep time
   */
  calculatePrepTime: (prepTimes: Record<string, number>) => number;
}

type CustomizerStore = CustomizerState & CustomizerActions;

const initialState: CustomizerState = {
  selections: {},
};

export const useCustomizerStore = create<CustomizerStore>((set, get) => ({
  ...initialState,

  setSelections: (selections) => set({ selections }),

  setItemQuantity: (id, qty, price) =>
    set((state) => ({
      selections: {
        ...state.selections,
        [id]: {
          ...state.selections[id],
          qty,
          ...(price !== undefined ? { price } : {}),
        },
      },
    })),

  resetCustomizer: () => set(initialState),

  calculateSubtotal: (prices) => {
    const { selections } = get();
    // Single-pass O(n) — no filter/map chaining
    let total = 0;
    for (const [id, sel] of Object.entries(selections)) {
      total += sel.qty * (prices[id] ?? sel.price ?? 0);
    }
    return total;
  },

  calculatePrepTime: (prepTimes) => {
    const { selections } = get();
    // Single-pass O(n)
    let total = 0;
    for (const [id, sel] of Object.entries(selections)) {
      total += sel.qty * (prepTimes[id] ?? sel.prepTime ?? 0);
    }
    return total;
  },
}));
