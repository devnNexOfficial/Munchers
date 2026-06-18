'use client'

import { create } from 'zustand'

import { supabase } from '../lib/supabase'
import type { Category, Product, ProductVariant } from '../types/menu'

interface DbMenuItem {
  id: string
  category_id: string
  name: string
  name_ur?: string | null
  description?: string | null
  description_ur?: string | null
  base_price: string | number
  image_url?: string | null
  is_available?: boolean
  size_variants?: unknown
  discount_price?: string | number | null
  show_discount?: boolean
  canvas_type?: 'burger' | 'pizza' | 'roll' | 'simple'
  base_prep_time?: number
  is_featured?: boolean
  is_best_seller?: boolean
  with_meal?: boolean
  meal_options?: unknown
  daily_special?: boolean
  special_ends_at?: string | null
  sort_order?: number
  created_at?: string
  updated_at?: string
}

interface MenuState {
  categories: Category[]
  products: Product[]
  isLoadingMenu: boolean
  activeCategory: string | null
  setActiveCategory: (categoryId: string | null) => void
  fetchMenuData: (restaurantId: string) => Promise<void>
  createCategoryAction: (name: string, restaurantId: string) => Promise<void>
  upsertProductAction: (productData: Partial<Product> & { variants?: ProductVariant[] }) => Promise<void>
  toggleProductAvailabilityAction: (productId: string, isAvailable: boolean) => Promise<void>
}

