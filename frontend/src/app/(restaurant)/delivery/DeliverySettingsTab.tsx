'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { DeliverySettings, deliverySettingsSchema, StaffRole } from './types';

interface DeliverySettingsTabProps {
  initialSettings: DeliverySettings;
  role: StaffRole;
}

export default function DeliverySettingsTab({ initialSettings, role }: DeliverySettingsTabProps) {
  const [settings, setSettings] = useState<DeliverySettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const canEdit = role === 'owner' || role === 'manager';

  // Compare deeply to detect changes
  useEffect(() => {
    const isDifferent = JSON.stringify(settings) !== JSON.stringify(initialSettings);
    setHasUnsavedChanges(isDifferent);
  }, [settings, initialSettings]);

  const handleChange = (field: keyof DeliverySettings, value: any) => {
    if (!canEdit) return;
    setSettings(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSave = async () => {
    if (!canEdit) return;
    
    try {
      const validData = deliverySettingsSchema.parse(settings);
      setErrors({});
      setIsSaving(true);
      
      // Mock API call to update all settings in one row update
      await fetch('/api/restaurant/settings/delivery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validData),
      });

      // After successful save, we could technically update initialSettings 
      // but since it comes from props, resetting hasUnsavedChanges works for optimistic UI
      setHasUnsavedChanges(false);
    } catch (e) {
      if (e instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        e.errors.forEach(err => {
          if (err.path[0]) newErrors[err.path[0].toString()] = err.message;
        });
        setErrors(newErrors);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
      {!canEdit && (
        <div className="mb-6 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-100">
          <strong>Read-only view:</strong> Your role does not have permission to edit delivery settings.
        </div>
      )}

      <div className="space-y-6">
        {/* Master Toggle */}
        <div className="pb-6 border-b border-gray-100">
          <label className="flex items-start gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={settings.delivery_enabled} 
              onChange={e => handleChange('delivery_enabled', e.target.checked)}
              disabled={!canEdit}
              className="mt-1 w-5 h-5 text-[#D62828] border-gray-300 rounded focus:ring-[#D62828]"
            />
            <div>
              <span className="block font-bold text-gray-900 text-lg">Enable Delivery Orders</span>
              <p className="text-sm text-[#EF4444] mt-1 font-medium bg-red-50 inline-block px-2 py-0.5 rounded">
                Warning: Turning this off disables delivery ordering for customers app-wide.
              </p>
            </div>
          </label>
        </div>

        {/* Basic Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Standard delivery charge (Rs.)</label>
            <input 
              type="number" 
              value={settings.delivery_charge} 
              onChange={e => handleChange('delivery_charge', parseFloat(e.target.value) || 0)}
              disabled={!canEdit}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#D62828] focus:border-[#D62828]"
            />
            {errors.delivery_charge && <p className="text-xs text-[#EF4444] mt-1">{errors.delivery_charge}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Free delivery within (km)</label>
            <input 
              type="number" 
              step="0.1"
              value={settings.free_delivery_km} 
              onChange={e => handleChange('free_delivery_km', parseFloat(e.target.value) || 0)}
              disabled={!canEdit}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#D62828] focus:border-[#D62828]"
            />
            {errors.free_delivery_km && <p className="text-xs text-[#EF4444] mt-1">{errors.free_delivery_km}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">Maximum delivery radius (km)</label>
            <input 
              type="number" 
              step="0.1"
              value={settings.max_delivery_km} 
              onChange={e => handleChange('max_delivery_km', parseFloat(e.target.value) || 0)}
              disabled={!canEdit}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#D62828] focus:border-[#D62828]"
            />
            <p className="text-xs text-gray-500 mt-1">Orders outside this radius are blocked at checkout</p>
            {errors.max_delivery_km && <p className="text-xs text-[#EF4444] mt-1">{errors.max_delivery_km}</p>}
          </div>
        </div>

        {/* Surge Pricing Sub-section */}
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <label className="flex items-center gap-3 mb-4 cursor-pointer">
            <input 
              type="checkbox" 
              checked={settings.surge_enabled} 
              onChange={e => handleChange('surge_enabled', e.target.checked)}
              disabled={!canEdit}
              className="w-4 h-4 text-[#D62828] border-gray-300 rounded focus:ring-[#D62828]"
            />
            <span className="font-bold text-gray-900">Enable surge pricing</span>
          </label>

          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-opacity ${settings.surge_enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Surge charge (Rs.)</label>
              <input 
                type="number" 
                value={settings.surge_charge} 
                onChange={e => handleChange('surge_charge', parseFloat(e.target.value) || 0)}
                disabled={!canEdit || !settings.surge_enabled}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-[#D62828] focus:border-[#D62828] bg-white disabled:bg-gray-100"
              />
              {errors.surge_charge && <p className="text-xs text-[#EF4444] mt-1">{errors.surge_charge}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Surge starts at</label>
              <input 
                type="time" 
                value={settings.surge_start_time || ''} 
                onChange={e => handleChange('surge_start_time', e.target.value)}
                disabled={!canEdit || !settings.surge_enabled}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-[#D62828] focus:border-[#D62828] bg-white disabled:bg-gray-100"
              />
              {errors.surge_start_time && <p className="text-xs text-[#EF4444] mt-1">{errors.surge_start_time}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Surge ends at</label>
              <input 
                type="time" 
                value={settings.surge_end_time || ''} 
                onChange={e => handleChange('surge_end_time', e.target.value)}
                disabled={!canEdit || !settings.surge_enabled}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-[#D62828] focus:border-[#D62828] bg-white disabled:bg-gray-100"
              />
              {errors.surge_end_time && <p className="text-xs text-[#EF4444] mt-1">{errors.surge_end_time}</p>}
            </div>
          </div>
        </div>

        {/* Actions */}
        {canEdit && (
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
            {hasUnsavedChanges && (
              <span className="text-sm font-medium text-[#F59E0B] bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
                Unsaved changes
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="px-6 py-2.5 font-bold text-white bg-[#D62828] rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save All Settings'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
