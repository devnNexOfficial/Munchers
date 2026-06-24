export interface CustomizerIngredient {
  id: string;
  name: string;
  [key: string]: any;
}

export function getLayerConfig(ingredient: CustomizerIngredient): any {
  return {};
}

export function getLayerRole(ingredient: CustomizerIngredient): string {
  return 'ingredient';
}
