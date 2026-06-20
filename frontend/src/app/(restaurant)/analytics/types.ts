export interface DailySummary {
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  orders_by_type: { delivery: number; dine_in: number; takeaway: number };
  orders_by_payment: { cod: number; jazzcash: number; easypaisa: number; card: number };
  orders_by_complexity: { green: number; yellow: number; red: number };
  cancelled_orders: number;
}

export interface PopularItem {
  name: string;
  order_count: number;
  revenue: number;
}

export interface PopularCustomization {
  ingredient_name: string;
  count: number;
}

// Heatmap Point: Assuming response provides zone/area name or lat/lng string + count
export interface HeatmapPoint {
  zone_name?: string;
  location: string; // lat,lng string or descriptor
  order_count: number;
}

export interface HourlyBucket {
  hour: number; // 0-23
  order_count: number;
}

export interface FinanceSummary {
  delivery_total: number;
  gst_total: number;
  discount_total: number;
  net_revenue: number;
}
