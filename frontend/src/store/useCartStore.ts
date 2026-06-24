/**
 * STORE: useCartStore
 * PURPOSE: Manages the shopping cart — separate from customizer store.
 * ENCAPSULATION: Only exposes actions and read-only cart state.
 *                Internal helpers (merge logic) are private.
 * SRP: Cart management only — address/checkout state lives elsewhere.
 */
import { create } from 'zustand';

/**
 * Represents a single item in the cart.
 */
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

/**
 * Internal state shape.
 */
interface CartState {
  items: CartItem[];
}

/**
 * Public API — all actions go through these methods.
 * No direct state mutation from outside the store.
 */
interface CartActions {
  /**
   * Add an item to the cart. Merges with existing item of same ID.
   * @param item - The item to add
   */
  addItem: (item: CartItem) => void;

  /**
   * Remove an item from the cart by ID.
   * @param id - The item ID to remove
   */
  removeItem: (id: string) => void;

  /**
   * Update quantity of an existing item.
   * @param id - The item ID
   * @param quantity - New quantity (>= 1)
   */
  updateQuantity: (id: string, quantity: number) => void;

  /**
   * Calculate the subtotal of all items in the cart.
   * Single-pass O(n) — no chained array methods.
   * @returns Total price of all items * their quantities
   */
  getSubtotal: () => number;

  /**
   * Get the total number of items (sum of quantities).
   * @returns Item count
   */
  getItemCount: () => number;

  /**
   * Clear all items from the cart.
   */
  clearCart: () => void;
}

type CartStore = CartState & CartActions;

const initialState: CartState = {
  items: [],
};

export const useCartStore = create<CartStore>((set, get) => ({
  ...initialState,

  addItem: (item) =>
    set((state) => {
      const existingIndex = state.items.findIndex(
        (cartItem) => cartItem.id === item.id
      );

      if (existingIndex === -1) {
        return { items: [...state.items, item] };
      }

      // Use Map for O(1) lookup — but array spread is fine here
      // since cart size is typically < 50 items
      const updatedItems = [...state.items];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + item.quantity,
      };
      return { items: updatedItems };
    }),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  updateQuantity: (id, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      ),
    })),

  getSubtotal: () => {
    // Single-pass O(n)
    const { items } = get();
    let total = 0;
    for (const item of items) {
      total += item.price * item.quantity;
    }
    return total;
  },

  getItemCount: () => {
    const { items } = get();
    let count = 0;
    for (const item of items) {
      count += item.quantity;
    }
    return count;
  },

  clearCart: () => set(initialState),
}));
