import type { CartItem, CartSummary, CheckoutLineItem } from '../types/cart'

/**
 * ============================================================
 *  MUNCHERZ PRICE CALCULATOR ENGINE
 * ============================================================
 *
 * All internal arithmetic uses integer paisa (1 PKR = 100 paisa)
 * to eliminate floating-point accumulation errors.
 *
 * Public API returns PKR as standard numbers (2 decimal places).
 * ============================================================
 */

/** GST tax rate applied to the subtotal (percentage as decimal) */
const GST_RATE = 0.16

/** Default flat delivery fee in PKR */
const DEFAULT_DELIVERY_FEE = 150

/** Free delivery threshold in PKR */
const FREE_DELIVERY_THRESHOLD = 2000

// ─── Internal Precision Helpers ───────────────────────────────

/**
 * Convert a PKR amount to integer paisa for safe arithmetic.
 * Rounds to nearest integer to neutralize any pre-existing float noise.
 */
function toPaisa(pkr: number): number {
  return Math.round(pkr * 100)
}

/**
 * Convert paisa back to PKR with exactly 2 decimal precision.
 */
function toPKR(paisa: number): number {
  return Math.round(paisa) / 100
}

// ─── Line-Item Calculations ──────────────────────────────────

/**
 * Resolve the effective unit price for a cart item.
 *
 * Priority:
 *   1. If a variant is selected, use `variant.price_override`.
 *   2. If the product has an active discount (`show_discount` + `discount_price`),
 *      use `discount_price`.
 *   3. Otherwise, use `product.base_price`.
 */
export function resolveUnitPrice(item: CartItem): number {
  if (item.selectedVariant) {
    return item.selectedVariant.price_override
  }
  if (item.product.show_discount && item.product.discount_price != null && item.product.discount_price > 0) {
    return item.product.discount_price
  }
  return item.product.base_price
}

/**
 * Compute the subtotal for a single cart line (unit price × quantity).
 * Returns PKR value with 2-decimal precision.
 */
export function computeLineSubtotal(item: CartItem): number {
  const unitPricePaisa = toPaisa(resolveUnitPrice(item))
  const lineTotalPaisa = unitPricePaisa * item.quantity
  return toPKR(lineTotalPaisa)
}

// ─── Full Cart Summary ───────────────────────────────────────

/**
 * Compute the complete cart summary from an array of cart items.
 *
 * @param items       - Current cart line items
 * @param deliveryFee - Override delivery fee (default: 150 PKR, free above 2000 PKR)
 * @returns           - Aggregated CartSummary with all monetary fields in PKR
 */
export function computeCartSummary(items: CartItem[], deliveryFeeOverride?: number): CartSummary {
  if (items.length === 0) {
    return {
      subtotal: 0,
      taxAmount: 0,
      deliveryFee: 0,
      discountAmount: 0,
      grandTotal: 0,
      totalItems: 0,
      totalLines: 0,
    }
  }

  // ── Subtotal (sum of all line totals, in paisa) ──
  let subtotalPaisa = 0
  let totalItems = 0
  let discountPaisa = 0

  for (const item of items) {
    const unitPricePaisa = toPaisa(resolveUnitPrice(item))
    const linePaisa = unitPricePaisa * item.quantity
    subtotalPaisa += linePaisa
    totalItems += item.quantity

    // Calculate discount savings per item (base_price - effective price, if lower)
    if (
      item.product.show_discount &&
      item.product.discount_price != null &&
      item.product.discount_price > 0 &&
      !item.selectedVariant
    ) {
      const savedPerUnit = toPaisa(item.product.base_price) - toPaisa(item.product.discount_price)
      if (savedPerUnit > 0) {
        discountPaisa += savedPerUnit * item.quantity
      }
    }
  }

  // ── Tax ──
  const taxPaisa = Math.round(subtotalPaisa * GST_RATE)

  // ── Delivery Fee ──
  const subtotalPKR = toPKR(subtotalPaisa)
  let deliveryFeePaisa: number
  if (deliveryFeeOverride !== undefined) {
    deliveryFeePaisa = toPaisa(deliveryFeeOverride)
  } else {
    deliveryFeePaisa = subtotalPKR >= FREE_DELIVERY_THRESHOLD ? 0 : toPaisa(DEFAULT_DELIVERY_FEE)
  }

  // ── Grand Total ──
  const grandTotalPaisa = subtotalPaisa + taxPaisa + deliveryFeePaisa

  return {
    subtotal: toPKR(subtotalPaisa),
    taxAmount: toPKR(taxPaisa),
    deliveryFee: toPKR(deliveryFeePaisa),
    discountAmount: toPKR(discountPaisa),
    grandTotal: toPKR(grandTotalPaisa),
    totalItems,
    totalLines: items.length,
  }
}

// ─── Currency Formatting ─────────────────────────────────────

/**
 * Format a numeric PKR value into a display string.
 *
 * Examples:
 *   formatPKR(1500)    → "Rs. 1,500.00"
 *   formatPKR(0)       → "Rs. 0.00"
 *   formatPKR(99.5)    → "Rs. 99.50"
 */
export function formatPKR(amount: number): string {
  const formatted = new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return `Rs. ${formatted}`
}

/**
 * Format a PKR value compactly (no decimals for whole numbers).
 *
 * Examples:
 *   formatPKRCompact(1500)    → "Rs. 1,500"
 *   formatPKRCompact(99.5)    → "Rs. 99.50"
 */
export function formatPKRCompact(amount: number): string {
  const isWhole = amount === Math.floor(amount)
  const formatted = new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return `Rs. ${formatted}`
}

// ─── Checkout Serialization ──────────────────────────────────

/**
 * Serialize cart items into the minimal CheckoutLineItem[] payload
 * suitable for backend order submission.
 */
export function serializeCartForCheckout(items: CartItem[]): CheckoutLineItem[] {
  return items.map((item) => {
    const unitPrice = resolveUnitPrice(item)
    const lineTotal = computeLineSubtotal(item)

    return {
      productId: item.product.id,
      productName: item.product.name,
      variantId: item.selectedVariant?.id ?? null,
      variantName: item.selectedVariant?.name ?? null,
      unitPrice,
      quantity: item.quantity,
      lineTotal,
      specialInstructions: item.specialInstructions,
    }
  })
}

// ─── Validation Helpers ──────────────────────────────────────

/**
 * Validate that all cart items reference products that are still available.
 * Returns an array of product IDs that are no longer available.
 */
export function findUnavailableItems(items: CartItem[]): string[] {
  const unavailable: string[] = []
  for (const item of items) {
    if (!item.product.is_available) {
      unavailable.push(item.product.id)
    }
  }
  return unavailable
}

/**
 * Compute estimated preparation time for the entire cart (in minutes).
 * Uses the maximum base_prep_time across all items, plus 2 min per additional unique item.
 */
export function estimatePrepTime(items: CartItem[]): number {
  if (items.length === 0) return 0

  let maxPrepTime = 0
  for (const item of items) {
    const prep = item.product.base_prep_time ?? 10
    if (prep > maxPrepTime) {
      maxPrepTime = prep
    }
  }

  // Additional items add parallel prep overhead
  const additionalItems = Math.max(0, items.length - 1)
  return maxPrepTime + additionalItems * 2
}
