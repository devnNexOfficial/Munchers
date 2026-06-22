'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'

import { Minus, Plus } from 'lucide-react'

import { BurgerCanvas } from '@/components/customizer/BurgerCanvas'
import { PizzaCanvas } from '@/components/customizer/PizzaCanvas'
import { RollCanvas } from '@/components/customizer/RollCanvas'
import { SimpleItemSelector } from '@/components/customizer/SimpleItemSelector'
import type {
  CustomizerIngredient as Ingredient,
  IngredientCategory,
} from '@/lib/layerConfig'
import { createClient } from '@/lib/supabase/client'
import { useCustomizerStore } from '@/store/useCustomizerStore'

type CanvasType = 'burger' | 'pizza' | 'roll' | 'simple'

interface MenuItemData {
  id: string
  name: string
  basePrice: number
  basePrepTime: number
  canvasType: CanvasType
}

interface IngredientRow {
  id: string
  name: string
  name_ur: string | null
  category: string
  png_image_url: string
  png_qty_low: string | null
  png_qty_medium: string | null
  png_qty_high: string | null
  z_index: number | null
  y_position: string | null
  width_ratio: string | null
  price_per_unit: number | string | null
  standard_unit: string | null
  max_limit: number | null
  extra_prep_time: number | null
  is_available: boolean | null
}

interface MenuItemIngredientRow {
  is_core: boolean | null
  is_required: boolean | null
  is_flexible: boolean | null
  default_qty: number | null
  max_qty: number | null
  sort_order: number | null
  ingredients: IngredientRow | IngredientRow[] | null
}

const categories: IngredientCategory[] = ['bun', 'patty', 'cheese', 'sauce', 'topping', 'drink', 'side']

function formatPrice(price: number) {
  return `Rs. ${Math.round(price)}`
}

function parseCanvasType(value: string | null): CanvasType {
  if (value === 'pizza' || value === 'roll' || value === 'simple') return value
  return 'burger'
}

function parseCategory(value: string): IngredientCategory {
  return categories.includes(value as IngredientCategory) ? (value as IngredientCategory) : 'topping'
}

function firstIngredient(row: MenuItemIngredientRow) {
  if (Array.isArray(row.ingredients)) return row.ingredients[0] ?? null
  return row.ingredients
}

function toNumber(value: number | string | null | undefined) {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number(value)
  return 0
}

function mapIngredient(row: MenuItemIngredientRow): Ingredient | null {
  const ingredient = firstIngredient(row)
  if (!ingredient) return null

  return {
    id: ingredient.id,
    name: ingredient.name,
    nameUr: ingredient.name_ur,
    category: parseCategory(ingredient.category),
    pngImageUrl: ingredient.png_image_url,
    pngQtyLow: ingredient.png_qty_low,
    pngQtyMedium: ingredient.png_qty_medium,
    pngQtyHigh: ingredient.png_qty_high,
    zIndex: ingredient.z_index ?? 5,
    yPosition: ingredient.y_position ?? '50%',
    widthRatio: ingredient.width_ratio ?? '80%',
    pricePerUnit: toNumber(ingredient.price_per_unit),
    standardUnit: ingredient.standard_unit ?? 'piece',
    maxLimit: row.max_qty ?? ingredient.max_limit ?? 3,
    isCore: row.is_core ?? false,
    isRequired: row.is_required ?? false,
    isFlexible: row.is_flexible ?? true,
    extraPrepTime: ingredient.extra_prep_time ?? 0,
    isAvailable: ingredient.is_available ?? true,
    sortOrder: row.sort_order ?? 0,
  }
}

function CanvasRouter({ canvasType, ingredients }: { canvasType: CanvasType; ingredients: Ingredient[] }) {
  if (canvasType === 'pizza') return <PizzaCanvas ingredients={ingredients} />
  if (canvasType === 'roll') return <RollCanvas ingredients={ingredients} />
  if (canvasType === 'simple') return <SimpleItemSelector ingredients={ingredients} />

  return <BurgerCanvas ingredients={ingredients} />
}

