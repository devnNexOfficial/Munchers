'use client';

import { useState } from 'react';
import { Deal, DealValidityStatus, MenuItemOption, StaffRole } from './types';
import DealRow from './DealRow';
import DealFormDialog from './DealFormDialog';

interface DealsListProps {
  initialDeals: Deal[];
  menuOptions: MenuItemOption[];
  role: StaffRole;
}

export default function DealsList({ initialDeals, menuOptions, role }: DealsListProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [filter, setFilter] = useState<'all' | 'live' | 'scheduled' | 'expired' | 'inactive'>('all');
  const [sort, setSort] = useState<'newest' | 'price_asc' | 'soonest'>('newest');
  
  const [showDialog, setShowDialog] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const canEdit = role === 'owner' || role === 'manager';

  const getValidityStatus = (deal: Deal): DealValidityStatus => {
    if (!deal.is_active) return 'inactive';
    const now = new Date();
    const hasStart = deal.valid_from !== null;
    const hasEnd = deal.valid_until !== null;
    if (!hasStart && !hasEnd) return 'always_active';
    const start = hasStart ? new Date(deal.valid_from!) : new Date(0);
    const end = hasEnd ? new Date(deal.valid_until!) : new Date('9999-12-31');
    if (now < start) return 'scheduled';
    if (now > end) return 'expired';
    return 'live';
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    if (!canEdit) return;
    setDeals(prev => prev.map(d => d.id === id ? { ...d, is_active: !current } : d));
    try {
      await fetch(`/api/restaurant/deals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !current })
      });
    } catch (e) {
      // Revert omitted for brevity
    }
  };

  const handleSaveDeal = async (data: Partial<Deal>) => {
    try {
      if (editingDeal) {
        await fetch(`/api/restaurant/deals/${editingDeal.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        setDeals(prev => prev.map(d => d.id === editingDeal.id ? { ...d, ...data } as Deal : d));
      } else {
        const res = await fetch('/api/restaurant/deals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, is_active: true })
        });
        if (res.ok) {
          const newDeal = await res.json();
          setDeals(prev => [newDeal, ...prev]);
        }
      }
      setShowDialog(false);
      setEditingDeal(null);
    } catch (err) {
      // Handle error
    }
  };

  const filteredAndSorted = deals
    .filter(deal => {
      if (filter === 'all') return true;
      const status = getValidityStatus(deal);
      if (filter === 'live' && status !== 'live' && status !== 'always_active') return false;
      if (filter === 'scheduled' && status !== 'scheduled') return false;
      if (filter === 'expired' && status !== 'expired') return false;
      if (filter === 'inactive' && status !== 'inactive') return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === 'price_asc') return a.deal_price - b.deal_price;
      if (sort === 'soonest') {
        const aEnd = a.valid_until ? new Date(a.valid_until).getTime() : Infinity;
        const bEnd = b.valid_until ? new Date(b.valid_until).getTime() : Infinity;
        return aEnd - bEnd;
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Deals Manager</h2>
          <p className="text-sm text-gray-500">Create and manage promotional combinations</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => { setEditingDeal(null); setShowDialog(true); }}
            className="bg-[#D62828] text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            + Add Deal
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-500 uppercase">Status:</label>
          <select value={filter} onChange={e => setFilter(e.target.value as any)} className="border border-gray-300 rounded p-1.5 text-sm focus:ring-[#D62828]">
            <option value="all">All</option>
            <option value="live">Live / Always Active</option>
            <option value="scheduled">Scheduled</option>
            <option value="expired">Expired</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-500 uppercase">Sort By:</label>
          <select value={sort} onChange={e => setSort(e.target.value as any)} className="border border-gray-300 rounded p-1.5 text-sm focus:ring-[#D62828]">
            <option value="newest">Newest First</option>
            <option value="price_asc">Price (Low to High)</option>
            <option value="soonest">Ending Soonest</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-sm font-bold text-gray-700">Deal Details</th>
              <th className="p-4 text-sm font-bold text-gray-700">Pricing</th>
              <th className="p-4 text-sm font-bold text-gray-700">Status</th>
              <th className="p-4 text-sm font-bold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.map(deal => (
              <DealRow 
                key={deal.id} 
                deal={deal} 
                role={role} 
                onEdit={(d) => { setEditingDeal(d); setShowDialog(true); }} 
                onToggleActive={handleToggleActive} 
              />
            ))}
            {filteredAndSorted.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">No deals match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showDialog && canEdit && (
        <DealFormDialog 
          initialData={editingDeal} 
          menuOptions={menuOptions}
          onSave={handleSaveDeal} 
          onCancel={() => { setShowDialog(false); setEditingDeal(null); }} 
        />
      )}
    </div>
  );
}
