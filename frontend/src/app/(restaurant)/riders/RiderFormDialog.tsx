'use client';

import { useState } from 'react';
import { z } from 'zod';
import { Rider, riderSchema } from './types';

interface RiderFormDialogProps {
  initialData?: Rider | null;
  onSave: (data: Partial<Rider>) => Promise<void>;
  onCancel: () => void;
}

export default function RiderFormDialog({ initialData, onSave, onCancel }: RiderFormDialogProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      const validData = riderSchema.parse(formData);
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 text-lg">{initialData ? 'Edit Rider' : 'Add New Rider'}</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Rider Name</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Ali Khan"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#D62828] focus:border-[#D62828] text-gray-900"
            />
            {errors.name && <p className="text-[#EF4444] text-xs mt-1 font-medium">{errors.name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
            <input 
              type="text" 
              value={formData.phone} 
              onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
              placeholder="e.g. 0300-1234567"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#D62828] focus:border-[#D62828] text-gray-900"
            />
            {errors.phone && <p className="text-[#EF4444] text-xs mt-1 font-medium">{errors.phone}</p>}
            <p className="text-[10px] text-gray-500 mt-1">Phone format is validated on the server.</p>
          </div>
          
          {!initialData && (
            <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg border border-blue-100 mt-4">
              New riders are created with <strong>Active</strong> and <strong>Available</strong> status by default.
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-bold text-white bg-[#D62828] hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Rider'}
          </button>
        </div>
      </div>
    </div>
  );
}
