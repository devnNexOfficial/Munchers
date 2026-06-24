'use client'

/**
 * HOOK: useMealSelector
 * PURPOSE:   Manages the meal add-on popup state, fetches available meal
 *            options from the API, and tracks the user's selections.
 * DEPENDENCIES: fetch (browser), /api/menu/meal-options endpoint
 * SIDE EFFECTS: Fetches from /api/menu/meal-options on openMealSelector().
 * PERFORMANCE: totalMealPrice is memoized — only recalculates when selectedOptions changes.
 *
 * ENCAPSULATION: Internal fetch logic, data mapping, and validation helpers are
 *   NOT exported. Callers receive only:
 *   { isOpen, openMealSelector, closeMealSelector, selectedOptions,
 *     totalMealPrice, mealOptions, activeItem, setSelectedOptions }
 *
 * @example
 * const { isOpen, openMealSelector, closeMealSelector } = useMealSelector()
 * // In a button handler:
 * await openMealSelector({ id: item.id, name: item.name })
 */

import { useMemo, useState } from 'react'

// ---------------------------------------------------------------------------
// Public types (exported — used by CartItem and MealSelector component)
// ---------------------------------------------------------------------------

export interface MealOption {
  id: string
  menuItemId: string
  nameEn: string
  nameUr: string | null
  imageUrl: string | null
  extraPrice: number
  isCustomizable: boolean
  sortOrder: number
}

export interface SelectedMealOption {
  optionId: string
  nameEn: string
  quantity: number
  extraPrice: number
}

// ---------------------------------------------------------------------------
// Private types (not exported — internal implementation details)
// ---------------------------------------------------------------------------

interface MealSelectorItem {
  id: string
  name: string
}

/** Raw row shape returned by the /api/menu/meal-options endpoint */
interface MealOptionRow {
  id: string
  menu_item_id: string
  name_en: string
  name_ur: string | null
  image_url: string | null
  extra_price: number | string | null
  is_customizable: boolean | null
  sort_order: number | null
}

// ---------------------------------------------------------------------------
// Private helpers (not exported — encapsulation)
// ---------------------------------------------------------------------------

/** Type guard for unknown API response rows */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** Safely coerces number-or-string to number; returns 0 on failure */
function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number(value)
  return 0
}

/** Type guard ensuring a raw API row has the minimum required fields */
function isMealOptionRow(value: unknown): value is MealOptionRow {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.menu_item_id === 'string' &&
    typeof value.name_en === 'string'
  )
}

/**
 * Maps a raw DB row to the MealOption domain type.
 * Centralised here so the API response shape is only known in one place.
 */
function mapMealOption(row: MealOptionRow): MealOption {
  return {
    id: row.id,
    menuItemId: row.menu_item_id,
    nameEn: row.name_en,
    nameUr: row.name_ur,
    imageUrl: row.image_url,
    extraPrice: toNumber(row.extra_price),
    isCustomizable: row.is_customizable ?? false,
    sortOrder: row.sort_order ?? 0,
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useMealSelector(): {
  isOpen: boolean
  openMealSelector: (item: MealSelectorItem) => Promise<void>
  closeMealSelector: () => void
  selectedOptions: SelectedMealOption[]
  totalMealPrice: number
  mealOptions: MealOption[]
  activeItem: MealSelectorItem | null
  setSelectedOptions: (nextOptions: SelectedMealOption[]) => void
} {
  const [isOpen, setIsOpen] = useState(false)
  const [mealOptions, setMealOptions] = useState<MealOption[]>([])
  const [selectedOptions, setSelectedOptions] = useState<SelectedMealOption[]>([])
  const [activeItem, setActiveItem] = useState<MealSelectorItem | null>(null)

  /**
   * Total price contribution of the selected meal options.
   * MEMOIZED: only recalculates when selectedOptions array changes.
   */
  const totalMealPrice = useMemo(() => {
    return selectedOptions.reduce(
      (total, option) => total + option.quantity * option.extraPrice,
      0
    )
  }, [selectedOptions])

  /**
   * Opens the meal selector modal and fetches available options for the item.
   * Resets previous selections on each open.
   * TODO: Replace with real Supabase query — backend Section 2
   */
  async function openMealSelector(item: MealSelectorItem): Promise<void> {
    setActiveItem(item)
    setIsOpen(true)
    setSelectedOptions([])

    try {
      const response = await fetch(`/api/menu/meal-options?itemId=${item.id}`)

      // 404 = item has no meal options — not an error
      if (response.status === 404) {
        setMealOptions([])
        return
      }

      if (!response.ok) {
        throw new Error(`Couldn't load meal options — server returned ${response.status}`)
      }

      const payload: unknown = await response.json()
      const rows = Array.isArray(payload) ? payload : []
      setMealOptions(rows.filter(isMealOptionRow).map(mapMealOption))
    } catch (error) {
      // Meal options unavailable — not fatal, user can still add the item without a meal
      console.error('[useMealSelector] Meal options unavailable:', error)
      setMealOptions([])
    }
  }

  function closeMealSelector(): void {
    setIsOpen(false)
  }

  return {
    isOpen,
    openMealSelector,
    closeMealSelector,
    selectedOptions,
    totalMealPrice,
    mealOptions,
    activeItem,
    // Renamed from rememberSelectedOptions → setSelectedOptions (clearer, self-documenting)
    setSelectedOptions,
  }
}
