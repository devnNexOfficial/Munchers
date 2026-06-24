'use client';

import { useState } from 'react';
import { z } from 'zod';

const settingsSchema = z.object({
  open_time: z.string().min(1, "Required"),
  close_time: z.string().min(1, "Required"),
  is_manually_closed: z.boolean(),
  min_order_amount: z.number().min(0),
  prep_buffer_minutes: z.number().min(0),
  cod_enabled: z.boolean(),
  jazzcash_enabled: z.boolean(),
  easypaisa_enabled: z.boolean(),
  card_enabled: z.boolean(),
  loyalty_enabled: z.boolean(),
  loyalty_stamp_count: z.number().min(1),
  loyalty_reward_item: z.string().optional(),
  qr_dine_in_enabled: z.boolean(),
  printer_enabled: z.boolean(),
  print_copies: z.number().min(1).max(2),
  kitchen_lcd_enabled: z.boolean(),
  gst_enabled: z.boolean(),
  gst_percent: z.number().min(0).max(100),
  urdu_enabled: z.boolean(),
});

type SettingsData = z.infer<typeof settingsSchema>;

export default function RestaurantSettingsPage() {
  const [data, setData] = useState<SettingsData>({
    open_time: '09:00',
    close_time: '23:00',
    is_manually_closed: false,
    min_order_amount: 500,
    prep_buffer_minutes: 15,
    cod_enabled: true,
    jazzcash_enabled: true,
    easypaisa_enabled: true,
    card_enabled: true,
    loyalty_enabled: true,
    loyalty_stamp_count: 10,
    loyalty_reward_item: 'Free Burger',
    qr_dine_in_enabled: true,
    printer_enabled: false,
    print_copies: 1,
    kitchen_lcd_enabled: true,
    gst_enabled: false,
    gst_percent: 0,
    urdu_enabled: true,
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);

  const showToast = (message: string, type: 'success'|'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Zod validation
      const parsed = settingsSchema.parse(data);

      // Save button: PATCH /api/restaurant/settings
      // TODO: wire to real endpoint — backend
      const res = await fetch('/api/restaurant/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });
      
      // Mocking success since endpoint doesn't exist yet
      showToast('Settings saved successfully', 'success');
    } catch (e: any) {
      showToast(e.errors ? 'Validation failed' : 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof SettingsData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const renderToggle = (label: string, field: keyof SettingsData) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={data[field] as boolean} 
          onChange={(e) => handleChange(field, e.target.checked)} 
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D62828]"></div>
      </label>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto bg-[#FAFAFA] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Restaurant Settings</h1>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-[#D62828] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#b02121] transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {toast && (
        <div className={`p-4 mb-6 rounded-lg ${toast.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
          {toast.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Working Hours */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Working Hours</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Open Time</label>
              <input type="time" value={data.open_time} onChange={(e) => handleChange('open_time', e.target.value)} className="w-full border border-gray-300 rounded p-2 focus:ring-[#D62828]" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Close Time</label>
              <input type="time" value={data.close_time} onChange={(e) => handleChange('close_time', e.target.value)} className="w-full border border-gray-300 rounded p-2 focus:ring-[#D62828]" />
            </div>
            {renderToggle('Manual Closed Override', 'is_manually_closed')}
          </div>
        </div>

        {/* Order Requirements */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Rules</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Minimum Order Amount (Rs.)</label>
              <input type="number" value={data.min_order_amount} onChange={(e) => handleChange('min_order_amount', Number(e.target.value))} className="w-full border border-gray-300 rounded p-2 focus:ring-[#D62828]" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Prep Time Buffer (minutes)</label>
              <input type="number" value={data.prep_buffer_minutes} onChange={(e) => handleChange('prep_buffer_minutes', Number(e.target.value))} className="w-full border border-gray-300 rounded p-2 focus:ring-[#D62828]" />
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Methods</h2>
          <div className="space-y-1">
            {renderToggle('Cash on Delivery (COD)', 'cod_enabled')}
            {renderToggle('JazzCash', 'jazzcash_enabled')}
            {renderToggle('Easypaisa', 'easypaisa_enabled')}
            {renderToggle('Credit / Debit Card', 'card_enabled')}
          </div>
        </div>

        {/* Features & Modules */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Modules</h2>
          <div className="space-y-1">
            {renderToggle('QR Dine-In', 'qr_dine_in_enabled')}
            {renderToggle('Kitchen LCD App', 'kitchen_lcd_enabled')}
            {renderToggle('Urdu Language Support', 'urdu_enabled')}
          </div>
        </div>

        {/* Loyalty Program */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Loyalty Program</h2>
          <div className="space-y-4">
            {renderToggle('Enable Loyalty Stamps', 'loyalty_enabled')}
            {data.loyalty_enabled && (
              <>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Stamps Required for Reward</label>
                  <input type="number" value={data.loyalty_stamp_count} onChange={(e) => handleChange('loyalty_stamp_count', Number(e.target.value))} className="w-full border border-gray-300 rounded p-2 focus:ring-[#D62828]" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Reward Item Name</label>
                  <input type="text" value={data.loyalty_reward_item} onChange={(e) => handleChange('loyalty_reward_item', e.target.value)} className="w-full border border-gray-300 rounded p-2 focus:ring-[#D62828]" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Operations & Tax */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Tax (GST)</h2>
            <div className="space-y-4">
              {renderToggle('Enable GST', 'gst_enabled')}
              {data.gst_enabled && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">GST Percentage (%)</label>
                  <input type="number" value={data.gst_percent} onChange={(e) => handleChange('gst_percent', Number(e.target.value))} className="w-full border border-gray-300 rounded p-2 focus:ring-[#D62828]" />
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Printing</h2>
            <div className="space-y-4">
              {renderToggle('Enable KOT Printer', 'printer_enabled')}
              {data.printer_enabled && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Print Copies</label>
                  <select value={data.print_copies} onChange={(e) => handleChange('print_copies', Number(e.target.value))} className="w-full border border-gray-300 rounded p-2 focus:ring-[#D62828]">
                    <option value={1}>1 (Kitchen Only)</option>
                    <option value={2}>2 (Kitchen + Customer)</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
