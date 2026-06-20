import { z } from 'zod';

export type StaffRole = 'owner' | 'manager' | 'chef';

export interface DealItem {
  menu_item_id: string;
  quantity: number;
  label?: string;
}

export interface DealCustomizeLimit {
  [menu_item_id: string]: {
    max_extra_ingredients: number;
    allowed_swaps: boolean;
  };
}

export interface Deal {
  id: string;
  name: string;
  name_ur: string | null;
  description: string | null;
  image_url: string | null;
  deal_price: number;
  original_price: number | null;
  items: DealItem[];
  customize_limit: DealCustomizeLimit | null;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
}

export type DealValidityStatus = 'always_active' | 'live' | 'expired' | 'inactive' | 'scheduled';

export interface MenuItemOption {
  id: string;
  name: string;
  base_price: number;
  canvas_type: string;
}

export const dealItemSchema = z.object({
  menu_item_id: z.string().min(1, 'Menu item required'),
  quantity: z.number().int().min(1, 'Quantity min 1'),
  label: z.string().optional()
});

export const dealCustomizeLimitSchema = z.record(
  z.string(),
  z.object({
    max_extra_ingredients: z.number().int().min(0),
    allowed_swaps: z.boolean()
  })
);

export const dealSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  name_ur: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  deal_price: z.number().min(0),
  original_price: z.number().min(0).nullable().optional(),
  items: z.array(dealItemSchema).min(1, 'At least one item is required'),
  customize_limit: dealCustomizeLimitSchema.nullable().optional(),
  is_active: z.boolean(),
  valid_from: z.string().nullable().optional(),
  valid_until: z.string().nullable().optional()
}).refine(data => {
  if (data.original_price !== null && data.original_price !== undefined) {
    return data.original_price > data.deal_price;
  }
  return true;
}, {
  message: "Original price must be greater than deal price",
  path: ["original_price"]
}).refine(data => {
  if (data.valid_from && data.valid_until) {
    return new Date(data.valid_until) > new Date(data.valid_from);
  }
  return true;
}, {
  message: "Valid until must be after valid from",
  path: ["valid_until"]
});
