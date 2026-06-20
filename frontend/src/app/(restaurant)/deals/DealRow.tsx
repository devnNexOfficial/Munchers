'use client';

import { Deal, DealValidityStatus, StaffRole } from './types';

interface DealRowProps {
  deal: Deal;
  role: StaffRole;
  onEdit: (deal: Deal) => void;
  onToggleActive: (id: string, current: boolean) => Promise<void>;
}

export default function DealRow({ deal, role, onEdit, onToggleActive }: DealRowProps) {
  const canEdit = role === 'owner' || role === 'manager';
  
  const getValidityStatus = (): DealValidityStatus => {
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

  const status = getValidityStatus();
  
  const savings = deal.original_price && deal.original_price > deal.deal_price 
    ? deal.original_price - deal.deal_price 
    : 0;

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="p-4">
        <div className="flex items-center gap-3">
          {deal.image_url ? (
            <img src={deal.image_url} alt="" className="w-12 h-12 rounded object-cover bg-gray-100" />
          ) : (
            <div className="w-12 h-12 rounded bg-gray-100 border border-gray-200"></div>
          )}
          <div>
            <div className="font-bold text-gray-900">{deal.name}</div>
            <div className="text-xs text-gray-500">{deal.items.length} items included</div>
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="font-bold text-gray-900 text-base">Rs. {deal.deal_price.toLocaleString('en-PK')}</div>
        {deal.original_price && (
          <div className="text-xs text-gray-400 line-through">Rs. {deal.original_price.toLocaleString('en-PK')}</div>
        )}
        {savings > 0 && (
          <div className="text-[10px] font-bold text-[#F7B731] mt-0.5">
            Save Rs. {savings.toLocaleString('en-PK')}
            {/* display only — server recalculates deal pricing at order placement */}
          </div>
        )}
      </td>
      <td className="p-4">
        {status === 'live' && <span className="px-2 py-1 bg-green-100 text-[#22C55E] text-[10px] font-bold uppercase rounded">Live</span>}
        {status === 'expired' && <span className="px-2 py-1 bg-red-100 text-[#EF4444] text-[10px] font-bold uppercase rounded">Expired</span>}
        {status === 'scheduled' && <span className="px-2 py-1 bg-blue-100 text-[#3B82F6] text-[10px] font-bold uppercase rounded">Scheduled</span>}
        {status === 'always_active' && <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded">Always Active</span>}
        {status === 'inactive' && <span className="px-2 py-1 bg-gray-200 text-gray-500 text-[10px] font-bold uppercase rounded">Inactive</span>}
        
        {(deal.valid_from || deal.valid_until) && (
          <div className="text-[10px] text-gray-500 mt-2">
            {deal.valid_from ? new Date(deal.valid_from).toLocaleDateString() : 'Start'} 
            {' → '} 
            {deal.valid_until ? new Date(deal.valid_until).toLocaleDateString() : 'End'}
          </div>
        )}
      </td>
      <td className="p-4 text-right">
        {canEdit ? (
          <div className="flex justify-end gap-3 items-center">
            <button onClick={() => onEdit(deal)} className="text-sm font-bold text-gray-500 hover:text-gray-900">Edit</button>
            <div className="h-4 w-px bg-gray-300"></div>
            <button 
              onClick={() => onToggleActive(deal.id, deal.is_active)}
              className={`text-sm font-bold ${deal.is_active ? 'text-gray-500 hover:text-gray-900' : 'text-[#22C55E] hover:text-green-700'}`}
            >
              {deal.is_active ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic">Read-only</span>
        )}
      </td>
    </tr>
  );
}
