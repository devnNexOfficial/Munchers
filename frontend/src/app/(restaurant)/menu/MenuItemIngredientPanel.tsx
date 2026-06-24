'use client';

import { useState } from 'react';
import { Ingredient, MenuItemIngredient } from './types';

interface Props {
  menuItemId: string;
  assignments: MenuItemIngredient[];
  allIngredients: Ingredient[];
  onUpdate: (assignments: MenuItemIngredient[]) => void;
}

export default function MenuItemIngredientPanel({ menuItemId, assignments, allIngredients, onUpdate }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  
  // Default values for a new assignment
  const [formData, setFormData] = useState<Partial<MenuItemIngredient>>({});

  const handleAdd = () => {
    if (!selectedIngredientId) return;
    const ingredient = allIngredients.find(i => i.id === selectedIngredientId);
    if (!ingredient) return;

    const newAssignment: MenuItemIngredient = {
      id: Date.now().toString(),
      menu_item_id: menuItemId,
      ingredient_id: ingredient.id,
      is_core: formData.is_core ?? ingredient.is_core,
      is_required: formData.is_required ?? ingredient.is_required,
      is_flexible: formData.is_flexible ?? true,
      default_qty: formData.default_qty ?? 1,
      max_qty: formData.max_qty ?? ingredient.max_limit,
      sort_order: formData.sort_order ?? assignments.length,
      ingredient,
    };

    onUpdate([...assignments, newAssignment]);
    setIsAdding(false);
    setSelectedIngredientId('');
    setFormData({});
  };

  const handleRemove = (id: string) => {
    onUpdate(assignments.filter(a => a.id !== id));
  };

  const updateAssignment = (id: string, updates: Partial<MenuItemIngredient>) => {
    onUpdate(assignments.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  return (
    <div className="mt-6 border-t border-gray-200 pt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="font-bold text-gray-900 text-lg">Ingredient Configuration</h4>
          <p className="text-xs text-[#D62828] font-medium mt-1">
            Note: Values set here are the runtime source of truth and override ingredient-level defaults.
          </p>
        </div>
        {!isAdding && (
          <button type="button" onClick={() => setIsAdding(true)} className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded font-medium hover:bg-gray-200">
            + Assign Ingredient
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Select Ingredient</label>
            <select 
              value={selectedIngredientId} 
              onChange={e => {
                setSelectedIngredientId(e.target.value);
                const ing = allIngredients.find(i => i.id === e.target.value);
                if (ing) {
                  setFormData({ is_core: ing.is_core, is_required: ing.is_required, max_qty: ing.max_limit, default_qty: 1 });
                }
              }}
              className="w-full border border-gray-300 p-2 rounded"
            >
              <option value="">-- Choose --</option>
              {allIngredients.filter(i => !assignments.some(a => a.ingredient_id === i.id)).map(i => (
                <option key={i.id} value={i.id}>{i.name} ({i.category})</option>
              ))}
            </select>
          </div>
          {selectedIngredientId && (
            <>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Default Qty</label><input type="number" value={formData.default_qty ?? 1} onChange={e => setFormData(p => ({ ...p, default_qty: parseInt(e.target.value) }))} className="w-full border border-gray-300 p-2 rounded" /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Max Qty</label><input type="number" value={formData.max_qty ?? 1} onChange={e => setFormData(p => ({ ...p, max_qty: parseInt(e.target.value) }))} className="w-full border border-gray-300 p-2 rounded" /></div>
              <div className="md:col-span-4 flex gap-4 text-sm mt-2">
                <label className="flex items-center gap-1"><input type="checkbox" checked={formData.is_core ?? false} onChange={e => setFormData(p => ({ ...p, is_core: e.target.checked }))} /> Core</label>
                <label className="flex items-center gap-1"><input type="checkbox" checked={formData.is_required ?? false} onChange={e => setFormData(p => ({ ...p, is_required: e.target.checked }))} /> Required</label>
                <label className="flex items-center gap-1"><input type="checkbox" checked={formData.is_flexible ?? true} onChange={e => setFormData(p => ({ ...p, is_flexible: e.target.checked }))} /> Flexible</label>
              </div>
            </>
          )}
          <div className="md:col-span-4 flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1 text-sm bg-white border border-gray-300 rounded text-gray-600">Cancel</button>
            <button type="button" onClick={handleAdd} disabled={!selectedIngredientId} className="px-3 py-1 text-sm bg-[#D62828] text-white rounded font-medium disabled:opacity-50">Add Assignment</button>
          </div>
        </div>
      )}

      {assignments.length > 0 && (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
              <tr>
                <th className="p-3">Ingredient</th>
                <th className="p-3">Core</th>
                <th className="p-3">Required</th>
                <th className="p-3">Flexible</th>
                <th className="p-3 w-20">Def Qty</th>
                <th className="p-3 w-20">Max Qty</th>
                <th className="p-3 w-20">Sort</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {assignments.sort((a, b) => a.sort_order - b.sort_order).map(a => (
                <tr key={a.id} className="border-b border-gray-100 bg-white">
                  <td className="p-3 font-medium text-gray-900">{a.ingredient?.name || a.ingredient_id}</td>
                  <td className="p-3"><input type="checkbox" checked={a.is_core} onChange={e => updateAssignment(a.id, { is_core: e.target.checked })} className="text-[#D62828] focus:ring-[#D62828] rounded" /></td>
                  <td className="p-3"><input type="checkbox" checked={a.is_required} onChange={e => updateAssignment(a.id, { is_required: e.target.checked })} className="text-[#D62828] focus:ring-[#D62828] rounded" /></td>
                  <td className="p-3"><input type="checkbox" checked={a.is_flexible} onChange={e => updateAssignment(a.id, { is_flexible: e.target.checked })} className="text-[#D62828] focus:ring-[#D62828] rounded" /></td>
                  <td className="p-3"><input type="number" value={a.default_qty} onChange={e => updateAssignment(a.id, { default_qty: parseInt(e.target.value) || 0 })} className="w-full border border-gray-300 p-1 rounded" /></td>
                  <td className="p-3"><input type="number" value={a.max_qty} onChange={e => updateAssignment(a.id, { max_qty: parseInt(e.target.value) || 0 })} className="w-full border border-gray-300 p-1 rounded" /></td>
                  <td className="p-3"><input type="number" value={a.sort_order} onChange={e => updateAssignment(a.id, { sort_order: parseInt(e.target.value) || 0 })} className="w-full border border-gray-300 p-1 rounded" /></td>
                  <td className="p-3 text-right">
                    <button type="button" onClick={() => handleRemove(a.id)} className="text-[#D62828] hover:underline text-xs font-bold">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