function IngredientPanel({ ingredients }: { ingredients: Ingredient[] }) {
  const selections = useCustomizerStore((state) => state.selections)
  const addItem = useCustomizerStore((state) => state.addItem)
  const removeItem = useCustomizerStore((state) => state.removeItem)
  const setItemQuantity = useCustomizerStore((state) => state.setItemQuantity)

  return (
    <aside className="space-y-3 overflow-y-auto bg-white p-4 md:max-h-[calc(100vh-8rem)]">
      <h2 className="text-sm font-black uppercase tracking-wide text-muncherz-black">Ingredients</h2>
      {ingredients.map((ingredient) => {
        const qty = selections[ingredient.id]?.qty ?? 0
        const isTopping = ingredient.category === 'topping'

        return (
          <article key={ingredient.id} className="rounded-lg border border-gray-100 p-3">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0">
                <Image src={ingredient.pngImageUrl} alt={ingredient.name} fill sizes="48px" className="object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-black text-muncherz-black">{ingredient.name}</h3>
                <p className="text-xs font-bold text-gray-500">{formatPrice(ingredient.pricePerUnit)}</p>
              </div>
            </div>

            {isTopping ? (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[1, 2, 3].map((tierQty) => (
                  <button
                    key={tierQty}
                    type="button"
                    onClick={() => setItemQuantity(ingredient.id, tierQty, ingredient.isCore)}
                    className={`rounded-full border px-2 py-1 text-xs font-black ${
                      qty === tierQty ? 'border-muncherz-red bg-muncherz-red text-white' : 'border-gray-200'
                    }`}
                  >
                    {tierQty === 1 ? 'Light' : tierQty === 2 ? 'Regular' : 'Extra'}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => removeItem(ingredient.id, ingredient.isCore || ingredient.isRequired)}
                  className="grid h-8 w-8 place-items-center rounded-full border border-gray-200"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <span className="text-sm font-black">{qty}</span>
                <button
                  type="button"
                  disabled={qty >= ingredient.maxLimit}
                  onClick={() => addItem(ingredient.id, ingredient.maxLimit, ingredient.isCore || ingredient.isRequired)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-muncherz-red text-white disabled:bg-gray-300"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </article>
        )
      })}
    </aside>
  )
}

function SummaryList({ item, ingredients }: { item: MenuItemData; ingredients: Ingredient[] }) {
  const selections = useCustomizerStore((state) => state.selections)
  const subtotal = useCustomizerStore((state) => state.calculateSubtotal(item.basePrice, ingredients))
  const prepTime = useCustomizerStore((state) => state.calculatePrepTime(item.basePrepTime, ingredients))
  const selected = ingredients.filter((ingredient) => (selections[ingredient.id]?.qty ?? 0) > 0)

  return (
    <aside className="space-y-4 bg-white p-4">
      <div>
        <h2 className="text-lg font-black text-muncherz-black">{item.name}</h2>
        <p className="text-sm font-bold text-gray-500">{prepTime} min prep</p>
      </div>
      <div className="space-y-3">
        {selected.map((ingredient) => {
          const qty = selections[ingredient.id]?.qty ?? 0
          return (
            <div key={ingredient.id} className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0">
                <Image src={ingredient.pngImageUrl} alt={ingredient.name} fill sizes="40px" className="object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-muncherz-black">{ingredient.name}</p>
                <p className="text-xs font-bold text-gray-500">x{qty}</p>
              </div>
              <span className="text-sm font-black text-muncherz-red">
                {formatPrice(ingredient.pricePerUnit * qty)}
              </span>
            </div>
          )
        })}
      </div>
      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between text-lg font-black">
          <span>Subtotal</span>
          <span className="text-muncherz-red">{formatPrice(subtotal)}</span>
        </div>
      </div>
    </aside>
  )
}

export default function CustomizePage() {
  const [item, setItem] = useState<MenuItemData | null>(null)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const resetCustomizer = useCustomizerStore((state) => state.resetCustomizer)
  const setItemQuantity = useCustomizerStore((state) => state.setItemQuantity)
  const itemId = useMemo(() => {
    if (typeof window === 'undefined') return null
    return new URLSearchParams(window.location.search).get('itemId')
  }, [])

  useEffect(() => {
    async function fetchCustomizerData() {
      if (!itemId) {
        setIsLoading(false)
        return
      }

      const supabase = createClient()
      const { data: itemData } = await supabase
        .from('menu_items')
        .select('id, name_en, base_price, base_prep_time, canvas_type')
        .eq('id', itemId)
        .maybeSingle()

      const { data: ingredientRows } = await supabase
        .from('menu_item_ingredients')
        .select(
          'is_core, is_required, is_flexible, default_qty, max_qty, sort_order, ingredients:ingredient_id(id, name, name_ur, category, png_image_url, png_qty_low, png_qty_medium, png_qty_high, z_index, y_position, width_ratio, price_per_unit, standard_unit, max_limit, extra_prep_time, is_available)'
        )
        .eq('menu_item_id', itemId)
        .order('sort_order', { ascending: true })

      const menuItem = itemData as { id: string; name_en: string; base_price: number; base_prep_time: number | null; canvas_type: string | null } | null
      const mappedIngredients = ((ingredientRows ?? []) as MenuItemIngredientRow[])
        .map(mapIngredient)
        .filter((ingredient): ingredient is Ingredient => ingredient !== null)

      if (menuItem) {
        setItem({
          id: menuItem.id,
          name: menuItem.name_en,
          basePrice: menuItem.base_price,
          basePrepTime: menuItem.base_prep_time ?? 15,
          canvasType: parseCanvasType(menuItem.canvas_type),
        })
      }

      resetCustomizer()
      mappedIngredients.forEach((ingredient) => {
        if (ingredient.isCore || ingredient.isRequired) setItemQuantity(ingredient.id, 1, true)
      })
      setIngredients(mappedIngredients)
      setIsLoading(false)
    }

    fetchCustomizerData()
  }, [itemId, resetCustomizer, setItemQuantity])

  if (isLoading) return <main className="min-h-screen bg-muncherz-black" />

  if (!item) {
    return (
      <main className="grid min-h-screen place-items-center bg-muncherz-white p-6">
        <p className="text-center text-lg font-black text-muncherz-black">Choose an item to customize.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-muncherz-black">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 md:grid-cols-[280px_1fr_320px]">
        <IngredientPanel ingredients={ingredients} />
        <section className="grid place-items-center p-4 md:p-8">
          <CanvasRouter canvasType={item.canvasType} ingredients={ingredients} />
        </section>
        <SummaryList item={item} ingredients={ingredients} />
      </div>
    </main>
  )
}
