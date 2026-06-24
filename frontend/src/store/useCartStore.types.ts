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

export interface CartState {
  cartItems: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, qty: number, maxQty?: number) => void
  updateSpecialInstructions: (cartItemId: string, text: string) => void
  addMealToItem: (cartItemId: string, meal: SelectedMealOption[]) => void
  removeMealFromItem: (cartItemId: string) => void
  updateItem: (cartItemId: string, updatedItem: Partial<CartItem>) => void
  clearCart: () => void
  getSubtotal: () => number
  getItemCount: () => number
}

