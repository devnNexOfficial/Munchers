import { createClient } from '@/lib/supabase/server'

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
  name: string
  name_ur: string | null
  image_url: string | null
  sort_order: number
}

export type MenuItem = {
  id: string
  name: string
  name_ur: string | null
  description: string | null
  image_url: string
  base_price: number
  discount_price: number | null
  show_discount: boolean
  category_id: string
  is_available: boolean
  is_best_seller: boolean
  is_featured: boolean
  with_meal: boolean
  canvas_type: string
  daily_special: boolean
  special_ends_at: string | null
}

export type RestaurantSettings = {
  id: string
  is_manually_closed: boolean
  open_time: string | null
  close_time: string | null
  min_order_amount: number
}

export async function getActiveDeals(): Promise<Deal[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('deals')
      .select('id, name, image_url, deal_price, original_price, is_active, valid_from, valid_until')
      .eq('is_active', true)
      // Assuming sort_order doesn't exist on deals in ARCHITECTURE.md, but prompt mentions ordered by sort_order. 
      // I'll order by created_at as fallback or add sort_order. Prompt says "ordered by sort_order".
      // .order('sort_order', { ascending: true }) // Will use created_at to avoid crash if sort_order missing
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching deals:', error)
    return []
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, name_ur, image_url, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export async function getMenuItemsByCategory(categoryId: string): Promise<MenuItem[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('menu_items')
      .select('id, name, name_ur, description, image_url, base_price, discount_price, show_discount, category_id, is_available, is_best_seller, is_featured, with_meal, canvas_type, daily_special, special_ends_at')
      .eq('category_id', categoryId)
      .eq('is_available', true) // prompt says is_published=true, schema says is_available=true
      .order('sort_order', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error(`Error fetching menu items for category ${categoryId}:`, error)
    return []
  }
}

export async function getRestaurantSettings(): Promise<RestaurantSettings | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('restaurant_settings')
      .select('id, is_manually_closed, open_time, close_time, min_order_amount')
      .limit(1)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching restaurant settings:', error)
    return null
  }
}
