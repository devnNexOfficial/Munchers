'use client';

import { useState } from 'react';
import { Rider } from './types';

interface KDSRiderSelectProps {
  riders: Rider[];
  onClose: () => void;
  onSubmit: (riderId: string) => void;
}

export default function KDSRiderSelect({ riders, onClose, onSubmit }: KDSRiderSelectProps) {
  const [selectedRider, setSelectedRider] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRider) {
      onSubmit(selectedRider);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden">
        <div className="border-b border-gray-100 p-4">
          <h3 className="font-bold text-gray-900 text-lg">Assign Rider</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="rider" className="block text-sm font-medium text-gray-700 mb-2">
              Select Rider <span className="text-[#D62828]">*</span>
            </label>
            <select
              id="rider"
              value={selectedRider}
              onChange={(e) => setSelectedRider(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#D62828] bg-white text-gray-900"
            >
              <option value="" disabled>Choose an active rider...</option>
              {riders.map(rider => (
                <option key={rider.id} value={rider.id}>
                  {rider.name}
                </option>
              ))}
            </select>
            {riders.length === 0 && (
              <p className="text-xs text-[#D62828] mt-2">No active/available riders found.</p>
            )}
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedRider}
              className="px-4 py-2 font-medium text-white bg-[#D62828] hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Assign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
