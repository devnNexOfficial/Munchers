/**
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
}
