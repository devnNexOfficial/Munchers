import type { CustomizerIngredient, IngredientSelection } from '@/lib/layerConfig'

export interface PricingStrategy {
  calculate(
    basePrice: number,
    selections: Record<string, IngredientSelection>,
    ingredients: CustomizerIngredient[]
  ): number;
}

export class StandardPricing implements PricingStrategy {
  calculate(basePrice: number): number {
    return basePrice;
  }
}

export class CustomizedPricing implements PricingStrategy {
  calculate(
    basePrice: number,
    selections: Record<string, IngredientSelection>,
    ingredients: CustomizerIngredient[]
  ): number {
    return ingredients.reduce((total, ingredient) => {
      const qty = selections[ingredient.id]?.qty ?? 0;
      return total + qty * ingredient.pricePerUnit;
    }, basePrice);
  }
}

export class DealPricing implements PricingStrategy {
  constructor(
    private readonly dealPrice: number = 0,
    private readonly maxExtraCost: number = 0
  ) {}

  calculate(
    _basePrice: number,
    selections: Record<string, IngredientSelection>,
    ingredients: CustomizerIngredient[]
  ): number {
    const totalIngredientCost = ingredients.reduce((total, ingredient) => {
      const qty = selections[ingredient.id]?.qty ?? 0;
      return total + qty * ingredient.pricePerUnit;
    }, 0);
    const extraCost = Math.max(0, totalIngredientCost - this.maxExtraCost);
    return this.dealPrice + extraCost;
  }
}

export class MealPricing implements PricingStrategy {
  constructor(private readonly mealOptionsTotal: number = 0) {}

  calculate(basePrice: number): number {
    return basePrice + this.mealOptionsTotal;
  }
}

type PricingType = 'standard' | 'customized' | 'deal' | 'meal';

export function getPricingStrategy(
  type: PricingType,
  options?: { dealPrice?: number; maxExtraCost?: number; mealOptionsTotal?: number }
): PricingStrategy {
  switch (type) {
    case 'standard':
      return new StandardPricing();
    case 'customized':
      return new CustomizedPricing();
    case 'deal':
      return new DealPricing(options?.dealPrice, options?.maxExtraCost);
    case 'meal':
      return new MealPricing(options?.mealOptionsTotal);
  }
}
