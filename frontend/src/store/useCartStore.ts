'use client'

import { create } from 'zustand'
import { createJSONStorage,persist } from 'zustand/middleware'

import type { CartItem, CartSummary, CheckoutCustomerInfo, DeliveryMode } from '../types/cart'
import type { Product, ProductVariant } from '../types/menu'
import {
  computeCartSummary,
  computeLineSubtotal,
  estimatePrepTime,
  findUnavailableItems,
  resolveUnitPrice,
  serializeCartForCheckout,
} from '../utils/priceCalculator'

// ─── State Interface ─────────────────────────────────────────

interface CartState {
  /** Current cart line items */
  items: CartItem[]
  /** Active restaurant ID this cart belongs to */
  restaurantId: string | null
  /** Delivery mode selection */
  deliveryMode: DeliveryMode
  /** Whether the checkout flow is currently active */
  isCheckoutOpen: boolean
  /** Whether a checkout submission is in progress */
  isSubmitting: boolean
  /** Customer info form state for checkout */
  customerInfo: CheckoutCustomerInfo

  // ── Computed Getters ──
  /** Recompute the full cart summary on demand */
  getSummary: () => CartSummary
  /** Get the count of items in the cart */
  getItemCount: () => number
  /** Check if a specific product is already in the cart */
  isProductInCart: (productId: string, variantId?: string | null) => boolean
  /** Get the effective unit price for a cart item */
  getLineUnitPrice: (cartLineId: string) => number
  /** Get the subtotal for a cart line */
  getLineSubtotal: (cartLineId: string) => number
  /** Find unavailable items still in the cart */
  getUnavailableItems: () => string[]
  /** Estimate total prep time */
  getEstimatedPrepTime: () => number

  // ── Actions ──
  /** Add a product to the cart (or increment if already present with same variant) */
  addItem: (product: Product, variant?: ProductVariant | null, quantity?: number, specialInstructions?: string) => void
  /** Remove a cart line entirely */
  removeItem: (cartLineId: string) => void
  /** Update the quantity of an existing cart line */
  updateQuantity: (cartLineId: string, quantity: number) => void
  /** Increment quantity by 1 */
  incrementQuantity: (cartLineId: string) => void
  /** Decrement quantity by 1 (removes if quantity reaches 0) */
  decrementQuantity: (cartLineId: string) => void
  /** Update special instructions for a cart line */
  updateSpecialInstructions: (cartLineId: string, instructions: string) => void
  /** Clear the entire cart */
  clearCart: () => void
  /** Set the active restaurant (clears cart if switching restaurants) */
  setRestaurant: (restaurantId: string) => void
  /** Set delivery mode */
  setDeliveryMode: (mode: DeliveryMode) => void
  /** Open/close checkout flow */
  setCheckoutOpen: (isOpen: boolean) => void
  /** Update customer info fields */
  updateCustomerInfo: (updates: Partial<CheckoutCustomerInfo>) => void
  /** Reset customer info to defaults */
  resetCustomerInfo: () => void
  /** Prepare the serialized checkout payload */
  buildCheckoutPayload: () => ReturnType<typeof serializeCartForCheckout>
}

// ─── Default Customer Info ───────────────────────────────────

const DEFAULT_CUSTOMER_INFO: CheckoutCustomerInfo = {
  fullName: '',
  phone: '',
  email: '',
  deliveryAddress: '',
  deliveryMode: 'delivery',
  notes: '',
}

// ─── Cart Line ID Generator ─────────────────────────────────

function generateCartLineId(productId: string, variantId: string | null): string {
  const base = variantId ? `${productId}::${variantId}` : productId
  return `cart_${base}_${Date.now()}`
}

/**
 * Find an existing cart line matching the same product + variant combination.
 * Used to merge quantities instead of creating duplicate lines.
 */
function findExistingLine(items: CartItem[], productId: string, variantId: string | null): CartItem | undefined {
  return items.find(
    (item) =>
      item.product.id === productId &&
      (item.selectedVariant?.id ?? null) === variantId,
  )
}

