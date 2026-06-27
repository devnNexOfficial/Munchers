'use client';

import { useState, useEffect } from 'react';

// NOTE: In a real implementation, you would import your Supabase client here.
// Assuming backend handles how this device authenticates with Realtime.
// import { supabase } from '@/lib/supabase';

interface KitchenOrderItem {
  menu_item_name: string;
  size_label?: string;
  quantity: number;
}

interface KitchenOrder {
  id: string;
  order_number: string;
  order_type: string;
  table_number?: string;
  status: string;
  items: KitchenOrderItem[];
  special_note?: string;
  prep_time?: number;
  complexity?: 'green' | 'yellow' | 'red';
  accepted_at: string;
}

interface KitchenOrdersViewProps {
  token: string;
  onLogout: () => void;
}

export default function KitchenOrdersView({ token, onLogout }: KitchenOrdersViewProps) {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [now, setNow] = useState(Date.now());

  // 1. Live Timer for Elapsed Time (updates every 60s)
  useEffect(() => {
    const timerId = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timerId);
  }, []);

  // 2. Fetch Initial Orders & Subscribe to Realtime
  useEffect(() => {
    // let channel: unknown;

    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/kitchen/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.status === 401) {
          onLogout();
          return;
        }
        if (res.ok) {
          const data = await res.json();
          const activeOrders = data
            .filter((o: KitchenOrder) => ['accepted', 'preparing'].includes(o.status))
            .sort((a: KitchenOrder, b: KitchenOrder) => new Date(a.accepted_at).getTime() - new Date(b.accepted_at).getTime());
          setOrders(activeOrders);
        }
      } catch {
        // Silent error for display stability
      }
    };

    fetchOrders();

    // 3. Supabase Realtime Subscription (UPDATE events on orders table)
    // if (typeof supabase !== 'undefined') {
    //   channel = supabase
    //     .channel('kitchen-orders')
    //     .on(
    //       'postgres_changes',
    //       { event: 'UPDATE', schema: 'public', table: 'orders' },
    //       (payload) => {
    //         const updatedOrder = payload.new as KitchenOrder;
    //         setOrders((prev) => {
    //           const isActive = ['accepted', 'preparing'].includes(updatedOrder.status);
    //           if (isActive) {
    //             const exists = prev.find(o => o.id === updatedOrder.id);
    //             if (exists) {
    //               return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o).sort((a, b) => new Date(a.accepted_at).getTime() - new Date(b.accepted_at).getTime());
    //             }
    //             return [...prev, updatedOrder].sort((a, b) => new Date(a.accepted_at).getTime() - new Date(b.accepted_at).getTime());
    //           } else {
    //             return prev.filter(o => o.id !== updatedOrder.id);
    //           }
    //         });
    //       }
    //     )
    //     .subscribe();
    // }

    return () => {
      // Cleanup Realtime subscription on unmount
      // if (channel) supabase.removeChannel(channel);
    };
  }, [token, onLogout]);

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
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Kitchen Display</h1>
          <button 
            onClick={onLogout} 
            className="text-sm font-medium text-gray-500 hover:text-[#D62828] transition-colors"
          >
            Log Out Device
          </button>
        </div>
        
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <p className="text-gray-500 font-medium text-lg">No active orders</p>
            <p className="text-gray-400 text-sm mt-1">Waiting for new tickets...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 items-start">
            {orders.map(order => (
              <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                {/* Complexity Badge Colored Strip */}
                {order.complexity && (
                  <div 
                    className="absolute top-0 left-0 w-1.5 h-full"
                    style={{ backgroundColor: getComplexityColor(order.complexity) }}
                  />
                )}
                
                <div className="pl-2">
                  <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-3">
                    <div>
                      <span className="font-bold text-[#D62828] block text-xl mb-1">{order.order_number}</span>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#F7B731] bg-[#F7B731] bg-opacity-10 px-2 py-1 rounded">
                        {order.order_type.replace('_', ' ')}
                        {order.order_type === 'dine_in' && order.table_number ? ` (Table ${order.table_number})` : ''}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-gray-900 font-bold text-sm">
                        {getElapsedMinutes(order.accepted_at)} min ago
                      </span>
                      {order.prep_time && (
                        <span className="text-gray-500 text-xs font-medium">
                          Target: {order.prep_time}m
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-sm text-gray-900 flex">
                        <span className="font-bold w-6 shrink-0">{item.quantity}x</span>
                        <span className="font-medium">
                          {item.menu_item_name}
                          {item.size_label && <span className="text-gray-500 ml-1 font-normal">({item.size_label})</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {order.special_note && (
                    <div className="bg-[#F7B731] bg-opacity-10 p-3 rounded mt-4 text-sm text-[#D62828] font-bold border border-yellow-100">
                      NOTE: {order.special_note}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
