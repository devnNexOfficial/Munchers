export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type ComplexityLevel = 'green' | 'yellow' | 'red';

export interface OrderItemSnapshot {
  name: string;
  qty: number;
  item_total: number;
  customizations?: string;
}

export interface OrderRow {
  id: string;
  order_number: string;
  created_at: string;
  order_type: string;
  status: OrderStatus;
  payment_method: string;
  payment_status: PaymentStatus;
  complexity: ComplexityLevel | null;
  total: number;
  subtotal: number;
  delivery_charge: number;
  gst_amount: number;
  discount_amount: number;
  rejection_reason: string | null;
  special_note: string | null;
  accepted_at: string | null;
  ready_at: string | null;
  delivered_at: string | null;
  items: OrderItemSnapshot[];
  customer_name: string | null; // Null-safe, no profiles.phone
  rider_name: string | null;
}

export interface FinanceSummary {
  total_orders: number;
  completed_orders: number;
  total_revenue: number;
  total_delivery: number;
  total_gst: number;
  total_discounts: number;
  net_revenue: number;
  cancellation_count: number;
  cancellation_rate: number;
}

export interface DailyRevenueRow {
  date: string;
  orders: number;
  revenue: number;
  avg_order_value: number;
}

export interface DateRange {
  from: string;
  to: string;
}
