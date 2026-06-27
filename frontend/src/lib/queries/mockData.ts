/**
 * MOCK DATA: Demo content for local development when Supabase tables are empty.
 * These are used as fallbacks by the query layer so every screen renders content.
 */

import type { Deal, Category, MenuItem, RestaurantSettings } from './home'

// ---------------------------------------------------------------------------
// Placeholder images (inline SVG data URIs — no external fetch needed)
// ---------------------------------------------------------------------------

const burgerSvg = (color: string) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 240'%3E%3Crect width='320' height='240' fill='%23FAFAFA'/%3E%3Ccircle cx='160' cy='120' r='72' fill='%23fff' stroke='${encodeURIComponent(color)}' stroke-width='8'/%3E%3Cpath d='M102 132h116c-4 24-25 40-58 40s-54-16-58-40Zm14-24c9-28 25-44 44-44s35 16 44 44h-88Z' fill='${encodeURIComponent(color)}'/%3E%3C/svg%3E`

const categoryIcon = (letter: string, bg: string) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Ccircle cx='24' cy='24' r='24' fill='${encodeURIComponent(bg)}'/%3E%3Ctext x='24' y='30' text-anchor='middle' font-size='20' font-weight='bold' fill='white' font-family='Arial'%3E${letter}%3C/text%3E%3C/svg%3E`

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-burgers', name_en: 'Burgers', name_ur: null, image_url: categoryIcon('B', '#D62828'), sort_order: 1 },
  { id: 'cat-wraps', name_en: 'Wraps', name_ur: null, image_url: categoryIcon('W', '#E85D04'), sort_order: 2 },
  { id: 'cat-sides', name_en: 'Sides', name_ur: null, image_url: categoryIcon('S', '#F7B731'), sort_order: 3 },
  { id: 'cat-drinks', name_en: 'Drinks', name_ur: null, image_url: categoryIcon('D', '#22C55E'), sort_order: 4 },
  { id: 'cat-desserts', name_en: 'Desserts', name_ur: null, image_url: categoryIcon('🍰', '#8B5CF6'), sort_order: 5 },
]

// ---------------------------------------------------------------------------
// Menu Items
// ---------------------------------------------------------------------------
const baseItem = {
  description_en: null,
  discount_price: null,
  show_discount: false,
  is_best_seller: false,
  is_chefs_pick: false,
  canvas_type: 'standard',
  daily_special: false,
  special_ends_at: null,
  size_variants: null,
  cooking_preference_options: null,
  base_prep_time: 15,
}

export const MOCK_MENU_ITEMS: Record<string, MenuItem[]> = {
  'cat-burgers': [
    {
      ...baseItem,
      id: 'item-classic',
      name_en: 'Classic Smash Burger',
      description_en: 'Juicy double-smash patties with American cheese, pickles, and our secret sauce.',
      image_url: burgerSvg('#D62828'),
      base_price: 850,
      category_id: 'cat-burgers',
      is_best_seller: true,
      canvas_type: 'burger',
    },
    {
      ...baseItem,
      id: 'item-spicy',
      name_en: 'Spicy Inferno',
      description_en: 'Ghost pepper sauce, jalapeños, pepper jack cheese on a brioche bun.',
      image_url: burgerSvg('#E63946'),
      base_price: 950,
      category_id: 'cat-burgers',
      is_chefs_pick: true,
      canvas_type: 'burger',
    },
    {
      ...baseItem,
      id: 'item-bbq',
      name_en: 'BBQ Ranch Burger',
      description_en: 'Smoky BBQ glaze, crispy onion rings, and tangy ranch drizzle.',
      image_url: burgerSvg('#B45309'),
      base_price: 990,
      category_id: 'cat-burgers',
      canvas_type: 'burger',
      size_variants: [
        { label: 'Regular', price: 990 },
        { label: 'Double', price: 1390 },
      ],
    },
    {
      ...baseItem,
      id: 'item-mushroom',
      name_en: 'Mushroom Swiss',
      description_en: 'Sautéed mushrooms, melted Swiss cheese, and garlic aioli.',
      image_url: burgerSvg('#6B7280'),
      base_price: 920,
      category_id: 'cat-burgers',
      canvas_type: 'burger',
    },
    {
      ...baseItem,
      id: 'item-loaded',
      name_en: 'The Loaded Beast',
      description_en: 'Triple patty, triple cheese, bacon, egg, and all the fixings.',
      image_url: burgerSvg('#0A0A0A'),
      base_price: 1590,
      category_id: 'cat-burgers',
      canvas_type: 'burger',
      is_best_seller: true,
    },
    {
      ...baseItem,
      id: 'item-chicken',
      name_en: 'Crispy Chicken Burger',
      description_en: 'Buttermilk-fried chicken thigh, coleslaw, and honey mustard.',
      image_url: burgerSvg('#F59E0B'),
      base_price: 790,
      category_id: 'cat-burgers',
      canvas_type: 'burger',
    },
  ],
  'cat-wraps': [
    {
      ...baseItem,
      id: 'item-wrap-classic',
      name_en: 'Classic Chicken Wrap',
      description_en: 'Grilled chicken, fresh veggies, and garlic mayo in a warm tortilla.',
      image_url: burgerSvg('#059669'),
      base_price: 650,
      category_id: 'cat-wraps',
    },
    {
      ...baseItem,
      id: 'item-wrap-spicy',
      name_en: 'Spicy Tikka Wrap',
      description_en: 'Charcoal-grilled tikka strips with mint chutney and onion rings.',
      image_url: burgerSvg('#DC2626'),
      base_price: 720,
      category_id: 'cat-wraps',
      is_best_seller: true,
    },
    {
      ...baseItem,
      id: 'item-wrap-falafel',
      name_en: 'Falafel Wrap',
      description_en: 'Crispy falafel, hummus, pickled turnips, and tahini sauce.',
      image_url: burgerSvg('#65A30D'),
      base_price: 580,
      category_id: 'cat-wraps',
    },
  ],
  'cat-sides': [
    {
      ...baseItem,
      id: 'item-fries',
      name_en: 'Loaded Fries',
      description_en: 'Crispy fries topped with cheese sauce, jalapeños, and sriracha mayo.',
      image_url: burgerSvg('#F59E0B'),
      base_price: 450,
      category_id: 'cat-sides',
      is_best_seller: true,
    },
    {
      ...baseItem,
      id: 'item-rings',
      name_en: 'Onion Rings',
      description_en: 'Beer-battered onion rings with chipotle dip.',
      image_url: burgerSvg('#D97706'),
      base_price: 350,
      category_id: 'cat-sides',
    },
    {
      ...baseItem,
      id: 'item-nuggets',
      name_en: 'Chicken Nuggets (8pc)',
      description_en: 'Golden crispy nuggets with two dipping sauces.',
      image_url: burgerSvg('#EAB308'),
      base_price: 520,
      category_id: 'cat-sides',
    },
    {
      ...baseItem,
      id: 'item-coleslaw',
      name_en: 'Coleslaw',
      description_en: 'Fresh crunchy coleslaw with creamy dressing.',
      image_url: burgerSvg('#16A34A'),
      base_price: 180,
      category_id: 'cat-sides',
    },
  ],
  'cat-drinks': [
    {
      ...baseItem,
      id: 'item-cola',
      name_en: 'Cola (Regular)',
      image_url: burgerSvg('#1E3A5F'),
      base_price: 150,
      category_id: 'cat-drinks',
      size_variants: [
        { label: 'Regular', price: 150 },
        { label: 'Large', price: 220 },
      ],
    },
    {
      ...baseItem,
      id: 'item-shake',
      name_en: 'Chocolate Shake',
      description_en: 'Thick and creamy chocolate milkshake topped with whipped cream.',
      image_url: burgerSvg('#7C3AED'),
      base_price: 450,
      category_id: 'cat-drinks',
      is_chefs_pick: true,
    },
    {
      ...baseItem,
      id: 'item-mojito',
      name_en: 'Virgin Mojito',
      description_en: 'Refreshing lime and mint mocktail.',
      image_url: burgerSvg('#10B981'),
      base_price: 350,
      category_id: 'cat-drinks',
    },
  ],
  'cat-desserts': [
    {
      ...baseItem,
      id: 'item-brownie',
      name_en: 'Molten Brownie',
      description_en: 'Warm chocolate brownie with vanilla ice cream and chocolate sauce.',
      image_url: burgerSvg('#92400E'),
      base_price: 490,
      category_id: 'cat-desserts',
      is_chefs_pick: true,
    },
    {
      ...baseItem,
      id: 'item-sundae',
      name_en: 'Caramel Crunch Sundae',
      description_en: 'Vanilla ice cream, caramel drizzle, and praline crunch.',
      image_url: burgerSvg('#CA8A04'),
      base_price: 420,
      category_id: 'cat-desserts',
    },
  ],
}

// ---------------------------------------------------------------------------
// Deals
// ---------------------------------------------------------------------------
export const MOCK_DEALS: Deal[] = [
  {
    id: 'deal-1',
    name: 'Smash Duo — 2 Classic Burgers + Fries + 2 Drinks',
    image_url: burgerSvg('#D62828'),
    deal_price: 1499,
    original_price: 2100,
    is_active: true,
    valid_from: null,
    valid_until: null,
  },
  {
    id: 'deal-2',
    name: 'Family Feast — 4 Burgers + 2 Loaded Fries + 4 Drinks',
    image_url: burgerSvg('#0A0A0A'),
    deal_price: 3499,
    original_price: 4800,
    is_active: true,
    valid_from: null,
    valid_until: null,
  },
  {
    id: 'deal-3',
    name: 'Midnight Crunch — Spicy Inferno + Onion Rings + Shake',
    image_url: burgerSvg('#E63946'),
    deal_price: 1199,
    original_price: 1750,
    is_active: true,
    valid_from: null,
    valid_until: null,
  },
]

// ---------------------------------------------------------------------------
// Daily Special
// ---------------------------------------------------------------------------
const specialEndsAt = new Date()
specialEndsAt.setHours(23, 59, 59, 999) // ends today at midnight

export const MOCK_DAILY_SPECIAL: MenuItem = {
  ...baseItem,
  id: 'item-special',
  name_en: 'The Volcano — Limited Edition',
  description_en: 'Carolina Reaper sauce, ghost pepper cheese, crispy fried egg — not for the faint-hearted!',
  image_url: burgerSvg('#EF4444'),
  base_price: 1290,
  discount_price: 990,
  show_discount: true,
  category_id: 'cat-burgers',
  daily_special: true,
  special_ends_at: specialEndsAt.toISOString(),
  is_chefs_pick: true,
  canvas_type: 'burger',
}

// ---------------------------------------------------------------------------
// Frequently Added
// ---------------------------------------------------------------------------
export const MOCK_FREQUENTLY_ADDED: MenuItem[] = [
  MOCK_MENU_ITEMS['cat-sides']![0]!, // Loaded Fries
  MOCK_MENU_ITEMS['cat-drinks']![0]!, // Cola
  MOCK_MENU_ITEMS['cat-sides']![2]!, // Nuggets
  MOCK_MENU_ITEMS['cat-drinks']![1]!, // Shake
  MOCK_MENU_ITEMS['cat-sides']![1]!, // Onion Rings
  MOCK_MENU_ITEMS['cat-drinks']![2]!, // Mojito
]

// ---------------------------------------------------------------------------
// Restaurant Settings
// ---------------------------------------------------------------------------
export const MOCK_RESTAURANT_SETTINGS: RestaurantSettings = {
  id: 'settings-1',
  is_manually_closed: false,
  open_time: '11:00',
  close_time: '23:59',
}
