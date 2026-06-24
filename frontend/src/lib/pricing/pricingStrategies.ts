/**
<<<<<<< HEAD
 * STRATEGY PATTERN: Pricing Strategies
 * WHAT: Different pricing strategies for different item types.
 * WHY: New item types (deals, meals) can be added without
 *      modifying existing strategy logic.
 * HOW: Each strategy implements PricingStrategy interface.
 *      The correct strategy is selected by a factory function.
 */

/**
 * Represents a single selected ingredient within an order context.
 */
export interface IngredientSelectionWithPrice {
  ingredientId: string;
  quantity: number;
  pricePerUnit: number;
}

/**
 * Interface implemented by all pricing strategies.
 */
export interface PricingStrategy {
  /**
   * Calculate the total price for an item given its base price and selections.
   * @param basePrice - The base price of the menu item
   * @param selections - Selected ingredients with quantities and prices
   * @returns The calculated total
   */
  calculate(basePrice: number, selections: IngredientSelectionWithPrice[]): number;
}

/**
 * Standard pricing: base_price + sum of all ingredient prices.
 * Used for simple items without customization.
 * PERFORMANCE: O(n) single pass over selections.
 */
export class StandardPricing implements PricingStrategy {
  calculate(basePrice: number, selections: IngredientSelectionWithPrice[]): number {
    return selections.reduce(
      (total, sel) => total + sel.quantity * sel.pricePerUnit,
      basePrice
    );
  }
}

/**
 * Customized pricing: base_price + sum of ingredient prices.
 * Used for items with full customization (burger, pizza, roll).
 * Same formula as Standard but separated for semantic clarity
 * and future divergence.
 */
export class CustomizedPricing implements PricingStrategy {
  calculate(basePrice: number, selections: IngredientSelectionWithPrice[]): number {
    return selections.reduce(
      (total, sel) => total + sel.quantity * sel.pricePerUnit,
      basePrice
    );
  }
}

/**
 * Deal pricing: fixed deal_price that includes base items up to a limit.
 * Extra customizations beyond the limit are added on top.
 * @param dealPrice - The fixed price of the deal
 * @param maxExtraCost - Maximum extra customization cost allowed before
 *                       additional charges apply
 */
export class DealPricing implements PricingStrategy {
  constructor(
    private readonly dealPrice: number,
    private readonly maxExtraCost: number = 0
  ) {}

  calculate(_basePrice: number, selections: IngredientSelectionWithPrice[]): number {
    const totalIngredientCost = selections.reduce(
      (total, sel) => total + sel.quantity * sel.pricePerUnit,
      0
    );
    // Deal price covers up to maxExtraCost in customizations
    const extraCost = Math.max(0, totalIngredientCost - this.maxExtraCost);
    return this.dealPrice + extraCost;
  }
}

/**
 * Meal pricing: item price + meal option prices.
 * Meal options have their own fixed prices added to the base.
 */
export class MealPricing implements PricingStrategy {
  constructor(private readonly mealOptionsTotal: number = 0) {}

  calculate(basePrice: number, _selections: IngredientSelectionWithPrice[]): number {
    return basePrice + this.mealOptionsTotal;
  }
}

/**
 * Factory function — selects the correct pricing strategy
 * based on item context.
 * @param itemType - The type/context of the item
 * @param options - Optional configuration for the strategy
 * @returns The matching PricingStrategy instance
 */
export function createPricingStrategy(
  itemType: 'standard' | 'customized' | 'deal' | 'meal',
  options?: { dealPrice?: number; maxExtraCost?: number; mealOptionsTotal?: number }
): PricingStrategy {
  switch (itemType) {
    case 'standard':
      return new StandardPricing();
    case 'customized':
      return new CustomizedPricing();
    case 'deal':
      return new DealPricing(options?.dealPrice ?? 0, options?.maxExtraCost ?? 0);
    case 'meal':
      return new MealPricing(options?.mealOptionsTotal ?? 0);
  }
=======
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
>>>>>>> origin/main
}
