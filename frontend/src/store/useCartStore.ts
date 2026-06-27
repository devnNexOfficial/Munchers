'use client'

/**
 * STORE: useCartStore
 * PURPOSE:   Manages the user's shopping cart across navigation within a session.
 *            Each cart item can have customization selections, meal add-ons,
 *            special instructions, and a quantity.
 * DEPENDENCIES: IngredientSelection (lib/layerConfig), SelectedMealOption (hooks/useMealSelector)
 * SIDE EFFECTS: None - client-side only. Supabase calls happen at checkout only.
 * PERFORMANCE: Zustand selectors - subscribe to only the slice you need.
 */

import { create } from 'zustand'

import { MAX_SPECIAL_INSTRUCTIONS_LENGTH } from '@/lib/constants'

import { clampQuantity, getMealTotal, getTotalWithoutMeal } from './useCartStore.helpers'
import type { CartState } from './useCartStore.types'
export type { CartItem } from './useCartStore.types'

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
    return get().cartItems.reduce(
      (total, item) => total + item.totalPrice * item.quantity,
      0
    )
  },

  getItemCount: () => {
    return get().cartItems.reduce((total, item) => total + item.quantity, 0)
  },
}))
