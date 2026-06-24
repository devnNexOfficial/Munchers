'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRestaurantStatus } from '@/context/RestaurantStatusContext'
import { useItemDetailModal } from '@/hooks/useItemDetailModal'
import { createClient } from '@/lib/supabase/client'
import type { Category, MenuItem } from '@/lib/queries/home'

import { CategoryTabs } from './CategoryTabs'
import { ItemCard } from './ItemCard'
import { ItemDetailModal } from './ItemDetailModal'
import { SearchBar } from './SearchBar'

interface ItemGridProps {
  initialCategories: Category[]
  initialItems: Record<string, MenuItem[]>
}

const menuItemSelect =
  'id, name_en, description_en, image_url, base_price, discount_price, show_discount, category_id, is_best_seller, is_chefs_pick, canvas_type, daily_special, special_ends_at, size_variants, cooking_preference_options'

async function fetchItemsByCategory(categoryId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('menu_items')
    .select(menuItemSelect)
    .eq('category_id', categoryId)
    .eq('is_published', true)

  if (error) {
    console.error(`Error fetching menu items for category ${categoryId}:`, error)
    return []
  }

  return (data ?? []) as MenuItem[]
}

export function ItemGrid({ initialCategories, initialItems }: ItemGridProps) {
  const firstCategoryId = initialCategories[0]?.id ?? ''
  const [activeCategory, setActiveCategory] = useState(firstCategoryId)
  const [itemsByCategory, setItemsByCategory] =
    useState<Record<string, MenuItem[]>>(initialItems)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { isRestaurantClosed } = useRestaurantStatus()
  const { isOpen, selectedItem, openModal, closeModal } = useItemDetailModal()

  const loadCategory = useCallback(
    async (categoryId: string) => {
      if (!categoryId || itemsByCategory[categoryId]) return

      setIsLoading(true)
      const items = await fetchItemsByCategory(categoryId)
      setItemsByCategory((current) => ({ ...current, [categoryId]: items }))
      setIsLoading(false)
    },
    [itemsByCategory]
  )

  useEffect(() => {
    if (activeCategory) {
      void loadCategory(activeCategory)
    }
  }, [activeCategory, loadCategory])

  const activeItems = useMemo(
    () => itemsByCategory[activeCategory] ?? [],
    [activeCategory, itemsByCategory]
  )
  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase()
    if (!query) return activeItems

    return activeItems.filter((item) => item.name_en.toLowerCase().includes(query))
  }, [activeItems, searchQuery])

  const frequentlyAdded = useMemo(
    () =>
      activeItems.filter(
        (item) => item.is_best_seller || item.is_chefs_pick || item.daily_special
      ),
    [activeItems]
  )

  function handleCategoryChange(categoryId: string) {
    setActiveCategory(categoryId)
  }

  if (initialCategories.length === 0) {
    return (
      <section className="px-4 py-10 text-center text-sm font-medium text-gray-500">
        No items found
      </section>
    )
  }

  return (
    <section className="bg-muncherz-white pb-10">
      <SearchBar onSearch={setSearchQuery} />
      <CategoryTabs
        categories={initialCategories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {frequentlyAdded.length > 0 && (
        <div className="pt-3">
          <h2 className="px-4 text-base font-extrabold text-muncherz-black">
            Frequently Added
          </h2>
          <div className="hide-scrollbar mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
            {frequentlyAdded.map((item) => (
              <div key={item.id} className="w-40 flex-none snap-start sm:w-48">
                <ItemCard
                  item={item}
                  isRestaurantClosed={isRestaurantClosed}
                  onOpenDetail={openModal}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 pt-5">
        {isLoading ? (
          <p className="py-10 text-center text-sm font-medium text-gray-500">
            Loading items...
          </p>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                isRestaurantClosed={isRestaurantClosed}
                onOpenDetail={openModal}
              />
            ))}
          </div>
        ) : (
          <p className="py-10 text-center text-sm font-medium text-gray-500">
            No items found
          </p>
        )}
      </div>
      <ItemDetailModal
        item={selectedItem}
        isOpen={isOpen}
        onClose={closeModal}
        isRestaurantClosed={isRestaurantClosed}
      />
    </section>
  )
}
