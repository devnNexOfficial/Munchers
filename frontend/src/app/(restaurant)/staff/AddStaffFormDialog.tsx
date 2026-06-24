'use client';

import { useState } from 'react';
import { z } from 'zod';
import { StaffRole } from './types';

interface AddStaffFormDialogProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const addStaffSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['owner', 'manager', 'chef'] as const, { required_error: 'Role is required' }),
});

export default function AddStaffFormDialog({ onSuccess, onCancel }: AddStaffFormDialogProps) {
  const [formData, setFormData] = useState({ name: '', email: '', role: 'chef' as StaffRole });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      const validData = addStaffSchema.parse(formData);
      setErrors({});
      setApiError(null);
      setIsSaving(true);

      // TODO: KNOWN GAP - THIS ENDPOINT DOES NOT EXIST
      // POST /api/restaurant/staff
      // There is no staff_accounts email column and creating auth.users requires service_role admin privileges.
      // Do NOT insert directly into staff_accounts here or try to use admin API from client.
      // Awaiting backend implementation.
      const res = await fetch('/api/restaurant/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validData)
      });

      if (!res.ok) {
        // Will likely 404 until built
        throw new Error(`Endpoint returned ${res.status}: Not implemented yet.`);
      }

      onSuccess();
    } catch (e) {
      if (e instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        e.errors.forEach(err => { if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message; });
        setErrors(fieldErrors);
      } else if (e instanceof Error) {
        setApiError(e.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 text-lg">Add Staff Account</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        
        <div className="p-6 space-y-4">
          {apiError && (
            <div className="bg-red-50 text-red-800 text-sm p-3 rounded border border-red-200 font-medium">
              API Error: {apiError}
              <p className="text-xs font-normal mt-1 opacity-80">
                Note: Backend endpoint `POST /api/restaurant/staff` is not yet implemented.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Full Name *</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Ali Khan"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#D62828]"
            />
            {errors.name && <p className="text-[#EF4444] text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email Address *</label>
            <input 
              type="email" 
              value={formData.email} 
              onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
              placeholder="ali@example.com"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#D62828]"
            />
            {errors.email && <p className="text-[#EF4444] text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Role *</label>
            <select 
              value={formData.role} 
              onChange={e => setFormData(p => ({ ...p, role: e.target.value as StaffRole }))}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#D62828]"
            >
              <option value="owner">Owner (Full Access)</option>
              <option value="manager">Manager (No Staff Access)</option>
              <option value="chef">Chef (KDS Only)</option>
            </select>
            {errors.role && <p className="text-[#EF4444] text-xs mt-1">{errors.role}</p>}
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onCancel} disabled={isSaving} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
          <button onClick={handleSubmit} disabled={isSaving} className="px-4 py-2 text-sm font-bold text-white bg-[#D62828] hover:bg-red-700 rounded-lg disabled:opacity-50">
            {isSaving ? 'Saving...' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
