'use client';

import { useState } from 'react';
import { z } from 'zod';
import { MenuItem, Category, Ingredient, MenuItemIngredient, SizeVariant, MealOption } from './types';
import ImageUploadField from './ImageUploadField';
import MenuItemIngredientPanel from './MenuItemIngredientPanel';

const menuItemSchema = z.object({
  name: z.string().min(1, 'Name required'),
  name_ur: z.string().optional(),
  description: z.string().optional(),
  description_ur: z.string().optional(),
  image_url: z.string().min(1, 'Image required'),
  category_id: z.string().min(1, 'Category required'),
  base_price: z.number().min(0, 'Price must be >= 0'),
  discount_price: z.number().optional(),
  show_discount: z.boolean(),
  canvas_type: z.enum(['burger', 'pizza', 'roll', 'simple']),
  base_prep_time: z.number().min(0),
  is_available: z.boolean(),
  is_featured: z.boolean(),
  is_best_seller: z.boolean(),
  with_meal: z.boolean(),
  daily_special: z.boolean(),
  special_ends_at: z.string().optional(),
  sort_order: z.number().int(),
});

interface MenuItemTabProps {
  initialItems: MenuItem[];
  categories: Category[];
  allIngredients: Ingredient[];
  initialAssignments: MenuItemIngredient[]; // normally fetched per item, assuming passed here for simplicity or fetched inline
}

