import { z } from 'zod'

export interface Category {
  id: string
  restaurant_id?: string
  name: string
  name_ur?: string
  description?: string
  sort_order: number
  slug?: string
  image_url?: string
  is_active?: boolean
  created_at?: string
}

export interface ProductVariant {
  id: string
  name: string
  price_override: number
}

export interface Product {
  id: string
  category_id: string
  name: string
  name_ur?: string
  description: string
  description_ur?: string
  base_price: number
  image_url: string
  is_available: boolean
  variants: ProductVariant[]
  discount_price?: number
  show_discount?: boolean
  canvas_type?: 'burger' | 'pizza' | 'roll' | 'simple'
  base_prep_time?: number
  is_featured?: boolean
  is_best_seller?: boolean
  with_meal?: boolean
  meal_options?: unknown
  daily_special?: boolean
  special_ends_at?: string
  sort_order?: number
  created_at?: string
  updated_at?: string
}

export const productFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  base_price: z.preprocess((val) => Number(val), z.number().positive('Base price must be a positive number')),
  category_id: z.string().uuid('Category ID must be a valid UUID'),
  description: z.string().optional().default(''),
  image_url: z.string().url('Must be a valid image URL').or(z.string().min(1, 'Image URL is required')),
  is_available: z.boolean().default(true),
})

export type ProductFormData = z.infer<typeof productFormSchema>
