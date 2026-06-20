'use client';

import { useState } from 'react';
import { z } from 'zod';
import { Category } from './types';
import ImageUploadField from './ImageUploadField';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  name_ur: z.string().optional(),
  slug: z.string().min(1, 'Slug is required'),
  image_url: z.string().optional(),
  sort_order: z.number().int().min(0, 'Sort order must be >= 0'),
  is_active: z.boolean(),
});

interface CategoryTabProps {
  initialCategories: Category[];
}

export default function CategoryTab({ initialCategories }: CategoryTabProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isEditing, setIsEditing] = useState<Category | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = async () => {
    try {
      const validData = categorySchema.parse({
        name: formData.name || '',
        name_ur: formData.name_ur || '',
        slug: formData.slug || '',
        image_url: formData.image_url || '',
        sort_order: Number(formData.sort_order) || 0,
        is_active: formData.is_active ?? true,
      });
      
      setErrors({});
      // Call Supabase/API here to save
      // For now, optimistically update state
      if (isEditing) {
        setCategories(prev => prev.map(c => c.id === isEditing.id ? { ...isEditing, ...validData } as Category : c));
      } else {
        setCategories(prev => [...prev, { id: Date.now().toString(), ...validData } as Category]);
      }
      setIsEditing(null);
      setIsAdding(false);
      setFormData({});
    } catch (e) {
      if (e instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        e.errors.forEach(err => {
          if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
        });
        setErrors(fieldErrors);
      }
    }
  };

  const handleToggleActive = (id: string, current: boolean) => {
    // API Call here
    setCategories(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c));
  };

  // Note: Deviation flagged. Stack lock prohibits new drag-and-drop libraries, so using manual integer input for sort_order.

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Categories</h2>
        <button 
          onClick={() => { setIsAdding(true); setFormData({ is_active: true, sort_order: 0 }); }} 
          className="bg-[#D62828] text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          + Add Category
        </button>
      </div>

      {(isAdding || isEditing) && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">{isEditing ? 'Edit Category' : 'New Category'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name (EN) *</label>
              <input 
                type="text" 
                value={formData.name || ''} 
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({ ...prev, name: val, slug: !isEditing ? val.toLowerCase().replace(/\s+/g, '-') : prev.slug }));
                }}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-[#D62828] focus:border-[#D62828]"
              />
              {errors.name && <p className="text-[#D62828] text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name (UR)</label>
              <input 
                type="text" 
                value={formData.name_ur || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, name_ur: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-[#D62828] focus:border-[#D62828]"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input 
                type="text" 
                value={formData.slug || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-[#D62828] focus:border-[#D62828]"
              />
              {errors.slug && <p className="text-[#D62828] text-xs mt-1">{errors.slug}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order (Manual Integer Input)</label>
              <input 
                type="number" 
                value={formData.sort_order ?? ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-[#D62828] focus:border-[#D62828]"
              />
              {errors.sort_order && <p className="text-[#D62828] text-xs mt-1">{errors.sort_order}</p>}
            </div>
            <div className="md:col-span-2">
              <ImageUploadField 
                bucket="menu-images" 
                label="Category Image" 
                value={formData.image_url} 
                onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))} 
              />
            </div>
            <div className="md:col-span-2 flex items-center">
              <input 
                type="checkbox" 
                id="is_active" 
                checked={formData.is_active ?? true} 
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4 text-[#D62828] border-gray-300 rounded focus:ring-[#D62828]"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm font-medium text-gray-700">Active</label>
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <button onClick={() => { setIsAdding(false); setIsEditing(null); }} className="px-4 py-2 font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 font-medium text-white bg-[#D62828] hover:bg-red-700 rounded-lg transition-colors">Save Category</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 text-sm font-bold text-gray-700">Image</th>
              <th className="p-4 text-sm font-bold text-gray-700">Name</th>
              <th className="p-4 text-sm font-bold text-gray-700">Slug</th>
              <th className="p-4 text-sm font-bold text-gray-700">Sort Order</th>
              <th className="p-4 text-sm font-bold text-gray-700">Status</th>
              <th className="p-4 text-sm font-bold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.sort((a, b) => a.sort_order - b.sort_order).map(cat => (
              <tr key={cat.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-10 h-10 rounded object-cover border border-gray-200" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200" />
                  )}
                </td>
                <td className="p-4 font-medium text-gray-900">{cat.name} {cat.name_ur && <span className="text-sm text-gray-500 ml-2" dir="rtl">{cat.name_ur}</span>}</td>
                <td className="p-4 text-gray-500 font-mono text-sm">{cat.slug}</td>
                <td className="p-4 text-gray-500">{cat.sort_order}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {cat.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => { setIsEditing(cat); setFormData(cat); setIsAdding(false); }} className="text-[#D62828] font-medium hover:underline mr-4">Edit</button>
                  <button onClick={() => handleToggleActive(cat.id, cat.is_active)} className="text-gray-500 font-medium hover:text-gray-900">
                    {cat.is_active ? 'Deactivate' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No categories found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
