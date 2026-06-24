export const LAYER_CONFIG_DEFAULTS = {
  bottom_bun: { zIndex: 1, yPosition: '75%', widthRatio: '100%' },
  patty: { zIndex: 2, yPosition: '60%', widthRatio: '85%' },
  cheese: { zIndex: 3, yPosition: '52%', widthRatio: '90%' },
  sauce: { zIndex: 4, yPosition: '48%', widthRatio: '82%' },
  topping: { zIndex: 5, yPosition: '44%', widthRatio: '78%' },
  top_bun: { zIndex: 10, yPosition: '20%', widthRatio: '100%' },
} as const

export type IngredientCategory =
  | 'bun'
  | 'patty'
  | 'cheese'
  | 'sauce'
  | 'topping'
  | 'drink'
  | 'side'

export type IngredientLayerRole =
  | 'bottom_bun'
  | 'patty'
  | 'cheese'
  | 'sauce'
  | 'topping'
  | 'top_bun'

export interface IngredientLayerConfig {
  zIndex: number
  yPosition: string
  widthRatio: string
}

export interface CustomizerIngredient {
  id: string
  name: string
  nameUr: string | null
  category: IngredientCategory
  pngImageUrl: string
  pngQtyLow: string | null
  pngQtyMedium: string | null
  pngQtyHigh: string | null
  zIndex: number
  yPosition: string
  widthRatio: string
  pricePerUnit: number
  standardUnit: string
  maxLimit: number
  isCore: boolean
  isRequired: boolean
  isFlexible: boolean
  extraPrepTime: number
  isAvailable: boolean
  sortOrder: number
}

export interface IngredientSelection {
  ingredientId: string
  qty: number
  isCore: boolean
  tier?: 'low' | 'medium' | 'high'
}

export function getLayerRole(
  ingredient: Pick<CustomizerIngredient, 'category' | 'zIndex'>
): IngredientLayerRole {
  if (ingredient.category === 'bun') {
    return ingredient.zIndex >= LAYER_CONFIG_DEFAULTS.top_bun.zIndex ? 'top_bun' : 'bottom_bun'
  }

  if (ingredient.category === 'patty') return 'patty'
  if (ingredient.category === 'cheese') return 'cheese'
  if (ingredient.category === 'sauce') return 'sauce'

  return 'topping'
}

export function getLayerConfig(ingredient: CustomizerIngredient): IngredientLayerConfig {
  const role = getLayerRole(ingredient)
  const fallback = LAYER_CONFIG_DEFAULTS[role]

  return {
    zIndex: ingredient.category === 'bun' && role === 'top_bun' ? 10 : ingredient.zIndex || fallback.zIndex,
    yPosition: ingredient.yPosition || fallback.yPosition,
    widthRatio: ingredient.widthRatio || fallback.widthRatio,
  }
}
