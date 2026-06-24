'use client'

/**
 * STORE: useCartStore
 * PURPOSE:   Manages the user's shopping cart across navigation within a session.
 *            Each cart item can have customization selections, meal add-ons,
 *            special instructions, and a quantity.
 * DEPENDENCIES: IngredientSelection (lib/layerConfig), SelectedMealOption (hooks/useMealSelector)
 * SIDE EFFECTS: None — client-side only. Supabase calls happen at checkout only.
 * PERFORMANCE: Zustand selectors — subscribe to only the slice you need.
 *   Example: useCartStore(state => state.cartItems.length) re-renders only on
 *   count changes, not on individual item mutations.
 *
 * ENCAPSULATION: clampQuantity, getMealTotal, getTotalWithoutMeal are module-private.
 *   External code must use store actions — never mutate cartItems directly.
 */

import { create } from 'zustand'

import type { SelectedMealOption } from '@/hooks/useMealSelector'
import type { IngredientSelection } from '@/lib/layerConfig'
import { MAX_SPECIAL_INSTRUCTIONS_LENGTH } from '@/lib/constants'

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * A single item in the cart. Exported because other components need the type
 * for prop typing, but the array itself is only accessible through the store.
 */
export interface CartItem {
  /** UUID generated client-side at the moment of adding to cart */
  cartItemId: string
  /** References the menu_items.id in Supabase */
  menuItemId: string
  /** Display name (snapshot from when item was added) */
  name: string
  /** URL of the item's menu image */
  imageUrl: string
  /** Base price before customization (client estimate — server validates) */
  basePrice: number
  /** User's customization selections for this item */
  selections: IngredientSelection[]
  /** Meal add-on selections (drinks, fries, etc.) */
  mealOptions: SelectedMealOption[]
  /**
   * Total price including customizations and meal options (client estimate).
   * Server ALWAYS recalculates independently before order creation.
   */
  totalPrice: number
  /** How many of this exact configuration the user wants */
  quantity: number
  /** Optional free-text note to the kitchen (max 100 chars) */
  specialInstructions: string
  /** If this item was loaded from a saved creation, its name for display */
  savedCreationName?: string
}

// ---------------------------------------------------------------------------
// Private helpers (not exported — encapsulation)
// ---------------------------------------------------------------------------

/**
 * Clamps a quantity between 1 and maxQty.
 * PRIVATE — callers must use updateQuantity action.
 */
function clampQuantity(qty: number, maxQty = 99): number {
  return Math.max(1, Math.min(qty, Math.max(1, maxQty)))
}

/**
 * Calculates the total contribution of all meal add-ons for one cart item.
 * PRIVATE — used internally by addMealToItem and removeMealFromItem.
 */
function getMealTotal(mealOptions: SelectedMealOption[]): number {
  return mealOptions.reduce(
    (total, option) => total + option.quantity * option.extraPrice,
    0
  )
}

/**
 * Returns an item's price without its meal add-ons.
 * Used when replacing or removing meal options to recalculate totalPrice.
 * PRIVATE — implementation detail of meal management actions.
 */
