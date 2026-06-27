import { beforeEach, describe, expect, it } from 'vitest'

import type { CartItem } from './useCartStore'
import { useCartStore } from './useCartStore'

function makeCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    cartItemId: 'cart-1',
    menuItemId: 'menu-1',
    name: 'Classic Burger',
    imageUrl: '/burger.png',
    basePrice: 500,
    selections: [],
    mealOptions: [],
    totalPrice: 650,
    quantity: 1,
    specialInstructions: '',
    ...overrides,
  }
}

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart()
  })

  it('adds an item correctly', () => {
    const item = makeCartItem()

    useCartStore.getState().addItem(item)

    expect(useCartStore.getState().cartItems).toEqual([item])
  })

  it('removes an item correctly', () => {
    const store = useCartStore.getState()
    store.addItem(makeCartItem())
    store.addItem(makeCartItem({ cartItemId: 'cart-2', menuItemId: 'menu-2' }))

    store.removeItem('cart-1')

    expect(useCartStore.getState().cartItems).toHaveLength(1)
    expect(useCartStore.getState().cartItems[0]?.cartItemId).toBe('cart-2')
  })

  it('sums the subtotal correctly', () => {
    const store = useCartStore.getState()
    store.addItem(makeCartItem({ totalPrice: 650, quantity: 2 }))
    store.addItem(makeCartItem({ cartItemId: 'cart-2', totalPrice: 250, quantity: 1 }))

    expect(useCartStore.getState().getSubtotal()).toBe(1550)
  })

  it('enforces max quantity when updating quantity', () => {
    const store = useCartStore.getState()
    store.addItem(makeCartItem())

    store.updateQuantity('cart-1', 8, 3)

    expect(useCartStore.getState().cartItems[0]?.quantity).toBe(3)
  })
})
