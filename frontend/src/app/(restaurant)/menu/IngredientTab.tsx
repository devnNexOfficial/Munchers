/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { z } from 'zod';
import { Ingredient } from './types';
import ImageUploadField from './ImageUploadField';

const ingredientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  name_ur: z.string().optional(),
  category: z.enum(['bun', 'patty', 'cheese', 'sauce', 'topping', 'drink', 'side']),
  png_image_url: z.string().min(1, 'Base PNG is required'),
  png_qty_low: z.string().optional(),
  png_qty_medium: z.string().optional(),
  png_qty_high: z.string().optional(),
  z_index: z.number().int(),
  y_position: z.string().min(1),
  width_ratio: z.string().min(1),
  price_per_unit: z.number().min(0),
  standard_unit: z.string().min(1),
  max_limit: z.number().int().min(1),
  is_core: z.boolean(),
  is_required: z.boolean(),
  extra_prep_time: z.number().min(0),
  is_available: z.boolean(),
  stock_count: z.number().nullable(),
  low_stock_alert: z.number().min(0),
});

export default function IngredientTab({ initialIngredients }: { initialIngredients: Ingredient[] }) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);
  const [isEditing, setIsEditing] = useState<Ingredient | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Ingredient>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = async () => {
    try {
      const validData = ingredientSchema.parse({
        name: formData.name || '',
        name_ur: formData.name_ur || '',
        category: formData.category || 'bun',
        png_image_url: formData.png_image_url || '',
        png_qty_low: formData.png_qty_low || '',
        png_qty_medium: formData.png_qty_medium || '',
        png_qty_high: formData.png_qty_high || '',
        z_index: Number(formData.z_index) || 0,
        y_position: formData.y_position || '0%',
        width_ratio: formData.width_ratio || '100%',
        price_per_unit: Number(formData.price_per_unit) || 0,
        standard_unit: formData.standard_unit || 'piece',
        max_limit: Number(formData.max_limit) || 1,
        is_core: formData.is_core ?? false,
        is_required: formData.is_required ?? false,
        extra_prep_time: Number(formData.extra_prep_time) || 0,
        is_available: formData.is_available ?? true,
        stock_count: formData.stock_count === null || formData.stock_count === undefined || formData.stock_count === '' as any ? null : Number(formData.stock_count),
        low_stock_alert: Number(formData.low_stock_alert) || 0,
      });

      setErrors({});
      if (isEditing) {
        setIngredients(prev => prev.map(i => i.id === isEditing.id ? { ...isEditing, ...validData } as Ingredient : i));
      } else {
        setIngredients(prev => [...prev, { id: Date.now().toString(), ...validData } as Ingredient]);
      }
      setIsEditing(null); setIsAdding(false); setFormData({});
    } catch (e) {
      if (e instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        e.errors.forEach(err => { if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message; });
        setErrors(fieldErrors);
      }
    }
  };

  const toggleAvailability = (id: string, current: boolean) => {
    setIngredients(prev => prev.map(i => i.id === id ? { ...i, is_available: !current } : i));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Ingredients</h2>
        <button onClick={() => { setIsAdding(true); setFormData({ is_available: true, category: 'bun' }); }} className="bg-[#D62828] text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">+ Add Ingredient</button>
      </div>

      {(isAdding || isEditing) && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">{isEditing ? 'Edit Ingredient' : 'New Ingredient'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="block font-medium mb-1">Name (EN) *</label>
              <input type="text" value={formData.name || ''} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full border p-2 rounded" />
              {errors.name && <p className="text-[#D62828] text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block font-medium mb-1">Category *</label>
              <select value={formData.category || 'bun'} onChange={e => setFormData(p => ({ ...p, category: e.target.value as any }))} className="w-full border p-2 rounded">
                {['bun', 'patty', 'cheese', 'sauce', 'topping', 'drink', 'side'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Price per unit *</label>
              <input type="number" step="0.01" value={formData.price_per_unit ?? ''} onChange={e => setFormData(p => ({ ...p, price_per_unit: parseFloat(e.target.value) }))} className="w-full border p-2 rounded" />
              {errors.price_per_unit && <p className="text-[#D62828] text-xs mt-1">{errors.price_per_unit}</p>}
            </div>
            
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <ImageUploadField bucket="ingredient-pngs" label="Base PNG *" value={formData.png_image_url} onChange={url => setFormData(p => ({ ...p, png_image_url: url }))} />
              <ImageUploadField bucket="ingredient-pngs" label="Low Qty PNG" value={formData.png_qty_low} onChange={url => setFormData(p => ({ ...p, png_qty_low: url }))} />
              <ImageUploadField bucket="ingredient-pngs" label="Medium Qty PNG" value={formData.png_qty_medium} onChange={url => setFormData(p => ({ ...p, png_qty_medium: url }))} />
              <ImageUploadField bucket="ingredient-pngs" label="High Qty PNG" value={formData.png_qty_high} onChange={url => setFormData(p => ({ ...p, png_qty_high: url }))} />
              {errors.png_image_url && <p className="text-[#D62828] text-xs col-span-4">{errors.png_image_url}</p>}
            </div>

            <div>
              <label className="block font-medium mb-1">Standard Unit</label>
              <input type="text" value={formData.standard_unit || ''} onChange={e => setFormData(p => ({ ...p, standard_unit: e.target.value }))} className="w-full border p-2 rounded" placeholder="piece, slice, dash..." />
            </div>
            <div>
              <label className="block font-medium mb-1">Stock Count (leave blank for unlimited)</label>
              <input type="number" value={formData.stock_count ?? ''} onChange={e => setFormData(p => ({ ...p, stock_count: e.target.value === '' ? null : parseInt(e.target.value) }))} className="w-full border p-2 rounded" placeholder="Unlimited" />
            </div>
            <div>
              <label className="block font-medium mb-1">Low Stock Alert Level</label>
              <input type="number" value={formData.low_stock_alert ?? ''} onChange={e => setFormData(p => ({ ...p, low_stock_alert: parseInt(e.target.value) }))} className="w-full border p-2 rounded" />
            </div>

            <div><label className="block font-medium mb-1">Z-Index</label><input type="number" value={formData.z_index ?? ''} onChange={e => setFormData(p => ({ ...p, z_index: parseInt(e.target.value) }))} className="w-full border p-2 rounded" /></div>
            <div><label className="block font-medium mb-1">Y-Position</label><input type="text" value={formData.y_position || ''} onChange={e => setFormData(p => ({ ...p, y_position: e.target.value }))} className="w-full border p-2 rounded" placeholder="0%" /></div>
            <div><label className="block font-medium mb-1">Width Ratio</label><input type="text" value={formData.width_ratio || ''} onChange={e => setFormData(p => ({ ...p, width_ratio: e.target.value }))} className="w-full border p-2 rounded" placeholder="100%" /></div>
            <div><label className="block font-medium mb-1">Max Limit per order</label><input type="number" value={formData.max_limit ?? ''} onChange={e => setFormData(p => ({ ...p, max_limit: parseInt(e.target.value) }))} className="w-full border p-2 rounded" /></div>
            <div><label className="block font-medium mb-1">Extra Prep Time (min)</label><input type="number" value={formData.extra_prep_time ?? ''} onChange={e => setFormData(p => ({ ...p, extra_prep_time: parseInt(e.target.value) }))} className="w-full border p-2 rounded" /></div>

            <div className="md:col-span-3 flex gap-6 pt-4 border-t mt-2">
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_core ?? false} onChange={e => setFormData(p => ({ ...p, is_core: e.target.checked }))} className="text-[#D62828] rounded focus:ring-[#D62828]" /> Core Default</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_required ?? false} onChange={e => setFormData(p => ({ ...p, is_required: e.target.checked }))} className="text-[#D62828] rounded focus:ring-[#D62828]" /> Required Default</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_available ?? true} onChange={e => setFormData(p => ({ ...p, is_available: e.target.checked }))} className="text-[#D62828] rounded focus:ring-[#D62828]" /> Available in stock</label>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => { setIsAdding(false); setIsEditing(null); }} className="px-4 py-2 font-medium text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 font-medium text-white bg-[#D62828] rounded-lg">Save Ingredient</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-sm text-gray-700">Name</th>
              <th className="p-4 text-sm text-gray-700">Category</th>
              <th className="p-4 text-sm text-gray-700">Price</th>
              <th className="p-4 text-sm text-gray-700">Stock</th>
              <th className="p-4 text-sm text-gray-700">Status</th>
              <th className="p-4 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map(ing => (
              <tr key={ing.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900 flex items-center gap-3">
                  {ing.png_image_url && <img src={ing.png_image_url} alt="" className="w-8 h-8 rounded bg-gray-100 object-contain" />}
                  {ing.name}
                </td>
                <td className="p-4 text-gray-600 capitalize">{ing.category}</td>
                <td className="p-4 text-gray-600">{ing.price_per_unit} / {ing.standard_unit}</td>
                <td className="p-4">
                  {ing.stock_count === null ? <span className="text-gray-500 font-medium">Unlimited</span> : (
                    <span className={`font-bold ${ing.stock_count <= ing.low_stock_alert ? 'text-[#D62828]' : 'text-gray-700'}`}>{ing.stock_count}</span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${ing.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-[#D62828]'}`}>
                    {ing.is_available ? 'In Stock' : 'Sold Out'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => { setIsEditing(ing); setFormData(ing); setIsAdding(false); }} className="text-gray-600 hover:text-gray-900 mr-4 font-medium">Edit</button>
                  <button onClick={() => toggleAvailability(ing.id, ing.is_available)} className="text-[#F7B731] hover:text-yellow-600 font-bold">
                    {ing.is_available ? 'Mark Sold Out' : 'Mark In Stock'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
