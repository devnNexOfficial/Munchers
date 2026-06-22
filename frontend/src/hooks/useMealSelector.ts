'use client'

import { useMemo, useState } from 'react'

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

interface MealSelectorItem {
  id: string
  name: string
}

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toNumber(value: unknown) {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number(value)
  return 0
}

function isMealOptionRow(value: unknown): value is MealOptionRow {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.menu_item_id === 'string' &&
    typeof value.name_en === 'string'
  )
}

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

export function useMealSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [mealOptions, setMealOptions] = useState<MealOption[]>([])
  const [selectedOptions, setSelectedOptions] = useState<SelectedMealOption[]>([])
  const [activeItem, setActiveItem] = useState<MealSelectorItem | null>(null)

  const totalMealPrice = useMemo(() => {
    return selectedOptions.reduce(
      (total, option) => total + option.quantity * option.extraPrice,
      0
    )
  }, [selectedOptions])

  async function openMealSelector(item: MealSelectorItem) {
    setActiveItem(item)
    setIsOpen(true)
    setSelectedOptions([])

    try {
      // TODO: wire to real API — backend Section 2
      const response = await fetch(`/api/menu/meal-options?itemId=${item.id}`)
      if (response.status === 404) {
        setMealOptions([])
        return
      }

      if (!response.ok) throw new Error('Unable to fetch meal options')

      const payload: unknown = await response.json()
      const rows = Array.isArray(payload) ? payload : []
      setMealOptions(rows.filter(isMealOptionRow).map(mapMealOption))
    } catch (error) {
      console.error('Meal options unavailable:', error)
      setMealOptions([])
    }
  }

  function closeMealSelector() {
    setIsOpen(false)
  }

  function rememberSelectedOptions(nextOptions: SelectedMealOption[]) {
    setSelectedOptions(nextOptions)
  }

  return {
    isOpen,
    openMealSelector,
    closeMealSelector,
    selectedOptions,
    totalMealPrice,
    mealOptions,
    activeItem,
    rememberSelectedOptions,
  }
}
