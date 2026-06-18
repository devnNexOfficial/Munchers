import type { Product, ProductVariant } from './menu'

/**
 * Represents a single item in the shopping cart.
 * Each CartItem maps to one Product + optional variant selection.
 * Quantities are positive integers; price fields are in PKR (whole units).
 */
export interface CartItem {
  /** Unique cart-line identifier (generated at add-time, NOT the product id) */
  cartLineId: string
  /** Reference to the source product */
  product: Product
  /** Selected variant, if any. Null means base product pricing applies. */
  selectedVariant: ProductVariant | null
  /** Item quantity — must be >= 1 */
  quantity: number
  /** Special instructions from the customer (e.g., "no onions") */
  specialInstructions: string
  /** Timestamp when the item was added to the cart */
  addedAt: string
}

/**
 * Aggregated cart totals computed by the price calculator.
 * All monetary values are in PKR.
 */
export interface CartSummary {
  /** Sum of all line item subtotals before tax and delivery */
  subtotal: number
  /** Tax amount computed from subtotal (GST percentage) */
  taxAmount: number
  /** Flat or distance-based delivery fee */
  deliveryFee: number
  /** Total discount applied across all eligible items */
  discountAmount: number
  /** Final total: subtotal + taxAmount + deliveryFee - discountAmount */
  grandTotal: number
  /** Total number of individual items (sum of all quantities) */
  totalItems: number
  /** Total number of distinct line items in the cart */
  totalLines: number
}

/**
 * Delivery mode selection for checkout.
 */
export type DeliveryMode = 'delivery' | 'pickup'

/**
 * Customer details captured at checkout.
 */
export interface CheckoutCustomerInfo {
  fullName: string
  phone: string
  email: string
  deliveryAddress: string
  deliveryMode: DeliveryMode
  notes: string
}

/**
 * The complete checkout payload submitted to the backend.
 */
export interface CheckoutPayload {
  /** Restaurant receiving the order */
  restaurantId: string
  /** Authenticated customer user ID, if logged in */
  customerId: string | null
  /** Customer contact and delivery details */
  customerInfo: CheckoutCustomerInfo
  /** Serialized cart line items */
  items: CheckoutLineItem[]
  /** Computed price summary at time of submission */
  summary: CartSummary
  /** ISO timestamp of order placement */
  placedAt: string
}

/**
 * Minimal line-item representation sent to the backend.
 * Strips the full Product object to avoid payload bloat.
 */
export interface CheckoutLineItem {
  productId: string
  productName: string
  variantId: string | null
  variantName: string | null
  unitPrice: number
  quantity: number
  lineTotal: number
  specialInstructions: string
}
