import { createServerClient } from '@/lib/supabase/server'

export type Deal = {
  id: string
  name: string
  image_url: string | null
  deal_price: number
  original_price: number | null
  is_active: boolean
  valid_from: string | null
  valid_until: string | null
}

export type Category = {
  id: string
  name_en: string
  name_ur: string | null
  image_url: string | null
  sort_order: number
}

export type MenuItem = {
  id: string
  name_en: string
  description_en: string | null
  image_url: string | null
  base_price: number
  discount_price: number | null
  show_discount: boolean
  category_id: string
  is_best_seller: boolean
  is_chefs_pick: boolean
  canvas_type: string
  daily_special: boolean
  special_ends_at: string | null
}

export type RestaurantSettings = {
  id: string
  is_manually_closed: boolean
  open_time: string | null
  close_time: string | null
}

const menuItemSelect =
  'id, name_en, description_en, image_url, base_price, discount_price, show_discount, category_id, is_best_seller, is_chefs_pick, canvas_type, daily_special, special_ends_at'

export async function getActiveDeals(): Promise<Deal[]> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('deals')
      .select('id, name, image_url, deal_price, original_price, is_active, valid_from, valid_until')
      .eq('is_active', true)

    if (error) throw error
    return data ?? []
  } catch (error) {
    console.error('Error fetching deals:', error)
    return []
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('categories')
      .select('id, name_en, name_ur, image_url, sort_order')
      .order('sort_order', { ascending: true })

    if (error) throw error
    return data ?? []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export async function getMenuItemsByCategory(categoryId: string): Promise<MenuItem[]> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('menu_items')
      .select(menuItemSelect)
      .eq('category_id', categoryId)
      .eq('is_published', true)

    if (error) throw error
    return data ?? []
  } catch (error) {
    console.error(`Error fetching menu items for category ${categoryId}:`, error)
    return []
  }
}

export async function getRestaurantSettings(): Promise<RestaurantSettings | null> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('restaurant_settings')
      .select('id, is_manually_closed, open_time, close_time')
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching restaurant settings:', error)
    return null
  }
}

export async function getDailySpecial(): Promise<MenuItem | null> {
  try {
    const supabase = await createServerClient()
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('menu_items')
      .select(menuItemSelect)
      .eq('daily_special', true)
      .eq('is_published', true)
      .not('special_ends_at', 'is', null)
      .gte('special_ends_at', now)
      .order('special_ends_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    if (!data?.special_ends_at || new Date(data.special_ends_at) <= new Date()) return null

    return data
  } catch (error) {
    console.error('Error fetching daily special:', error)
    return null
  }
}

export async function getFrequentlyAddedItems(): Promise<MenuItem[]> {
  try {
    const supabase = await createServerClient()
    const categorySlugs = ['side', 'sides', 'extra', 'extras', 'dip', 'dips', 'drink', 'drinks']
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .in('slug', categorySlugs)

    if (categoryError) throw categoryError

    const categoryIds = categories?.map((category) => category.id) ?? []
    if (categoryIds.length === 0) return []

    const { data, error } = await supabase
      .from('menu_items')
      .select(menuItemSelect)
      .in('category_id', categoryIds)
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .limit(6)

    if (error) throw error
    return data ?? []
  } catch (error) {
    console.error('Error fetching frequently added items:', error)
    return []
  }
}
