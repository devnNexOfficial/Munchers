'use client';

import { useState } from 'react';
import { DateRange } from './types';

interface ReportDateRangePickerProps {
  range: DateRange;
  onChange: (range: DateRange) => void;
}

export default function ReportDateRangePicker({ range, onChange }: ReportDateRangePickerProps) {
  const [preset, setPreset] = useState<'today' | 'last7' | 'last30' | 'custom'>('today');

  const getFormattedDate = (d: Date) => d.toISOString().split('T')[0];

  const handlePreset = (p: typeof preset) => {
    setPreset(p);
    const today = new Date();
    
    if (p === 'today') {
      const formatted = getFormattedDate(today);
      onChange({ from: formatted, to: formatted });
    } else if (p === 'last7') {
      const last7 = new Date(today);
      last7.setDate(last7.getDate() - 7);
      onChange({ from: getFormattedDate(last7), to: getFormattedDate(today) });
    } else if (p === 'last30') {
      const last30 = new Date(today);
      last30.setDate(last30.getDate() - 30);
      onChange({ from: getFormattedDate(last30), to: getFormattedDate(today) });
    }
  };

  return (
    <div className="flex flex-wrap gap-4 items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div className="flex gap-2">
        {['today', 'last7', 'last30', 'custom'].map(p => (
          <button
            key={p}
            onClick={() => handlePreset(p as any)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg capitalize transition-colors ${preset === p ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {p === 'today' ? 'Today' : p === 'custom' ? 'Custom' : p.replace('last', 'Last ')}
          </button>
        ))}
      </div>
      
      {preset === 'custom' && (
        <div className="flex items-center gap-3">
          <input 
            type="date" 
            value={range.from} 
            onChange={e => onChange({ ...range, from: e.target.value })}
            className="border border-gray-300 rounded p-1.5 text-sm focus:ring-[#D62828]"
          />
          <span className="text-gray-500 font-medium">to</span>
          <input 
            type="date" 
            value={range.to} 
            onChange={e => onChange({ ...range, to: e.target.value })}
            className="border border-gray-300 rounded p-1.5 text-sm focus:ring-[#D62828]"
          />
        </div>
      )}
    </div>
  );
}