function getTotalWithoutMeal(item: CartItem): number {
  return item.totalPrice - getMealTotal(item.mealOptions)
}

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface CartState {
  /** All items currently in the cart */
  cartItems: CartItem[]

  /**
   * Adds a new item to the cart. Quantity is clamped to valid range.
   * Does NOT merge with existing items — each call creates a new cart line
   * (intentional: same item customized differently = separate cart lines).
   *
   * @param item - The complete cart item to add
   */
  addItem: (item: CartItem) => void

  /**
   * Removes a cart item entirely by its cartItemId.
   *
   * @param cartItemId - The client-generated UUID of the cart line to remove
   */
  removeItem: (cartItemId: string) => void

  /**
   * Updates the quantity of an existing cart item.
   * Quantity is clamped between 1 and maxQty (default 99).
   *
   * @param cartItemId - Target cart line UUID
   * @param qty        - Desired new quantity
   * @param maxQty     - Restaurant-configured maximum per item (optional)
   */
  updateQuantity: (cartItemId: string, qty: number, maxQty?: number) => void

  /**
   * Updates the special instructions for a cart item.
   * Truncates to MAX_SPECIAL_INSTRUCTIONS_LENGTH characters.
   *
   * @param cartItemId - Target cart line UUID
   * @param text       - The new special instructions text
   */
  updateSpecialInstructions: (cartItemId: string, text: string) => void

  /**
   * Attaches meal options to an existing cart item, recalculating totalPrice.
   *
   * @param cartItemId - Target cart line UUID
   * @param meal       - Array of selected meal options
   */
  addMealToItem: (cartItemId: string, meal: SelectedMealOption[]) => void

  /**
   * Removes all meal options from a cart item, recalculating totalPrice.
   *
   * @param cartItemId - Target cart line UUID
   */
  removeMealFromItem: (cartItemId: string) => void

  /**
   * Partially updates a cart item's fields (used by the customizer edit flow).
   * Prefer specific actions (updateQuantity, addMealToItem) where possible.
   *
   * @param cartItemId  - Target cart line UUID
   * @param updatedItem - Partial CartItem fields to merge
   */
  updateItem: (cartItemId: string, updatedItem: Partial<CartItem>) => void

  /** Removes all items from the cart (called after successful order placement) */
  clearCart: () => void

  /**
   * Returns the cart subtotal: sum of (item.totalPrice × item.quantity).
   * Client-side estimate only — server recalculates at order placement.
   *
   * @returns Total price in PKR
   */
  getSubtotal: () => number

  /**
   * Returns the total number of individual items in the cart (sum of quantities).
   * Used for cart badge count in the header.
   *
   * @returns Total item count
   */
  getItemCount: () => number
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useCartStore = create<CartState>((set, get) => ({
  cartItems: [],

  addItem: (item) => {
    set((state) => ({
      cartItems: [...state.cartItems, { ...item, quantity: clampQuantity(item.quantity) }],
    }))
  },

  removeItem: (cartItemId) => {
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item.cartItemId !== cartItemId),
    }))
  },

  updateQuantity: (cartItemId, qty, maxQty) => {
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: clampQuantity(qty, maxQty) }
          : item
      ),
    }))
  },

  updateSpecialInstructions: (cartItemId, text) => {
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item.cartItemId === cartItemId
          // Enforce character limit — truncate silently (UI enforces via maxLength)
          ? { ...item, specialInstructions: text.slice(0, MAX_SPECIAL_INSTRUCTIONS_LENGTH) }
          : item
      ),
    }))
  },

  addMealToItem: (cartItemId, meal) => {
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item.cartItemId === cartItemId
          ? {
              ...item,
              mealOptions: meal,
              // Replace base price + new meal total (strip old meal total first)
              totalPrice: getTotalWithoutMeal(item) + getMealTotal(meal),
            }
          : item
      ),
    }))
  },

  removeMealFromItem: (cartItemId) => {
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item.cartItemId === cartItemId
          ? {
              ...item,
              mealOptions: [],
              totalPrice: getTotalWithoutMeal(item),
            }
          : item
      ),
    }))
  },

  updateItem: (cartItemId, updatedItem) => {
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item.cartItemId === cartItemId ? { ...item, ...updatedItem } : item
      ),
    }))
  },

  clearCart: () => set({ cartItems: [] }),

  getSubtotal: () => {
    // Single-pass O(n) — avoids separate .map().reduce()
    return get().cartItems.reduce(
      (total, item) => total + item.totalPrice * item.quantity,
      0
    )
  },

  getItemCount: () => {
    // Single-pass O(n)
    return get().cartItems.reduce((total, item) => total + item.quantity, 0)
  },
}))
