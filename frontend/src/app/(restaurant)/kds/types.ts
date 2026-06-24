export interface KDSOrderItemCustomization {
  ingredient_id: string;
  name: string;
  qty: number;
  unit: string;
  price: number;
}

export interface KDSOrderItemMealAddition {
  item_id: string;
  name: string;
  qty: number;
}

export interface KDSOrderItem {
  menu_item_name: string;
  size_label?: string | null;
  quantity: number;
  customizations?: KDSOrderItemCustomization[];
  meal_additions?: KDSOrderItemMealAddition[] | unknown;
  cooking_pref?: string | null;
  item_total: number;
}

export interface KDSOrder {
  id: string;
  order_number: string;
  order_type: 'delivery' | 'dine_in' | 'takeaway';
  table_number: string | null;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled';
  items: KDSOrderItem[];
  special_note: string | null;
  prep_time: number | null;
  complexity: 'green' | 'yellow' | 'red' | null;
  created_at: string;
  payment_method: string | null;
  payment_status: string | null;
  subtotal: number;
  delivery_charge: number;
  gst_amount: number;
  gst_percent: number;
  discount_amount: number;
  total: number;
  is_new?: boolean; // Client-side tracking
}

export interface Rider {
  id: string;
  name: string;
}
