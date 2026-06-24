import { beforeEach, describe, expect, it } from 'vitest';
import { useCartStore } from './useCartStore';

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('addItem adds correctly', () => {
    useCartStore.getState().addItem({
      id: 'burger-1',
      name: 'Classic Burger',
      price: 800,
      quantity: 1,
    });

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].name).toBe('Classic Burger');
  });

  it('removeItem removes correctly', () => {
    useCartStore.getState().addItem({
      id: 'burger-1',
      name: 'Classic Burger',
      price: 800,
      quantity: 1,
    });

    useCartStore.getState().removeItem('burger-1');

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('getSubtotal sums correctly', () => {
    useCartStore.getState().addItem({
      id: 'burger-1',
      name: 'Classic Burger',
      price: 800,
      quantity: 2,
    });
    useCartStore.getState().addItem({
      id: 'fries-1',
      name: 'Fries',
      price: 300,
      quantity: 1,
    });

    expect(useCartStore.getState().getSubtotal()).toBe(1900);
  });
});
