'use client';

import { useState } from 'react';
import { StaffAccount, StaffRole } from './types';

interface StaffRowProps {
  staff: StaffAccount;
  currentUserId: string;
  onUpdateActive: (id: string, active: boolean) => Promise<void>;
}

export default function StaffRow({ staff, currentUserId, onUpdateActive }: StaffRowProps) {
  const [showDeactivatePrompt, setShowDeactivatePrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isSelf = staff.user_id === currentUserId;

  const getRoleColor = (role: StaffRole) => {
    switch (role) {
      case 'owner': return 'bg-[#D62828] text-white border-[#D62828]';
      case 'manager': return 'bg-[#F7B731] text-yellow-900 border-[#F7B731]';
      case 'chef': return 'bg-gray-200 text-gray-700 border-gray-300';
    }
  };

  const handleToggleActive = async () => {
    if (isSelf) return;
    
    if (staff.is_active) {
      setShowDeactivatePrompt(true);
    } else {
      // Reactivate (no prompt needed)
      setIsUpdating(true);
      await onUpdateActive(staff.id, true);
      setIsUpdating(false);
    }
  };

  const handleConfirmDeactivate = async () => {
    setShowDeactivatePrompt(false);
    setIsUpdating(true);
    await onUpdateActive(staff.id, false);
    setIsUpdating(false);
  };

  return (
    <>
      <tr className={`border-b border-gray-100 transition-colors ${!staff.is_active ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'}`}>
        <td className="p-4">
          <div className="font-bold text-gray-900">{staff.name}</div>
          {isSelf && <div className="text-[10px] font-bold text-[#D62828] uppercase mt-0.5">You</div>}
        </td>
        <td className="p-4">
          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${getRoleColor(staff.role)}`}>
            {staff.role}
          </span>
        </td>
        <td className="p-4">
          {staff.is_active ? (
            <span className="px-2 py-1 bg-green-100 text-[#22C55E] text-xs font-bold uppercase rounded">Active</span>
          ) : (
            <span className="px-2 py-1 bg-gray-200 text-gray-500 text-xs font-bold uppercase rounded">Inactive</span>
          )}
        </td>
        <td className="p-4 text-xs text-gray-500 font-medium">
          {new Date(staff.created_at).toLocaleDateString()}
        </td>
        <td className="p-4 text-right">
          <button 
            onClick={handleToggleActive}
            disabled={isUpdating || isSelf}
            title={isSelf ? "You cannot deactivate your own account" : undefined}
            className={`text-sm font-bold ${
              isSelf ? 'text-gray-300 cursor-not-allowed' 
              : staff.is_active ? 'text-[#D62828] hover:text-red-700' 
              : 'text-gray-900 hover:underline'
            }`}
          >
            {staff.is_active ? 'Deactivate' : 'Reactivate'}
          </button>
        </td>
      </tr>

      {showDeactivatePrompt && (
        <tr>
          <td colSpan={5} className="bg-red-50 p-4 border-b border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#D62828]">Deactivate {staff.name}?</p>
                <p className="text-xs text-red-800 mt-1">They will lose access to the restaurant panel immediately.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeactivatePrompt(false)} 
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDeactivate} 
                  className="px-3 py-1.5 text-sm font-medium text-white bg-[#D62828] rounded hover:bg-red-700"
                >
                  Yes, Deactivate
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
