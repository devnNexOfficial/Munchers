'use client';

import { useState } from 'react';
import { OrderRow } from './types';
import OrderDetailExpand from './OrderDetailExpand';

export default function OrderRowItem({ order }: { order: OrderRow }) {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-orange-100 text-[#F59E0B]';
      case 'accepted': 
      case 'preparing': return 'bg-blue-100 text-[#3B82F6]';
      case 'ready': return 'bg-yellow-100 text-[#F7B731]'; // muncherz-yellow correctly used for neutral positive
      case 'dispatched': return 'bg-purple-100 text-[#A855F7]';
      case 'delivered': return 'bg-green-100 text-[#22C55E]';
      case 'cancelled': return 'bg-red-100 text-[#EF4444]';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-orange-100 text-[#F59E0B]';
      case 'paid': return 'bg-green-100 text-[#22C55E]';
      case 'failed': return 'bg-red-100 text-[#EF4444]';
      case 'refunded': return 'bg-purple-100 text-[#A855F7]';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getComplexityColor = (comp: string | null) => {
    if (comp === 'green') return 'bg-[#22C55E]';
    if (comp === 'yellow') return 'bg-[#F59E0B]';
    if (comp === 'red') return 'bg-[#EF4444]';
    return 'bg-gray-200';
  };

  const formatCurrency = (val: number) => `Rs. ${val.toLocaleString('en-PK')}`;

  return (
    <>
      <tr 
        onClick={() => setExpanded(!expanded)} 
        className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${expanded ? 'bg-gray-50' : 'bg-white'}`}
      >
        <td className="p-4">
          <div className="font-bold text-gray-900 mb-1">{order.order_number}</div>
          <div className="text-xs text-gray-500">
            {new Date(order.created_at).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
          </div>
        </td>
        <td className="p-4">
          <div className="font-medium text-gray-900 text-sm mb-1">{order.customer_name || 'Guest'}</div>
          {order.order_type === 'delivery' && order.rider_name && (
            <div className="text-xs text-gray-500">Rider: {order.rider_name}</div>
          )}
        </td>
        <td className="p-4">
          <div className="flex flex-col items-start gap-1.5">
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase border border-gray-200 px-1 rounded">{order.order_type}</span>
              {order.complexity && (
                <span className={`w-2 h-2 rounded-full ${getComplexityColor(order.complexity)}`} title={`Complexity: ${order.complexity}`}></span>
              )}
            </div>
          </div>
        </td>
        <td className="p-4">
          <div className="flex flex-col items-start gap-1.5">
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${getPaymentStatusColor(order.payment_status)}`}>
              {order.payment_status}
            </span>
            <span className="text-xs text-gray-500 uppercase font-medium">{order.payment_method}</span>
          </div>
        </td>
        <td className="p-4 text-right font-bold text-gray-900">
          {formatCurrency(order.total)}
        </td>
        <td className="p-4 text-right text-gray-400">
          <span className="transform inline-block transition-transform duration-200" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        </td>
      </tr>
      
      {expanded && (
        <tr>
          <td colSpan={6} className="p-0">
            <OrderDetailExpand order={order} />
          </td>
        </tr>
      )}
    </>
  );
}
