'use client';

import React, { useState } from 'react';
import { Rider, StaffRole, RiderStatus } from './types';
import RiderFormDialog from './RiderFormDialog';


interface RidersListProps {
  initialRiders: Rider[];
  role: StaffRole;
}

export default function RidersList({ initialRiders, role }: RidersListProps) {
  const [riders, setRiders] = useState<Rider[]>(initialRiders);
  const [showDialog, setShowDialog] = useState(false);
  const [editingRider, setEditingRider] = useState<Rider | null>(null);
  const [deactivatePromptId, setDeactivatePromptId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const canEdit = role === 'owner' || role === 'manager';

  const getRiderStatus = (rider: Rider): RiderStatus => {
    if (!rider.is_active) return 'inactive';
    if (!rider.is_available) return 'busy';
    return 'available';
  };

  const handleUpdateStatus = async (id: string, updates: Partial<Rider>) => {
    setIsUpdating(id);
    
    // Optimistic UI update
    setRiders(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));

    try {
      const res = await fetch(`/api/restaurant/riders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        throw new Error('Failed to update rider');
      }
    } catch (err) {
      console.error('Update status error:', err);
      // Revert optimistic update on failure
      setRiders(prev => prev.map(r => r.id === id ? { ...r, ...Object.keys(updates).reduce((acc, key) => ({ ...acc, [key]: !(updates as any)[key] }), {}) } : r));
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDeactivate = (rider: Rider) => {
    if (!canEdit) return;
    setDeactivatePromptId(rider.id);
  };

  const handleConfirmDeactivate = async (id: string) => {
    setDeactivatePromptId(null);
    await handleUpdateStatus(id, { is_active: false });
  };

  const handleSaveRider = async (data: Partial<Rider>) => {
    try {
      if (editingRider) {
        // Edit existing
        const res = await fetch(`/api/restaurant/riders/${editingRider.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          setRiders(prev => prev.map(r => r.id === editingRider.id ? { ...r, ...data } as Rider : r));
        }
      } else {
        // Add new
        const res = await fetch('/api/restaurant/riders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, is_active: true, is_available: true }),
        });
        if (res.ok) {
          const newRider = await res.json();
          setRiders(prev => [newRider, ...prev]);
        }
      }
      setShowDialog(false);
      setEditingRider(null);
    } catch (err) {
      console.error('Save rider error:', err);
    }
  };

  const openAdd = () => {
    setEditingRider(null);
    setShowDialog(true);
  };

  const openEdit = (rider: Rider) => {
    setEditingRider(rider);
    setShowDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Riders Management</h2>
          <p className="text-sm text-gray-500">Manage delivery fleet, availability, and active status</p>
        </div>
        {canEdit && (
          <button 
            onClick={openAdd} 
            className="bg-[#D62828] text-white px-5 py-2.5 rounded-lg font-bold hover:bg-red-700 transition-colors"
          >
            + Add Rider
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-sm font-bold text-gray-700">Rider</th>
              <th className="p-4 text-sm font-bold text-gray-700">Phone</th>
              <th className="p-4 text-sm font-bold text-gray-700">Status</th>
              <th className="p-4 text-sm font-bold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {riders.map(rider => {
              const status = getRiderStatus(rider);
              const isPromptOpen = deactivatePromptId === rider.id;
              
              return (
                <React.Fragment key={rider.id}>
                  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{rider.name}</div>
                      <div className="text-xs text-gray-400">Added: {new Date(rider.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4 font-mono text-sm text-gray-600">
                      {rider.phone}
                    </td>
                    <td className="p-4">
                      {status === 'available' && (
                        <span className="px-2.5 py-1 bg-green-50 text-[#22C55E] text-xs font-bold uppercase rounded border border-green-200">
                          Available
                        </span>
                      )}
                      {status === 'busy' && (
                        <span className="px-2.5 py-1 bg-orange-50 text-[#F59E0B] text-xs font-bold uppercase rounded border border-orange-200">
                          Busy
                        </span>
                      )}
                      {status === 'inactive' && (
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-bold uppercase rounded border border-gray-200">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {canEdit ? (
                        <div className="flex justify-end gap-3 items-center">
                          <button 
                            onClick={() => openEdit(rider)} 
                            disabled={isUpdating === rider.id} 
                            className="text-sm font-bold text-gray-500 hover:text-gray-950 transition-colors"
                          >
                            Edit
                          </button>
                          
                          <div className="h-4 w-px bg-gray-200"></div>

                          {rider.is_active ? (
                            <>
                              <button 
                                onClick={() => handleUpdateStatus(rider.id, { is_available: !rider.is_available })} 
                                disabled={isUpdating === rider.id}
                                className={`text-sm font-bold transition-colors ${rider.is_available ? 'text-[#F59E0B] hover:text-orange-700' : 'text-[#22C55E] hover:text-green-700'}`}
                              >
                                {rider.is_available ? 'Set Busy' : 'Set Available'}
                              </button>
                              <div className="h-4 w-px bg-gray-200"></div>
                              <button 
                                onClick={() => handleDeactivate(rider)} 
                                disabled={isUpdating === rider.id}
                                className="text-sm font-bold text-[#D62828] hover:text-red-700 transition-colors"
                              >
                                Deactivate
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => handleUpdateStatus(rider.id, { is_active: true })} 
                              disabled={isUpdating === rider.id}
                              className="text-sm font-bold text-gray-800 hover:underline transition-colors"
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Read-only</span>
                      )}
                    </td>
                  </tr>
                  
                  {isPromptOpen && (
                    <tr>
                      <td colSpan={4} className="bg-red-50 p-4 border-b border-red-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-[#D62828]">Deactivate {rider.name}?</p>
                            <p className="text-xs text-red-800 mt-1">They won't be assignable to new orders.</p>
                          </div>
                          <div className="flex gap-3">
                            <button 
                              onClick={() => setDeactivatePromptId(null)} 
                              className="px-3 py-1.5 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleConfirmDeactivate(rider.id)} 
                              className="px-3 py-1.5 text-sm font-bold text-white bg-[#D62828] rounded hover:bg-red-700 transition-colors"
                            >
                              Yes, Deactivate
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {riders.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">No riders configured.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showDialog && (
        <RiderFormDialog 
          initialData={editingRider} 
          onSave={handleSaveRider} 
          onCancel={() => { setShowDialog(false); setEditingRider(null); }} 
        />
      )}
    </div>
  );
}
