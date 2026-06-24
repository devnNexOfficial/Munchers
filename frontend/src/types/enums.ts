/**
 * ENUMS: Shared enums for the entire frontend.
 * WHY: Replaces magic string literals — single source of truth,
 *      compile-time safety, no typos.
 */
export enum OrderStatus {
  Received = 'received',
  Pending = 'pending',
  Accepted = 'accepted',
  Preparing = 'preparing',
  Ready = 'ready',
  Dispatched = 'dispatched',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
}

export enum CanvasType {
  Burger = 'burger',
  Pizza = 'pizza',
  Roll = 'roll',
  Simple = 'simple',
}

export enum PaymentMethod {
  COD = 'cod',
  JazzCash = 'jazzcash',
  Easypaisa = 'easypaisa',
  Card = 'card',
}

export enum PaymentStatus {
  Pending = 'pending',
  Paid = 'paid',
  Failed = 'failed',
  Refunded = 'refunded',
}

export enum OrderType {
  Delivery = 'delivery',
  DineIn = 'dine_in',
  Takeaway = 'takeaway',
}

export enum UserRole {
  Owner = 'owner',
  Manager = 'manager',
  Chef = 'chef',
}

export enum IngredientCategory {
  Bun = 'bun',
  Patty = 'patty',
  Cheese = 'cheese',
  Sauce = 'sauce',
  Topping = 'topping',
  Drink = 'drink',
  Side = 'side',
}

export enum ComplexityLevel {
  Green = 'green',
  Yellow = 'yellow',
  Red = 'red',
}

export enum Severity {
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
  Critical = 'critical',
}

export enum StockStatus {
  Unlimited = 'unlimited',
  InStock = 'in_stock',
  LowStock = 'low_stock',
  OutOfStock = 'out_of_stock',
}

export enum HealthStatus {
  Healthy = 'healthy',
  Degraded = 'degraded',
  Down = 'down',
}
