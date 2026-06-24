import { z } from 'zod';

export type StockStatus = 'unlimited' | 'in_stock' | 'low_stock' | 'out_of_stock';

export interface IngredientStockRow {
  id: string;
  name: string;
  category: string;
  stock_count: number | null;
  low_stock_alert: number;
  is_available: boolean;
  updated_at: string;
}

export interface RestockNotificationRow {
  user_id: string;
  menu_item_id: string;
  created_at: string;
  user_name?: string; // Anonymised or public display name; NO PII (phone number)
}

export interface RestockNotificationCount {
  ingredient_id: string;
  count: number;
  notifications: RestockNotificationRow[];
}

export const stockUpdateSchema = z.object({
  stock_count: z.number().int().min(0).nullable(),
  low_stock_alert: z.number().int().min(0),
});
