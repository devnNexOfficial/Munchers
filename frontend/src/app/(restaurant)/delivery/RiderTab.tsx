'use client';

import { useState } from 'react';
import { Rider, StaffRole } from './types';
import RiderRow from './RiderRow';
import RiderFormDialog from './RiderFormDialog';

interface RiderTabProps {
  initialRiders: Rider[];
  role: StaffRole;
}

export default function RiderTab({ initialRiders, role }: RiderTabProps) {
  const [riders, setRiders] = useState<Rider[]>(initialRiders);
  const [showDialog, setShowDialog] = useState(false);
  const [editingRider, setEditingRider] = useState<Rider | null>(null);

  const canEdit = role === 'owner' || role === 'manager';

  const handleUpdateStatus = async (id: string, updates: Partial<Rider>) => {
    // Optimistic UI update
    setRiders(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    
    try {
      await fetch(`/api/restaurant/riders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      // Revert omitted for brevity
    }
  };

  const handleSaveRider = async (data: Partial<Rider>) => {
    try {
      if (editingRider) {
        // Edit existing
        await fetch(`/api/restaurant/riders/${editingRider.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        setRiders(prev => prev.map(r => r.id === editingRider.id ? { ...r, ...data } : r));
      } else {
        // Add new
        const res = await fetch('/api/restaurant/riders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, is_active: true, is_available: true }),
        });
        if (res.ok) {
          const newRider = await res.json();
          // Ensure it matches sort (newest first)
          setRiders(prev => [newRider, ...prev]);
        }
      }
      setShowDialog(false);
      setEditingRider(null);
    } catch (err) {
      // Handle error
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

  // Sort by created_at desc (newest first)
  const sortedRiders = [...riders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Riders</h2>
          <p className="text-sm text-gray-500">Manage delivery fleet and availability</p>
        </div>
        {canEdit && (
          <button 
            onClick={openAdd} 
            className="bg-[#D62828] text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            + Add Rider
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-sm font-bold text-gray-700">Rider</th>
              <th className="p-4 text-sm font-bold text-gray-700">Phone</th>
              <th className="p-4 text-sm font-bold text-gray-700">Status</th>
              <th className="p-4 text-sm font-bold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedRiders.map(rider => (
              <RiderRow 
                key={rider.id} 
                rider={rider} 
                role={role} 
                onEdit={openEdit} 
                onUpdateStatus={handleUpdateStatus} 
              />
            ))}
            {sortedRiders.length === 0 && (
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
