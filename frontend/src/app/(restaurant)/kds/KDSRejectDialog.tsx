'use client';

import { useState } from 'react';

interface KDSRejectDialogProps {
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export default function KDSRejectDialog({ onClose, onSubmit }: KDSRejectDialogProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onSubmit(reason.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="border-b border-gray-100 p-4">
          <h3 className="font-bold text-gray-900 text-lg">Reject Order</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Rejection <span className="text-[#D62828]">*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#D62828]"
              placeholder="e.g., Item out of stock, Closing soon..."
            />
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
              disabled={!reason.trim()}
              className="px-4 py-2 font-medium text-white bg-[#D62828] hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
