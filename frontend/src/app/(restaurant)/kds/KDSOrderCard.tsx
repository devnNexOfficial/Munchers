'use client';

import { KDSOrder } from './types';

interface KDSOrderCardProps {
  order: KDSOrder;
  now: number;
  onAccept?: () => void;
  onReject?: () => void;
  onReady?: () => void;
  onAssignRider?: () => void;
  onDispatch?: () => void;
}

export default function KDSOrderCard({
  order, now, onAccept, onReject, onReady, onAssignRider, onDispatch
}: KDSOrderCardProps) {
  
  const getElapsedMinutes = (timestamp: string) => {
    const diffMs = now - new Date(timestamp).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  const getComplexityColor = (complexity?: string) => {
    switch (complexity) {
      case 'green': return '#22C55E';
      case 'yellow': return '#F59E0B';
      case 'red': return '#EF4444';
      default: return 'transparent';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border relative overflow-hidden transition-all ${order.is_new ? 'border-[#D62828] ring-4 ring-red-100' : 'border-gray-200'}`}>
      {order.complexity && (
        <div 
          className="absolute top-0 left-0 w-1.5 h-full"
          style={{ backgroundColor: getComplexityColor(order.complexity) }}
        />
      )}
      
      {order.is_new && (
        <div className="absolute top-0 right-0 bg-[#D62828] text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
          New
        </div>
      )}

      <div className="p-4 pl-5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
          <div>
            <span className="font-bold text-[#D62828] block text-lg mb-1">{order.order_number}</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D62828] bg-[#F7B731] px-2 py-1 rounded">
                {order.order_type.replace('_', ' ')}
                {order.order_type === 'dine_in' && order.table_number ? ` (Table ${order.table_number})` : ''}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="block text-gray-900 font-bold text-sm">
              {getElapsedMinutes(order.created_at)} min ago
            </span>
            {order.prep_time && (
              <span className="text-gray-500 text-xs font-medium block mt-1">
                Target: {order.prep_time}m
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-2 mb-4">
          {order.items.map((item, idx) => (
            <div key={idx} className="text-sm text-gray-900 flex items-start">
              <span className="font-bold w-6 shrink-0 pt-0.5">{item.quantity}x</span>
              <div className="flex-1">
                <span className="font-medium">
                  {item.menu_item_name}
                  {item.size_label && <span className="text-gray-500 ml-1 font-normal">({item.size_label})</span>}
                </span>
                {item.customizations && item.customizations.length > 0 && (
                  <div className="text-xs text-gray-500 mt-0.5 pl-1 border-l-2 border-gray-100">
                    {item.customizations.map(c => `${c.qty}x ${c.name}`).join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {order.special_note && (
            <div className="bg-[#F7B731] bg-opacity-10 p-3 rounded mt-3 text-sm text-[#D62828] font-bold border border-yellow-100">
              NOTE: {order.special_note}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-xs font-medium text-gray-500 mb-4">
          <span>{order.payment_method?.toUpperCase() || 'UNKNOWN'}</span>
          <span className={`px-2 py-0.5 rounded uppercase ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {order.payment_status || 'pending'}
          </span>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-2 mt-auto">
          {order.status === 'pending' && (
            <>
              <button onClick={onAccept} className="flex-1 bg-[#D62828] text-white font-bold py-2 rounded-lg hover:bg-red-700 transition-colors">
                Accept
              </button>
              <button onClick={onReject} className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-50 transition-colors">
                Reject
              </button>
            </>
          )}
          
          {(order.status === 'accepted' || order.status === 'preparing') && (
            <button onClick={onReady} className="w-full bg-[#D62828] text-white font-bold py-2 rounded-lg hover:bg-red-700 transition-colors">
              Mark Ready
            </button>
          )}

          {order.status === 'ready' && order.order_type === 'delivery' && (
            <button onClick={onAssignRider} className="w-full bg-[#D62828] text-white font-bold py-2 rounded-lg hover:bg-red-700 transition-colors">
              Assign Rider
            </button>
          )}

          {order.status === 'ready' && order.order_type !== 'delivery' && (
            <button onClick={onDispatch} className="w-full bg-[#D62828] text-white font-bold py-2 rounded-lg hover:bg-red-700 transition-colors">
              Mark Dispatched
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