export default function MenuItemTab({ initialItems, categories, allIngredients, initialAssignments }: MenuItemTabProps) {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [assignments, setAssignments] = useState<MenuItemIngredient[]>(initialAssignments);
  
  const [isEditing, setIsEditing] = useState<MenuItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<MenuItem>>({});
  const [sizes, setSizes] = useState<SizeVariant[]>([]);
  const [meals, setMeals] = useState<MealOption[]>([]);
  const [currentAssignments, setCurrentAssignments] = useState<MenuItemIngredient[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleEdit = (item: MenuItem) => {
    setIsEditing(item);
    setFormData(item);
    setSizes(item.size_variants || []);
    setMeals(item.meal_options || []);
    setCurrentAssignments(assignments.filter(a => a.menu_item_id === item.id));
    setIsAdding(false);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({ is_available: true, show_discount: false, canvas_type: 'simple', with_meal: false, daily_special: false });
    setSizes([]);
    setMeals([]);
    setCurrentAssignments([]);
    setIsEditing(null);
  };

  const handleSave = async () => {
    try {
      const validData = menuItemSchema.parse({
        name: formData.name || '',
        name_ur: formData.name_ur || '',
        description: formData.description || '',
        description_ur: formData.description_ur || '',
        image_url: formData.image_url || '',
        category_id: formData.category_id || '',
        base_price: Number(formData.base_price) || 0,
        discount_price: formData.discount_price ? Number(formData.discount_price) : undefined,
        show_discount: formData.show_discount ?? false,
        canvas_type: formData.canvas_type || 'simple',
        base_prep_time: Number(formData.base_prep_time) || 0,
        is_available: formData.is_available ?? true,
        is_featured: formData.is_featured ?? false,
        is_best_seller: formData.is_best_seller ?? false,
        with_meal: formData.with_meal ?? false,
        daily_special: formData.daily_special ?? false,
        special_ends_at: formData.special_ends_at || undefined,
        sort_order: Number(formData.sort_order) || 0,
      });

      setErrors({});
      const finalItem: MenuItem = {
        id: isEditing ? isEditing.id : Date.now().toString(),
        ...validData,
        size_variants: sizes.length > 0 ? sizes : undefined,
        meal_options: validData.with_meal && meals.length > 0 ? meals : undefined,
      };

      if (isEditing) {
        setItems(prev => prev.map(i => i.id === finalItem.id ? finalItem : i));
        // Update assignments globally
        setAssignments(prev => [...prev.filter(a => a.menu_item_id !== finalItem.id), ...currentAssignments]);
      } else {
        setItems(prev => [...prev, finalItem]);
        setAssignments(prev => [...prev, ...currentAssignments.map(a => ({ ...a, menu_item_id: finalItem.id }))]);
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
    setItems(prev => prev.map(i => i.id === id ? { ...i, is_available: !current } : i));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Menu Items</h2>
        <button onClick={handleAdd} className="bg-[#D62828] text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">+ Add Menu Item</button>
      </div>

      {(isAdding || isEditing) && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">{isEditing ? 'Edit Menu Item' : 'New Menu Item'}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <label className="block font-medium mb-1">Name (EN) *</label>
              <input type="text" value={formData.name || ''} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full border p-2 rounded" />
              {errors.name && <p className="text-[#D62828] text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block font-medium mb-1">Name (UR)</label>
              <input type="text" value={formData.name_ur || ''} onChange={e => setFormData(p => ({ ...p, name_ur: e.target.value }))} className="w-full border p-2 rounded" dir="rtl" />
            </div>
            
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg bg-gray-50">
              <ImageUploadField bucket="menu-images" label="Menu Item Image *" value={formData.image_url} onChange={url => setFormData(p => ({ ...p, image_url: url }))} />
              <div>
                <label className="block font-medium mb-1">Category *</label>
                <select value={formData.category_id || ''} onChange={e => setFormData(p => ({ ...p, category_id: e.target.value }))} className="w-full border p-2 rounded bg-white">
                  <option value="">-- Choose Category --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.category_id && <p className="text-[#D62828] text-xs mt-1">{errors.category_id}</p>}
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">Base Price *</label>
              <input type="number" value={formData.base_price ?? ''} onChange={e => setFormData(p => ({ ...p, base_price: parseFloat(e.target.value) }))} className="w-full border p-2 rounded" />
              {errors.base_price && <p className="text-[#D62828] text-xs mt-1">{errors.base_price}</p>}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block font-medium mb-1">Discount Price</label>
                <input type="number" value={formData.discount_price ?? ''} onChange={e => setFormData(p => ({ ...p, discount_price: e.target.value === '' ? undefined : parseFloat(e.target.value) }))} className="w-full border p-2 rounded" />
              </div>
              <div className="mt-6 flex items-center gap-2">
                <input type="checkbox" checked={formData.show_discount ?? false} onChange={e => setFormData(p => ({ ...p, show_discount: e.target.checked }))} className="text-[#D62828]" />
                <label className="font-medium">Show Discount</label>
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">Canvas Type *</label>
              <select value={formData.canvas_type || 'simple'} onChange={e => setFormData(p => ({ ...p, canvas_type: e.target.value as any }))} className="w-full border p-2 rounded">
                <option value="simple">Simple</option>
                <option value="burger">Burger</option>
                <option value="pizza">Pizza</option>
                <option value="roll">Roll</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Base Prep Time (min)</label>
              <input type="number" value={formData.base_prep_time ?? ''} onChange={e => setFormData(p => ({ ...p, base_prep_time: parseInt(e.target.value) }))} className="w-full border p-2 rounded" />
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium mb-1">Size Variants (JSONB)</label>
              <div className="space-y-2 mb-2">
                {sizes.map((s, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input type="text" value={s.label} onChange={e => { const n = [...sizes]; n[idx].label = e.target.value; setSizes(n); }} placeholder="Label (e.g. Medium)" className="border p-2 rounded flex-1" />
                    <input type="number" value={s.price} onChange={e => { const n = [...sizes]; n[idx].price = parseFloat(e.target.value); setSizes(n); }} placeholder="Price" className="border p-2 rounded w-32" />
                    <button onClick={() => setSizes(sizes.filter((_, i) => i !== idx))} className="text-[#D62828] px-2 font-bold">X</button>
                  </div>
                ))}
              </div>
              <button onClick={() => setSizes([...sizes, { label: '', price: 0 }])} className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">+ Add Size Variant</button>
            </div>

            <div className="md:col-span-2 flex flex-wrap gap-6 pt-4 border-t mt-2">
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_available ?? true} onChange={e => setFormData(p => ({ ...p, is_available: e.target.checked }))} className="text-[#D62828]" /> Available</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_featured ?? false} onChange={e => setFormData(p => ({ ...p, is_featured: e.target.checked }))} className="text-[#D62828]" /> Featured</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_best_seller ?? false} onChange={e => setFormData(p => ({ ...p, is_best_seller: e.target.checked }))} className="text-[#D62828]" /> Best Seller</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.with_meal ?? false} onChange={e => setFormData(p => ({ ...p, with_meal: e.target.checked }))} className="text-[#D62828]" /> Has Meal Options</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.daily_special ?? false} onChange={e => setFormData(p => ({ ...p, daily_special: e.target.checked }))} className="text-[#D62828]" /> Daily Special</label>
            </div>

            {formData.with_meal && (
              <div className="md:col-span-2 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <label className="block font-medium mb-1">Meal Options (JSONB)</label>
                <div className="space-y-2 mb-2">
                  {meals.map((m, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input type="text" value={m.label} onChange={e => { const n = [...meals]; n[idx].label = e.target.value; setMeals(n); }} placeholder="Label (e.g. Fries + Drink)" className="border p-2 rounded flex-1" />
                      <input type="number" value={m.price} onChange={e => { const n = [...meals]; n[idx].price = parseFloat(e.target.value); setMeals(n); }} placeholder="Extra Price" className="border p-2 rounded w-32" />
                      <button onClick={() => setMeals(meals.filter((_, i) => i !== idx))} className="text-[#D62828] px-2 font-bold">X</button>
                    </div>
                  ))}
                </div>
                <button onClick={() => setMeals([...meals, { label: '', price: 0 }])} className="text-sm bg-white border border-gray-300 px-3 py-1 rounded">+ Add Meal Option</button>
              </div>
            )}

            {formData.daily_special && (
              <div>
                <label className="block font-medium mb-1">Special Ends At</label>
                <input type="datetime-local" value={formData.special_ends_at || ''} onChange={e => setFormData(p => ({ ...p, special_ends_at: e.target.value }))} className="w-full border p-2 rounded" />
              </div>
            )}

            <div>
              <label className="block font-medium mb-1">Sort Order (Manual Int)</label>
              <input type="number" value={formData.sort_order ?? ''} onChange={e => setFormData(p => ({ ...p, sort_order: parseInt(e.target.value) }))} className="w-full border p-2 rounded" />
            </div>
          </div>

          <MenuItemIngredientPanel 
            menuItemId={isEditing?.id || 'new'} 
            assignments={currentAssignments} 
            allIngredients={allIngredients} 
            onUpdate={setCurrentAssignments} 
          />

          <div className="flex justify-end gap-3 mt-6 border-t pt-4">
            <button onClick={() => { setIsAdding(false); setIsEditing(null); }} className="px-4 py-2 font-medium text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 font-medium text-white bg-[#D62828] rounded-lg hover:bg-red-700">Save Menu Item</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-sm text-gray-700">Image</th>
              <th className="p-4 text-sm text-gray-700">Name</th>
              <th className="p-4 text-sm text-gray-700">Category</th>
              <th className="p-4 text-sm text-gray-700">Price</th>
              <th className="p-4 text-sm text-gray-700">Status</th>
              <th className="p-4 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.sort((a, b) => a.sort_order - b.sort_order).map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4">
                  {item.image_url ? <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded object-cover" /> : <div className="w-12 h-12 bg-gray-100 rounded" />}
                </td>
                <td className="p-4 font-medium text-gray-900">{item.name}</td>
                <td className="p-4 text-gray-600">{categories.find(c => c.id === item.category_id)?.name || 'Unknown'}</td>
                <td className="p-4 text-gray-900 font-bold">Rs. {item.base_price}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${item.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-[#D62828]'}`}>
                    {item.is_available ? 'Available' : 'Sold Out'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleEdit(item)} className="text-gray-600 hover:text-gray-900 mr-4 font-medium">Edit</button>
                  <button onClick={() => toggleAvailability(item.id, item.is_available)} className="text-[#F7B731] hover:text-yellow-600 font-bold">
                    {item.is_available ? 'Mark Sold Out' : 'Mark Available'}
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
