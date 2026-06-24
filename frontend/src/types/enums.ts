/**
 * WHAT: Centralized enum definitions for all domain-level string unions
 * WHY:  Replaces scattered `'burger' | 'pizza' | ...` unions with typed,
 *       refactorable enums — one place to change, zero hunt-and-replace
 * HOW:  Import the specific enum needed; never use raw string literals
 *       for values covered here
 */

// ---------------------------------------------------------------------------
// Order lifecycle
// ---------------------------------------------------------------------------

/**
 * All valid states an order can be in, matching the `orders.status` DB column.
 * Source of truth: ARCHITECTURE.md orders table CHECK constraint.
 */
export enum OrderStatus {
  Received = 'received',
  Preparing = 'preparing',
  Ready = 'ready',
  Dispatched = 'dispatched',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
}

// ---------------------------------------------------------------------------
// Customizer canvas types
// ---------------------------------------------------------------------------

/**
 * Determines which canvas rendering engine to use for a menu item.
 * Maps to `menu_items.canvas_type` in the DB.
 * OPEN/CLOSED: Adding a new canvas type = add one entry here + one entry
 * in the CANVAS_REGISTRY (customize/page.tsx) — zero if/else changes.
 */
export enum CanvasType {
  Burger = 'burger',
  Pizza = 'pizza',
  Roll = 'roll',
  Simple = 'simple',
}

// ---------------------------------------------------------------------------
// Payment methods
// ---------------------------------------------------------------------------

/**
 * All payment methods supported by PayMob (Pakistan).
 * Maps to `orders.payment_method` in the DB.
 * OPEN/CLOSED: Adding a new method = add here + PAYMENT_REGISTRY — zero
 * if/else changes.
 */
export enum PaymentMethod {
  COD = 'cod',
  JazzCash = 'jazzcash',
  Easypaisa = 'easypaisa',
  Card = 'card',
}

// ---------------------------------------------------------------------------
// Order types
// ---------------------------------------------------------------------------

/**
 * How the customer wants to receive their order.
 * Maps to `orders.order_type` in the DB.
 */
export enum OrderType {
  Delivery = 'delivery',
  DineIn = 'dine_in',
  Takeaway = 'takeaway',
}

// ---------------------------------------------------------------------------
// Staff roles
// ---------------------------------------------------------------------------

/**
 * Restaurant staff roles with different permission levels.
 * Maps to `staff_accounts.role` in the DB.
 */
export enum UserRole {
  Owner = 'owner',
  Manager = 'manager',
  Chef = 'chef',
}