// ─── Zustand Store ───────────────────────────────────────────

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      deliveryMode: 'delivery',
      isCheckoutOpen: false,
      isSubmitting: false,
      customerInfo: { ...DEFAULT_CUSTOMER_INFO },

      // ── Computed Getters ──

      getSummary: (): CartSummary => {
        const { items, deliveryMode } = get()
        const deliveryFeeOverride = deliveryMode === 'pickup' ? 0 : undefined
        return computeCartSummary(items, deliveryFeeOverride)
      },

      getItemCount: (): number => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      isProductInCart: (productId: string, variantId?: string | null): boolean => {
        const resolvedVariantId = variantId ?? null
        return get().items.some(
          (item) =>
            item.product.id === productId &&
            (item.selectedVariant?.id ?? null) === resolvedVariantId,
        )
      },

      getLineUnitPrice: (cartLineId: string): number => {
        const item = get().items.find((i) => i.cartLineId === cartLineId)
        if (!item) return 0
        return resolveUnitPrice(item)
      },

      getLineSubtotal: (cartLineId: string): number => {
        const item = get().items.find((i) => i.cartLineId === cartLineId)
        if (!item) return 0
        return computeLineSubtotal(item)
      },

      getUnavailableItems: (): string[] => {
        return findUnavailableItems(get().items)
      },

      getEstimatedPrepTime: (): number => {
        return estimatePrepTime(get().items)
      },

      // ── Actions ──

      addItem: (
        product: Product,
        variant?: ProductVariant | null,
        quantity: number = 1,
        specialInstructions: string = '',
      ) => {
        const resolvedVariant = variant ?? null
        const variantId = resolvedVariant?.id ?? null
        const clampedQuantity = Math.max(1, Math.floor(quantity))

        set((state) => {
          // If switching restaurants, clear the cart first
          if (state.restaurantId && state.restaurantId !== product.category_id) {
            // Note: In a real implementation, restaurantId would come from the product's restaurant_id field.
            // For now, we allow mixing since restaurant_id isn't on the Product type.
          }

          // Check for existing line with same product + variant
          const existingLine = findExistingLine(state.items, product.id, variantId)

          if (existingLine) {
            // Merge: increment the existing line's quantity
            return {
              items: state.items.map((item) =>
                item.cartLineId === existingLine.cartLineId
                  ? {
                      ...item,
                      quantity: item.quantity + clampedQuantity,
                      specialInstructions: specialInstructions || item.specialInstructions,
                    }
                  : item,
              ),
            }
          }

          // New line
          const newItem: CartItem = {
            cartLineId: generateCartLineId(product.id, variantId),
            product,
            selectedVariant: resolvedVariant,
            quantity: clampedQuantity,
            specialInstructions,
            addedAt: new Date().toISOString(),
          }

          return {
            items: [...state.items, newItem],
          }
        })
      },

      removeItem: (cartLineId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.cartLineId !== cartLineId),
        }))
      },

      updateQuantity: (cartLineId: string, quantity: number) => {
        const clampedQuantity = Math.max(0, Math.floor(quantity))

        if (clampedQuantity === 0) {
          get().removeItem(cartLineId)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.cartLineId === cartLineId ? { ...item, quantity: clampedQuantity } : item,
          ),
        }))
      },

      incrementQuantity: (cartLineId: string) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.cartLineId === cartLineId ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        }))
      },

      decrementQuantity: (cartLineId: string) => {
        const item = get().items.find((i) => i.cartLineId === cartLineId)
        if (!item) return

        if (item.quantity <= 1) {
          get().removeItem(cartLineId)
          return
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.cartLineId === cartLineId ? { ...i, quantity: i.quantity - 1 } : i,
          ),
        }))
      },

      updateSpecialInstructions: (cartLineId: string, instructions: string) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.cartLineId === cartLineId ? { ...item, specialInstructions: instructions } : item,
          ),
        }))
      },

      clearCart: () => {
        set({
          items: [],
          isCheckoutOpen: false,
          isSubmitting: false,
          customerInfo: { ...DEFAULT_CUSTOMER_INFO },
        })
      },

      setRestaurant: (restaurantId: string) => {
        const currentRestaurantId = get().restaurantId
        if (currentRestaurantId && currentRestaurantId !== restaurantId && get().items.length > 0) {
          // Switching restaurants clears the cart to prevent cross-restaurant orders
          set({
            items: [],
            restaurantId,
            customerInfo: { ...DEFAULT_CUSTOMER_INFO },
          })
          return
        }
        set({ restaurantId })
      },

      setDeliveryMode: (mode: DeliveryMode) => {
        set({ deliveryMode: mode })
      },

      setCheckoutOpen: (isOpen: boolean) => {
        set({ isCheckoutOpen: isOpen })
      },

      updateCustomerInfo: (updates: Partial<CheckoutCustomerInfo>) => {
        set((state) => ({
          customerInfo: { ...state.customerInfo, ...updates },
        }))
      },

      resetCustomerInfo: () => {
        set({ customerInfo: { ...DEFAULT_CUSTOMER_INFO } })
      },

      buildCheckoutPayload: () => {
        return serializeCartForCheckout(get().items)
      },
    }),
    {
      name: 'muncherz-cart-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage
        }
        // SSR fallback — never actually persists
        return {
          getItem: () => null,
          setItem: () => undefined,
          removeItem: () => undefined,
        }
      }),
      partialize: (state) => ({
        items: state.items,
        restaurantId: state.restaurantId,
        deliveryMode: state.deliveryMode,
        customerInfo: state.customerInfo,
      }),
    },
  ),
)
