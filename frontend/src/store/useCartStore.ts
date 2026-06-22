'use client'

import { create } from 'zustand'

import type { SelectedMealOption } from '@/hooks/useMealSelector'
import type { IngredientSelection } from '@/lib/layerConfig'

export interface CartItem {
  cartItemId: string
  menuItemId: string
  name: string
  imageUrl: string
  basePrice: number
  selections: IngredientSelection[]
  mealOptions: SelectedMealOption[]
  totalPrice: number
  quantity: number
  specialInstructions: string
  savedCreationName?: string
}

interface CartState {
  cartItems: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, qty: number, maxQty?: number) => void
  updateSpecialInstructions: (cartItemId: string, text: string) => void
  addMealToItem: (cartItemId: string, meal: SelectedMealOption[]) => void
  removeMealFromItem: (cartItemId: string) => void
  clearCart: () => void
  getSubtotal: () => number
  getItemCount: () => number
}

function clampQuantity(qty: number, maxQty = 99) {
  return Math.max(1, Math.min(qty, Math.max(1, maxQty)))
}

function getMealTotal(mealOptions: SelectedMealOption[]) {
  return mealOptions.reduce(
    (total, option) => total + option.quantity * option.extraPrice,
    0
  )
}

function getTotalWithoutMeal(item: CartItem) {
  return item.totalPrice - getMealTotal(item.mealOptions)
}

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
          ? { ...item, specialInstructions: text.slice(0, 100) }
          : item
      ),
    }))
  },

  addMealToItem: (cartItemId, meal) => {
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, mealOptions: meal, totalPrice: getTotalWithoutMeal(item) + getMealTotal(meal) }
          : item
      ),
    }))
  },

  removeMealFromItem: (cartItemId) => {
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, mealOptions: [], totalPrice: getTotalWithoutMeal(item) }
          : item
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
