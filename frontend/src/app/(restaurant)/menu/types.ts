export interface Category {
  id: string;
  name: string;
  name_ur?: string;
  slug: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  name_ur?: string;
  category: 'bun' | 'patty' | 'cheese' | 'sauce' | 'topping' | 'drink' | 'side';
  png_image_url: string;
  png_qty_low?: string;
  png_qty_medium?: string;
  png_qty_high?: string;
  z_index: number;
  y_position: string;
  width_ratio: string;
  price_per_unit: number;
  standard_unit: string;
  max_limit: number;
  is_core: boolean;
  is_required: boolean;
  extra_prep_time: number;
  is_available: boolean;
  stock_count: number | null;
  low_stock_alert: number;
  created_at?: string;
  updated_at?: string;
}

export interface SizeVariant {
  label: string;
  price: number;
}

export interface MealOption {
  label: string;
  price: number;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  name_ur?: string;
  description?: string;
  description_ur?: string;
  image_url: string;
  base_price: number;
  discount_price?: number;
  show_discount: boolean;
  size_variants?: SizeVariant[];
  canvas_type: 'burger' | 'pizza' | 'roll' | 'simple';
  base_prep_time: number;
  is_available: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  with_meal: boolean;
  meal_options?: MealOption[];
  daily_special: boolean;
  special_ends_at?: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface MenuItemIngredient {
  id: string;
  menu_item_id: string;
  ingredient_id: string;
  is_core: boolean;
  is_required: boolean;
  is_flexible: boolean;
  default_qty: number;
  max_qty: number;
  sort_order: number;
  
  // Joined field for display purposes
  ingredient?: Ingredient;
}
