import { beforeEach, describe, expect, it } from 'vitest'

import type { CustomizerIngredient } from '@/lib/layerConfig'

import { useCustomizerStore } from './useCustomizerStore'

const ingredients: CustomizerIngredient[] = [
  {
    id: 'patty',
    name: 'Beef Patty',
    nameUr: null,
    category: 'patty',
    pngImageUrl: '/patty.png',
    pngQtyLow: null,
    pngQtyMedium: null,
    pngQtyHigh: null,
    zIndex: 2,
    yPosition: '60%',
    widthRatio: '85%',
    pricePerUnit: 120,
    standardUnit: 'piece',
    maxLimit: 3,
    isCore: true,
    isRequired: true,
    isFlexible: false,
    extraPrepTime: 4,
    isAvailable: true,
    sortOrder: 1,
  },
  {
    id: 'sauce',
    name: 'Garlic Mayo',
    nameUr: null,
    category: 'sauce',
    pngImageUrl: '/sauce.png',
    pngQtyLow: null,
    pngQtyMedium: null,
    pngQtyHigh: null,
    zIndex: 4,
    yPosition: '48%',
    widthRatio: '82%',
    pricePerUnit: 30,
    standardUnit: 'spoon',
    maxLimit: 2,
    isCore: false,
    isRequired: false,
    isFlexible: true,
    extraPrepTime: 1,
    isAvailable: true,
    sortOrder: 2,
  },
]

describe('useCustomizerStore', () => {
  beforeEach(() => {
    useCustomizerStore.getState().resetCustomizer()
  })

  it('adds items up to the max limit and records an alert at the limit', () => {
    const store = useCustomizerStore.getState()

    store.addItem('sauce', 2)
    store.addItem('sauce', 2)
    store.addItem('sauce', 2)

    const state = useCustomizerStore.getState()
    expect(state.selections.sauce).toMatchObject({ ingredientId: 'sauce', qty: 2, isCore: false })
    expect(state.alertMessage).toBe('Maximum reached for this ingredient.')
  })

  it('blocks required core ingredients from being removed to zero', () => {
    const store = useCustomizerStore.getState()

    store.setItemQuantity('patty', 1, true)
    store.removeItem('patty', true)

    const state = useCustomizerStore.getState()
    expect(state.selections.patty).toMatchObject({ ingredientId: 'patty', qty: 1, isCore: true })
    expect(state.alertMessage).toBe("Chef's Rule: this ingredient is required.")
  })

  it('allows flexible ingredients to be removed completely', () => {
    const store = useCustomizerStore.getState()

    store.addItem('sauce', 2)
    store.removeItem('sauce', false)

    expect(useCustomizerStore.getState().selections.sauce).toBeUndefined()
  })

  it('calculates subtotal and prep time from selected quantities', () => {
    const store = useCustomizerStore.getState()

    store.setItemQuantity('patty', 2, true)
    store.setItemQuantity('sauce', 1)

    const state = useCustomizerStore.getState()
    expect(state.calculateSubtotal(500, ingredients)).toBe(770)
    expect(state.calculatePrepTime(12, ingredients)).toBe(21)
  })

  it('resets selections and alert state', () => {
    const store = useCustomizerStore.getState()

    store.addItem('sauce', 1)
    store.addItem('sauce', 1)
    store.resetCustomizer()

    const state = useCustomizerStore.getState()
    expect(state.selections).toEqual({})
    expect(state.alertMessage).toBeNull()
  })
})
