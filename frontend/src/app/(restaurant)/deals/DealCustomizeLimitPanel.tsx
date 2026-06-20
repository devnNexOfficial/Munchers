'use client';

import { DealCustomizeLimit, DealItem, MenuItemOption } from './types';

interface DealCustomizeLimitPanelProps {
  items: DealItem[];
  menuOptions: MenuItemOption[];
  limits: DealCustomizeLimit;
  onChange: (newLimits: DealCustomizeLimit) => void;
}

export default function DealCustomizeLimitPanel({ items, menuOptions, limits, onChange }: DealCustomizeLimitPanelProps) {
  // Find which items in the current deal are customizable
  const customizableItems = items
    .map(item => {
      const option = menuOptions.find(o => o.id === item.menu_item_id);
      return { item, option };
    })
    .filter(x => x.option && x.option.canvas_type !== 'simple');

  if (customizableItems.length === 0) {
    return null; // Hidden if all items are simple
  }

  const handleUpdate = (menuItemId: string, field: 'max_extra_ingredients' | 'allowed_swaps', value: any) => {
    const updated = { ...limits };
    if (!updated[menuItemId]) {
      updated[menuItemId] = { max_extra_ingredients: 0, allowed_swaps: false };
    }
    updated[menuItemId] = { ...updated[menuItemId], [field]: value };
    onChange(updated);
  };

  return (
    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 mt-6">
      <h4 className="font-bold text-yellow-900 mb-2">Customization Limits</h4>
      <p className="text-xs text-yellow-800 mb-4">
        Set limits for the customizable items in this deal.
        <br/><span className="italic font-bold">Assumption Flag: Shape matches requirements macro.</span>
      </p>

      <div className="space-y-4">
        {customizableItems.map(({ item, option }, idx) => {
          const limit = limits[item.menu_item_id] || { max_extra_ingredients: 0, allowed_swaps: false };
          const displayName = item.label || option?.name || 'Unknown Item';

          return (
            <div key={`${item.menu_item_id}-${idx}`} className="flex flex-col md:flex-row md:items-center gap-4 bg-white p-3 rounded border border-yellow-200">
              <div className="flex-1 font-medium text-sm text-gray-900">
                {displayName} <span className="text-xs text-gray-500 font-normal">({option?.canvas_type})</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-700">Max Extra Ingredients:</label>
                <input 
                  type="number" 
                  min="0"
                  value={limit.max_extra_ingredients}
                  onChange={e => handleUpdate(item.menu_item_id, 'max_extra_ingredients', parseInt(e.target.value) || 0)}
                  className="w-16 border border-gray-300 rounded p-1 text-sm focus:ring-[#D62828]"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-gray-700">
                  <input 
                    type="checkbox"
                    checked={limit.allowed_swaps}
                    onChange={e => handleUpdate(item.menu_item_id, 'allowed_swaps', e.target.checked)}
                    className="text-[#D62828] rounded focus:ring-[#D62828]"
                  />
                  Allow Swaps
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
