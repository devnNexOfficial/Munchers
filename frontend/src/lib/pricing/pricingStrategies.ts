/**
 * WHAT: Strategy Pattern implementation for price calculation
 * WHY:  Different item types use different pricing rules. Encoding all rules
 *       inline in components creates spaghetti logic and violates Single
 *       Responsibility. A strategy object per pricing model makes each rule
 *       testable and swappable without touching components.
 * HOW:  Each strategy implements the PricingStrategy interface.
 *       Call getPricingStrategy(type) to get the right one, then .calculate().
 * EDGE CASES:
 *   - Deal pricing ignores customization additions up to the deal limit
 *   - Meal pricing stacks on top of any other strategy
 * PERFORMANCE: Strategies are plain objects — no class instantiation overhead.
 *
 * @example
 * const strategy = getPricingStrategy('customized')
 * const total = strategy.calculate(basePrice, ingredientSelections, ingredientList)
 */

import type { CustomizerIngredient, IngredientSelection } from '@/lib/layerConfig'

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

/**
 * All pricing strategies must implement this interface.
 * LISKOV SUBSTITUTION: any strategy can replace any other without
 * callers needing to know which concrete strategy is in use.
 */
export interface PricingStrategy {
  /**
   * Calculate the total price for an item given its selections.
   *
   * @param basePrice   - The item's base price from the DB
   * @param selections  - User's ingredient selections (id → qty mapping)
   * @param ingredients - Full ingredient list with pricePerUnit data
   * @returns           - Total price in PKR (client-side estimate)
   */
  calculate(
    basePrice: number,
    selections: Record<string, IngredientSelection>,
    ingredients: CustomizerIngredient[]
  ): number
}

// ---------------------------------------------------------------------------
// Concrete strategies
// ---------------------------------------------------------------------------

/**
 * STANDARD PRICING: base_price only, no customization additions.
 * Used for: simple items added directly to cart without customization.
 */
export const standardPricing: PricingStrategy = {
  calculate(basePrice): number {
    return basePrice
  },
}

/**
 * CUSTOMIZED PRICING: base_price + sum of (ingredient.pricePerUnit × qty)
 * Used for: any item that went through the customizer engine.
 * PERFORMANCE: Single-pass O(n) reduce over ingredients list.
 */
export const customizedPricing: PricingStrategy = {
  calculate(basePrice, selections, ingredients): number {
    // Single-pass accumulation — avoids chained .filter().map().reduce() (O(3n))
    return ingredients.reduce((total, ingredient) => {
      const qty = selections[ingredient.id]?.qty ?? 0
      return total + qty * ingredient.pricePerUnit
    }, basePrice)
  },
}

/**
 * DEAL PRICING: fixed deal_price regardless of ingredient selections.
 * Used for: items purchased as part of a deal bundle.
 * WHY: Deal price is pre-negotiated — restaurant guarantees that price
 *      regardless of what the customer customizes within the deal limits.
 * NOTE: Server re-validates this before order creation (as always).
 */
export const dealPricing: PricingStrategy = {
  calculate(basePrice): number {
    // basePrice here is the deal_price passed by the caller
    return basePrice
  },
}

// ---------------------------------------------------------------------------
// Factory function (Open/Closed Principle)
// ---------------------------------------------------------------------------

type PricingType = 'standard' | 'customized' | 'deal'

/**
 * FACTORY: Returns the correct pricing strategy for a given item type.
 * OPEN/CLOSED: Adding a new pricing type = add an entry here + a new
 * strategy object above — zero changes to callers.
 *
 * @param type - Which pricing strategy to use
 * @returns    - The corresponding PricingStrategy implementation
 */
const PRICING_REGISTRY: Record<PricingType, PricingStrategy> = {
  standard: standardPricing,
  customized: customizedPricing,
  deal: dealPricing,
}

export function getPricingStrategy(type: PricingType): PricingStrategy {
  return PRICING_REGISTRY[type]
}
