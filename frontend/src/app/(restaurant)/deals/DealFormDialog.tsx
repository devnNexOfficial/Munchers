'use client';

import { useState } from 'react';
import { z } from 'zod';
import { Deal, MenuItemOption, dealSchema } from './types';
import DealItemsPanel from './DealItemsPanel';
import DealCustomizeLimitPanel from './DealCustomizeLimitPanel';
import ImageUploadField from '../menu/ImageUploadField';

interface DealFormDialogProps {
  initialData?: Deal | null;
  menuOptions: MenuItemOption[];
  onSave: (data: Partial<Deal>) => Promise<void>;
  onCancel: () => void;
}

export default function DealFormDialog({ initialData, menuOptions, onSave, onCancel }: DealFormDialogProps) {
  const [formData, setFormData] = useState<Partial<Deal>>({
    name: initialData?.name || '',
    name_ur: initialData?.name_ur || '',
    description: initialData?.description || '',
    image_url: initialData?.image_url || '',
    deal_price: initialData?.deal_price || 0,
    original_price: initialData?.original_price || null,
    items: initialData?.items || [],
    customize_limit: initialData?.customize_limit || null,
    is_active: initialData ? initialData.is_active : true,
    valid_from: initialData?.valid_from || '',
    valid_until: initialData?.valid_until || ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      const validData = dealSchema.parse({
        ...formData,
        original_price: formData.original_price === null || formData.original_price === '' as any ? null : formData.original_price,
        valid_from: formData.valid_from === '' ? null : formData.valid_from,
        valid_until: formData.valid_until === '' ? null : formData.valid_until,
      });
      
      setErrors({});
      setIsSaving(true);
      await onSave(validData);
    } catch (e) {
      if (e instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        e.errors.forEach(err => { if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message; });
        setErrors(fieldErrors);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const savings = formData.original_price && formData.deal_price && formData.original_price > formData.deal_price 
    ? formData.original_price - formData.deal_price 
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-gray-900 text-lg">{initialData ? 'Edit Deal' : 'Add New Deal'}</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Deal Name (EN) *</label>
              <input type="text" value={formData.name || ''} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full border p-2 rounded focus:ring-[#D62828]" />
              {errors.name && <p className="text-[#EF4444] text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Deal Name (UR)</label>
              <input type="text" value={formData.name_ur || ''} onChange={e => setFormData(p => ({ ...p, name_ur: e.target.value }))} className="w-full border p-2 rounded focus:ring-[#D62828]" dir="rtl" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
              <textarea value={formData.description || ''} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className="w-full border p-2 rounded focus:ring-[#D62828] h-20" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg bg-gray-50">
            <ImageUploadField 
              bucket="menu-images" 
              label="Deal Image (Public)" 
              value={formData.image_url || ''} 
              onChange={url => setFormData(p => ({ ...p, image_url: url }))} 
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Deal Price (Rs.) *</label>
              <input type="number" value={formData.deal_price ?? ''} onChange={e => setFormData(p => ({ ...p, deal_price: parseFloat(e.target.value) || 0 }))} className="w-full border p-2 rounded focus:ring-[#D62828]" />
              {errors.deal_price && <p className="text-[#EF4444] text-xs mt-1">{errors.deal_price}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Original Price (Rs.)</label>
              <input type="number" value={formData.original_price ?? ''} onChange={e => setFormData(p => ({ ...p, original_price: e.target.value === '' ? null : parseFloat(e.target.value) }))} className="w-full border p-2 rounded focus:ring-[#D62828]" />
              {errors.original_price && <p className="text-[#EF4444] text-xs mt-1">{errors.original_price}</p>}
            </div>
            {savings > 0 && (
              <div className="flex items-center pt-6">
                <span className="bg-[#F7B731] text-yellow-900 px-3 py-1.5 rounded-lg font-bold text-sm">
                  Save Rs. {savings.toLocaleString('en-PK')}
                </span>
                {/* required inline comment logic */}
                <span className="sr-only text-xs">display only — server recalculates deal pricing at order placement</span>
              </div>
            )}
          </div>

          {/* Validity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Valid From</label>
              <input type="datetime-local" value={formData.valid_from || ''} onChange={e => setFormData(p => ({ ...p, valid_from: e.target.value }))} className="w-full border p-2 rounded focus:ring-[#D62828]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Valid Until</label>
              <input type="datetime-local" value={formData.valid_until || ''} onChange={e => setFormData(p => ({ ...p, valid_until: e.target.value }))} className="w-full border p-2 rounded focus:ring-[#D62828]" />
              {errors.valid_until && <p className="text-[#EF4444] text-xs mt-1">{errors.valid_until}</p>}
            </div>
            <div className="md:col-span-2 text-xs text-blue-800">Leave both blank for "Always Active".</div>
          </div>

          <label className="flex items-center gap-2 mt-4 cursor-pointer">
            <input type="checkbox" checked={formData.is_active} onChange={e => setFormData(p => ({ ...p, is_active: e.target.checked }))} className="text-[#D62828] rounded focus:ring-[#D62828]" />
            <span className="font-bold text-gray-900">Active</span>
          </label>

          <DealItemsPanel items={formData.items || []} menuOptions={menuOptions} onChange={items => setFormData(p => ({ ...p, items }))} error={errors.items} />
          
          <DealCustomizeLimitPanel items={formData.items || []} menuOptions={menuOptions} limits={formData.customize_limit || {}} onChange={limits => setFormData(p => ({ ...p, customize_limit: limits }))} />
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button onClick={onCancel} disabled={isSaving} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 text-sm font-bold text-white bg-[#D62828] hover:bg-red-700 rounded-lg disabled:opacity-50">
            {isSaving ? 'Saving...' : 'Save Deal'}
          </button>
        </div>
      </div>
    </div>
  );
}
