'use client'

import { create } from 'zustand'

import type { CustomizerIngredient, IngredientSelection } from '@/lib/layerConfig'

interface CustomizerState {
  selections: Record<string, IngredientSelection>
  alertMessage: string | null
  addItem: (ingredientId: string, maxLimit: number, isCore?: boolean) => void
  removeItem: (ingredientId: string, isCore: boolean) => void
  setItemQuantity: (ingredientId: string, qty: number, isCore?: boolean) => void
  resetCustomizer: () => void
  clearAlert: () => void
  calculateSubtotal: (basePrice: number, ingredientsList: CustomizerIngredient[]) => number
  calculatePrepTime: (baseTime: number, ingredientsList: CustomizerIngredient[]) => number
}

function clampQuantity(qty: number, maxLimit: number) {
  return Math.max(0, Math.min(qty, Math.max(1, maxLimit)))
}

export const useCustomizerStore = create<CustomizerState>((set, get) => ({
  selections: {},
  alertMessage: null,

  addItem: (ingredientId, maxLimit, isCore = false) => {
    set((state) => {
      const current = state.selections[ingredientId]
      const nextQty = clampQuantity((current?.qty ?? 0) + 1, maxLimit)

      if (current && current.qty >= maxLimit) {
        return {
          alertMessage: 'Maximum reached for this ingredient.',
        }
      }

      return {
        selections: {
          ...state.selections,
          [ingredientId]: {
            ingredientId,
            qty: nextQty,
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

      if (isCore && current.qty <= 1) {
        return {
          alertMessage: "Chef's Rule: this ingredient is required.",
        }
      }

      const nextQty = current.qty - 1
      const nextSelections = { ...state.selections }

      if (nextQty <= 0) {
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
      if (isCore && qty <= 0) {
        return {
          alertMessage: "Chef's Rule: this ingredient is required.",
        }
      }

      const nextSelections = { ...state.selections }

      if (qty <= 0) {
        delete nextSelections[ingredientId]
      } else {
        nextSelections[ingredientId] = {
          ingredientId,
          qty,
          isCore,
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
  clearAlert: () => set({ alertMessage: null }),

  calculateSubtotal: (basePrice, ingredientsList) => {
    const { selections } = get()

    return ingredientsList.reduce((total, ingredient) => {
      const qty = selections[ingredient.id]?.qty ?? 0
      return total + qty * ingredient.pricePerUnit
    }, basePrice)
  },

  calculatePrepTime: (baseTime, ingredientsList) => {
    const { selections } = get()

    return ingredientsList.reduce((total, ingredient) => {
      const qty = selections[ingredient.id]?.qty ?? 0
      return total + qty * ingredient.extraPrepTime
    }, baseTime)
  },
}))
