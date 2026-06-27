'use client';

import { DealItem, MenuItemOption } from './types';

interface DealItemsPanelProps {
  items: DealItem[];
  menuOptions: MenuItemOption[];
  onChange: (items: DealItem[]) => void;
  error?: string;
}

export default function DealItemsPanel({ items, menuOptions, onChange, error }: DealItemsPanelProps) {
  const handleAdd = () => {
    onChange([...items, { menu_item_id: '', quantity: 1 }]);
  };

  const handleRemove = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  const handleUpdate = (index: number, field: keyof DealItem, value: unknown) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  return (
    <div className="mt-6 border-t border-gray-200 pt-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold text-gray-900 text-lg">Deal Items</h4>
        <button type="button" onClick={handleAdd} className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded font-medium hover:bg-gray-200">
          + Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500 text-sm">
          No items added yet. Minimum 1 item required.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex flex-col md:flex-row gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 items-end">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Menu Item</label>
                <select 
                  value={item.menu_item_id}
                  onChange={e => handleUpdate(idx, 'menu_item_id', e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-[#D62828]"
                >
                  <option value="">-- Choose Item --</option>
                  {menuOptions.map(o => (
                    <option key={o.id} value={o.id}>{o.name} (Rs. {o.base_price})</option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <label className="block text-xs font-bold text-gray-700 mb-1">Quantity</label>
                <input 
                  type="number" 
                  min="1"
                  value={item.quantity}
                  onChange={e => handleUpdate(idx, 'quantity', parseInt(e.target.value) || 1)}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-[#D62828]"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Label Override (Optional)</label>
                <input 
                  type="text" 
                  value={item.label || ''}
                  onChange={e => handleUpdate(idx, 'label', e.target.value)}
                  placeholder="e.g. Any Burger"
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-[#D62828]"
                />
              </div>
              <button 
                type="button" 
                onClick={() => handleRemove(idx)}
                className="p-2 text-[#D62828] font-bold hover:bg-red-50 rounded"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-xs text-[#EF4444] mt-2 font-medium">{error}</p>}
    </div>
  );
}
