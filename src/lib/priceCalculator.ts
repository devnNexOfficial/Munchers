import { OrderPlacementPayload } from '@/types/order'

export interface MenuItemData {
  id: string
  base_price: number
  size_variants: any
  base_prep_time: number
}

export interface MenuItemIngredientData {
  ingredient_id: string
  is_required: boolean
  max_limit: number
}

export interface IngredientData {
  id: string
  price_per_unit: number
  extra_prep_time: number
  is_available: boolean
}

export interface RestaurantSettings {
  gst_enabled: boolean
  gst_percent: number
  delivery_charge: number
  prep_buffer_minutes: number
}

export interface MealAdditionConfig {
  item: string
  price: number
}

export type CalculationResult = {
  subtotal: number
  total: number
  gstAmount: number
  deliveryCharge: number
  prepTimeMinutes: number
  complexity: 'green' | 'yellow' | 'red'
  validationErrors: string[]
}

export function calculateOrderPrice(
  payload: OrderPlacementPayload,
  menuItems: Record<string, MenuItemData>,
  menuItemIngredientsMap: Record<string, MenuItemIngredientData[]>,
  ingredients: Record<string, IngredientData>,
  settings: RestaurantSettings,
  validMealAdditions: MealAdditionConfig[]
): CalculationResult {
  let subtotal = 0
  let totalPrepTime = 0
  let totalCustomizations = 0
  const validationErrors: string[] = []

  for (const item of payload.items) {
    const menuItem = menuItems[item.menuItemId]
    if (!menuItem) {
      validationErrors.push(`Menu item not found: ${item.menuItemId}`)
      continue
    }

    let itemPrice = Number(menuItem.base_price)
    let itemPrepTime = menuItem.base_prep_time || 0

    if (item.sizeLabel && menuItem.size_variants) {
      const sizeVariant = (menuItem.size_variants as any[]).find(v => v.label === item.sizeLabel)
      if (sizeVariant && sizeVariant.price) {
        itemPrice = Number(sizeVariant.price)
      }
    }

    const requiredIngs = (menuItemIngredientsMap[item.menuItemId] || []).filter(mi => mi.is_required)
    for (const req of requiredIngs) {
      const found = item.customizations.find(c => c.ingredientId === req.ingredient_id)
      if (!found || found.quantity < 1) {
        validationErrors.push(`Missing required ingredient ${req.ingredient_id} for menu item ${item.menuItemId}`)
      }
    }

    for (const custom of item.customizations) {
      totalCustomizations += custom.quantity
      const dbIng = ingredients[custom.ingredientId]
      if (!dbIng) {
        validationErrors.push(`Ingredient not found: ${custom.ingredientId}`)
        continue
      }
      if (!dbIng.is_available) {
        validationErrors.push(`Ingredient not available: ${custom.ingredientId}`)
      }

      const miIng = (menuItemIngredientsMap[item.menuItemId] || []).find(mi => mi.ingredient_id === custom.ingredientId)
      if (miIng && miIng.max_limit && custom.quantity > miIng.max_limit) {
        validationErrors.push(`Quantity exceeds max limit for ingredient ${custom.ingredientId}`)
      }

      itemPrice += Number(dbIng.price_per_unit) * custom.quantity
      itemPrepTime += (dbIng.extra_prep_time || 0) * custom.quantity
    }

    if (item.mealAdditions) {
      for (const mealAdd of item.mealAdditions) {
        const validMeal = validMealAdditions.find(m => m.item === mealAdd.item)
        if (!validMeal) {
          validationErrors.push(`Invalid meal addition: ${mealAdd.item}`)
          continue
        }
        itemPrice += Number(validMeal.price)
      }
    }

    subtotal += itemPrice * item.quantity
    totalPrepTime += itemPrepTime * item.quantity
  }

  const deliveryCharge = payload.orderType === 'delivery' ? Number(settings.delivery_charge) : 0
  const gstAmount = settings.gst_enabled ? (subtotal * Number(settings.gst_percent)) / 100 : 0
  const total = subtotal + deliveryCharge + gstAmount

  let complexity: 'green' | 'yellow' | 'red' = 'green'
  if (totalCustomizations >= 6) complexity = 'red'
  else if (totalCustomizations >= 3) complexity = 'yellow'

  return {
    subtotal: Number(subtotal.toFixed(2)),
    total: Number(total.toFixed(2)),
    gstAmount: Number(gstAmount.toFixed(2)),
    deliveryCharge: Number(deliveryCharge.toFixed(2)),
    prepTimeMinutes: totalPrepTime + settings.prep_buffer_minutes,
    complexity,
    validationErrors
  }
}