export const useMenuStore = create<MenuState>((set) => ({
  categories: [],
  products: [],
  isLoadingMenu: false,
  activeCategory: null,

  setActiveCategory: (categoryId: string | null) => set({ activeCategory: categoryId }),

  fetchMenuData: async (restaurantId: string) => {
    set({ isLoadingMenu: true })
    try {
      // Fetch categories
      const catQuery = supabase.from('categories').select('*').order('sort_order', { ascending: true })
      
      // Attempt filtering by restaurant_id if multi-tenancy is active
      let catResult = await catQuery
      if (restaurantId && catResult.data && catResult.data.length > 0 && 'restaurant_id' in catResult.data[0]) {
        catResult = await supabase
          .from('categories')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('sort_order', { ascending: true })
      }

      // Fetch products (menu_items)
      const prodQuery = supabase.from('menu_items').select('*').order('sort_order', { ascending: true })
      let prodResult = await prodQuery
      
      if (restaurantId && prodResult.data && prodResult.data.length > 0 && 'restaurant_id' in prodResult.data[0]) {
        prodResult = await supabase
          .from('menu_items')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('sort_order', { ascending: true })
      }

      const fetchedCategories = (catResult.data || []) as Category[]
      const fetchedProductsData = prodResult.data || []

      const fetchedProducts: Product[] = (fetchedProductsData as DbMenuItem[]).map((item) => ({
        id: item.id,
        category_id: item.category_id,
        name: item.name,
        name_ur: item.name_ur ?? undefined,
        description: item.description ?? '',
        description_ur: item.description_ur ?? undefined,
        base_price: Number(item.base_price),
        image_url: item.image_url ?? '',
        is_available: !!item.is_available,
        variants: Array.isArray(item.size_variants)
          ? (item.size_variants as Record<string, unknown>[]).map((v, index: number) => ({
              id: String(v.id || `${item.id}-v-${index}`),
              name: String(v.label || v.name || 'Variant'),
              price_override: Number(v.price ?? v.price_override ?? 0),
            }))
          : [],
        discount_price: item.discount_price ? Number(item.discount_price) : undefined,
        show_discount: !!item.show_discount,
        canvas_type: item.canvas_type,
        base_prep_time: item.base_prep_time,
        is_featured: !!item.is_featured,
        is_best_seller: !!item.is_best_seller,
        with_meal: !!item.with_meal,
        meal_options: item.meal_options,
        daily_special: !!item.daily_special,
        special_ends_at: item.special_ends_at ?? undefined,
        sort_order: item.sort_order,
        created_at: item.created_at,
        updated_at: item.updated_at ?? undefined,
      }))

      set({
        categories: fetchedCategories,
        products: fetchedProducts,
        activeCategory: fetchedCategories[0]?.id || null,
      })
    } catch (error) {
      console.error('Error fetching menu data:', error)
    } finally {
      set({ isLoadingMenu: false })
    }
  },

  createCategoryAction: async (name: string, restaurantId: string) => {
    set({ isLoadingMenu: true })
    try {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')

      const insertPayload: Record<string, unknown> = {
        name,
        slug,
        sort_order: 0,
        is_active: true,
      }

      // Check if schema expects restaurant_id
      if (restaurantId) {
        insertPayload.restaurant_id = restaurantId
      }

      const { data, error } = await supabase.from('categories').insert([insertPayload]).select()

      if (error) {
        // Fallback: If restaurant_id isn't in DB schema, attempt to insert without it
        if (error.message?.includes('restaurant_id') || error.code === 'PGRST116') {
          const fallbackPayload = { ...insertPayload }
          delete fallbackPayload.restaurant_id
          const fallbackResult = await supabase.from('categories').insert([fallbackPayload]).select()
          if (fallbackResult.error) throw fallbackResult.error
          
          const newCategory = fallbackResult.data?.[0] as Category
          if (newCategory) {
            set((state) => ({
              categories: [...state.categories, newCategory],
              activeCategory: state.activeCategory || newCategory.id,
            }))
          }
          return
        }
        throw error
      }

      const newCategory = data?.[0] as Category
      if (newCategory) {
        set((state) => ({
          categories: [...state.categories, newCategory],
          activeCategory: state.activeCategory || newCategory.id,
        }))
      }
    } catch (error) {
      console.error('Error creating category:', error)
      throw error
    } finally {
      set({ isLoadingMenu: true }) // Set false in the caller's layout to end loading properly
      set({ isLoadingMenu: false })
    }
  },

  upsertProductAction: async (productData: Partial<Product> & { variants?: ProductVariant[] }) => {
    set({ isLoadingMenu: true })
    try {
      const sizeVariants = Array.isArray(productData.variants)
        ? productData.variants.map((v) => ({
            id: v.id || crypto.randomUUID(),
            label: v.name,
            price: Number(v.price_override),
          }))
        : null

      const mappedPayload: Record<string, unknown> = {
        category_id: productData.category_id,
        name: productData.name,
        description: productData.description ?? '',
        base_price: Number(productData.base_price),
        image_url: productData.image_url ?? '',
        is_available: productData.is_available ?? true,
        size_variants: sizeVariants,
      }

      if (productData.id) {
        // Update product
        const { data, error } = await supabase
          .from('menu_items')
          .update(mappedPayload)
          .eq('id', productData.id)
          .select()

        if (error) throw error

        const updatedItem = data?.[0]
        if (updatedItem) {
          set((state) => ({
            products: state.products.map((p) =>
              p.id === updatedItem.id
                ? {
                    ...p,
                    ...updatedItem,
                    base_price: Number(updatedItem.base_price),
                    variants: Array.isArray(updatedItem.size_variants)
                      ? (updatedItem.size_variants as Record<string, unknown>[]).map((v, index: number) => ({
                          id: String(v.id || `${updatedItem.id}-v-${index}`),
                          name: String(v.label || v.name || 'Variant'),
                          price_override: Number(v.price ?? v.price_override ?? 0),
                        }))
                      : [],
                  }
                : p
            ),
          }))
        }
      } else {
        // Insert product
        const { data, error } = await supabase.from('menu_items').insert([mappedPayload]).select()

        if (error) throw error

        const newItem = data?.[0]
        if (newItem) {
          const formattedNewItem: Product = {
            id: newItem.id,
            category_id: newItem.category_id,
            name: newItem.name,
            name_ur: newItem.name_ur,
            description: newItem.description ?? '',
            description_ur: newItem.description_ur,
            base_price: Number(newItem.base_price),
            image_url: newItem.image_url ?? '',
            is_available: !!newItem.is_available,
            variants: Array.isArray(newItem.size_variants)
              ? (newItem.size_variants as Record<string, unknown>[]).map((v, index: number) => ({
                  id: String(v.id || `${newItem.id}-v-${index}`),
                  name: String(v.label || v.name || 'Variant'),
                  price_override: Number(v.price ?? v.price_override ?? 0),
                }))
              : [],
            discount_price: newItem.discount_price ? Number(newItem.discount_price) : undefined,
            show_discount: !!newItem.show_discount,
            canvas_type: newItem.canvas_type,
            base_prep_time: newItem.base_prep_time,
            is_featured: !!newItem.is_featured,
            is_best_seller: !!newItem.is_best_seller,
            with_meal: !!newItem.with_meal,
            meal_options: newItem.meal_options,
            daily_special: !!newItem.daily_special,
            special_ends_at: newItem.special_ends_at,
            sort_order: newItem.sort_order,
            created_at: newItem.created_at,
            updated_at: newItem.updated_at,
          }

          set((state) => ({
            products: [...state.products, formattedNewItem],
          }))
        }
      }
    } catch (error) {
      console.error('Error upserting product:', error)
      throw error
    } finally {
      set({ isLoadingMenu: false })
    }
  },

  toggleProductAvailabilityAction: async (productId: string, isAvailable: boolean) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.id === productId ? { ...p, is_available: isAvailable } : p
      ),
    }))
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: isAvailable })
        .eq('id', productId)

      if (error) throw error
    } catch (error) {
      console.error('Error toggling product availability:', error)
      // Rollback on failure
      set((state) => ({
        products: state.products.map((p) =>
          p.id === productId ? { ...p, is_available: !isAvailable } : p
        ),
      }))
    }
  },
}))
