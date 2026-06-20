'use client';

import { useState } from 'react';
import { Rider, RiderStatus, StaffRole } from './types';

interface RiderRowProps {
  rider: Rider;
  role: StaffRole;
  onEdit: (rider: Rider) => void;
  onUpdateStatus: (id: string, updates: Partial<Rider>) => Promise<void>;
}

export default function RiderRow({ rider, role, onEdit, onUpdateStatus }: RiderRowProps) {
  const [showPhone, setShowPhone] = useState(false);
  const [showDeactivatePrompt, setShowDeactivatePrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const canEdit = role === 'owner' || role === 'manager';

  const getStatus = (): RiderStatus => {
    if (!rider.is_active) return 'inactive';
    if (!rider.is_available) return 'on_delivery';
    return 'available';
  };
  const status = getStatus();

  const handleToggleActive = async () => {
    if (!canEdit) return;
    if (rider.is_active) {
      setShowDeactivatePrompt(true); // requires prompt
    } else {
      setIsUpdating(true);
      await onUpdateStatus(rider.id, { is_active: true });
      setIsUpdating(false);
    }
  };

  const handleConfirmDeactivate = async () => {
    setShowDeactivatePrompt(false);
    setIsUpdating(true);
    await onUpdateStatus(rider.id, { is_active: false });
    setIsUpdating(false);
  };

  const handleToggleAvailable = async () => {
    if (!canEdit || !rider.is_active) return;
    setIsUpdating(true);
    await onUpdateStatus(rider.id, { is_available: !rider.is_available });
    setIsUpdating(false);
  };

  const maskPhone = (phone: string) => {
    if (phone.length <= 6) return '•••';
    const first4 = phone.slice(0, 4);
    const last2 = phone.slice(-2);
    return `${first4} ••••• ${last2}`;
  };

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td className="p-4">
          <div className="font-bold text-gray-900">{rider.name}</div>
          <div className="text-xs text-gray-400">Added: {new Date(rider.created_at).toLocaleDateString()}</div>
        </td>
        <td className="p-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-gray-600">
              {showPhone && canEdit ? rider.phone : maskPhone(rider.phone)}
            </span>
            {canEdit && !showPhone && (
              <button onClick={() => setShowPhone(true)} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold hover:bg-gray-200">Reveal</button>
            )}
            {canEdit && showPhone && (
              <button onClick={() => setShowPhone(false)} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold hover:bg-gray-200">Hide</button>
            )}
          </div>
        </td>
        <td className="p-4">
          {status === 'available' && <span className="px-2 py-1 bg-green-100 text-[#22C55E] text-xs font-bold uppercase rounded">Available</span>}
          {status === 'on_delivery' && <span className="px-2 py-1 bg-orange-100 text-[#F59E0B] text-xs font-bold uppercase rounded">On Delivery</span>}
          {status === 'inactive' && <span className="px-2 py-1 bg-gray-200 text-gray-500 text-xs font-bold uppercase rounded">Inactive</span>}
        </td>
        <td className="p-4 text-right">
          {canEdit ? (
            <div className="flex justify-end gap-3 items-center">
              <button onClick={() => onEdit(rider)} disabled={isUpdating} className="text-sm font-bold text-gray-500 hover:text-gray-900">Edit</button>
              
              <div className="h-4 w-px bg-gray-300"></div>
              
              <button 
                onClick={handleToggleAvailable} 
                disabled={isUpdating || !rider.is_active} 
                className={`text-sm font-bold ${rider.is_active ? (rider.is_available ? 'text-[#F59E0B] hover:text-orange-700' : 'text-[#22C55E] hover:text-green-700') : 'text-gray-300 cursor-not-allowed'}`}
              >
                {rider.is_available ? 'Set On Delivery' : 'Set Available'}
              </button>

              <div className="h-4 w-px bg-gray-300"></div>

              <button 
                onClick={handleToggleActive} 
                disabled={isUpdating} 
                className={`text-sm font-bold ${rider.is_active ? 'text-[#D62828] hover:text-red-700' : 'text-gray-900 hover:underline'}`}
              >
                {rider.is_active ? 'Deactivate' : 'Reactivate'}
              </button>
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">Read-only</span>
          )}
        </td>
      </tr>

      {showDeactivatePrompt && (
        <tr>
          <td colSpan={4} className="bg-red-50 p-4 border-b border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#D62828]">Deactivate {rider.name}?</p>
                <p className="text-xs text-red-800 mt-1">They will be removed from order assignment until reactivated.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowDeactivatePrompt(false)} className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleConfirmDeactivate} className="px-3 py-1.5 text-sm font-medium text-white bg-[#D62828] rounded hover:bg-red-700">
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
