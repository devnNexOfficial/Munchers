'use client';

import { useState } from 'react';
import { StaffAccount } from './types';
import StaffRow from './StaffRow';
import AddStaffFormDialog from './AddStaffFormDialog';

interface StaffListProps {
  initialStaff: StaffAccount[];
  currentUserId: string;
}

export default function StaffList({ initialStaff, currentUserId }: StaffListProps) {
  const [staffList, setStaffList] = useState<StaffAccount[]>(initialStaff);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleUpdateActive = async (id: string, active: boolean) => {
    // Optimistic UI update
    setStaffList(prev => prev.map(s => s.id === id ? { ...s, is_active: active } : s));
    
    try {
      // Direct Supabase client write (consume-only, backend-owned RLS applies)
      // Mocked here:
      await fetch(`/api/restaurant/staff/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: active }),
      });
    } catch {
      // Revert omitted for brevity
    }
  };

  const sortedStaff = [...staffList].sort((a, b) => {
    // Active first
    if (a.is_active && !b.is_active) return -1;
    if (!a.is_active && b.is_active) return 1;
    // Then by created_at ascending
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Staff Access</h2>
          <p className="text-sm text-gray-500">Manage restaurant team members and their roles</p>
        </div>
        <button 
          onClick={() => setShowAddDialog(true)}
          className="bg-[#D62828] text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          + Add Staff
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-sm font-bold text-gray-700">Name</th>
              <th className="p-4 text-sm font-bold text-gray-700">Role</th>
              <th className="p-4 text-sm font-bold text-gray-700">Status</th>
              <th className="p-4 text-sm font-bold text-gray-700">Joined</th>
              <th className="p-4 text-sm font-bold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedStaff.map(staff => (
              <StaffRow 
                key={staff.id} 
                staff={staff} 
                currentUserId={currentUserId}
                onUpdateActive={handleUpdateActive} 
              />
            ))}
            {sortedStaff.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">No staff members found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddDialog && (
        <AddStaffFormDialog 
          onSuccess={() => setShowAddDialog(false)} 
          onCancel={() => setShowAddDialog(false)} 
        />
      )}
    </div>
  );
}
