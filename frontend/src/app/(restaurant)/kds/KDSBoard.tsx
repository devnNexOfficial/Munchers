'use client';

import { useState, useEffect } from 'react';
import { KDSOrder, Rider } from './types';
import KDSOrderCard from './KDSOrderCard';
import KDSRejectDialog from './KDSRejectDialog';
import KDSRiderSelect from './KDSRiderSelect';

// Mock import for Realtime
// import { supabase } from '@/lib/supabase';

export default function KDSBoard() {
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [now, setNow] = useState(Date.now());
  const [rejectOrderId, setRejectOrderId] = useState<string | null>(null);
  const [assignRiderOrderId, setAssignRiderOrderId] = useState<string | null>(null);

  const [settings, setSettings] = useState<{ printer_enabled: boolean; print_copies: number }>({
    printer_enabled: false,
    print_copies: 1,
  });

  // Live timer for elapsed times
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000); // 30s update
    return () => clearInterval(timer);
  }, []);



  useEffect(() => {
    // let channel: unknown;

    const fetchData = async () => {
      try {
        const [ordersRes, ridersRes, settingsRes] = await Promise.all([
          fetch('/api/restaurant/kds'),
          // Assume this endpoint returns active & available riders
          fetch('/api/restaurant/riders?is_active=true&is_available=true'),
          fetch('/api/restaurant/settings')
        ]);
        if (ordersRes.ok) {
          const data = await ordersRes.json();
          // Keep only live column statuses
          const liveOrders = data.filter((o: KDSOrder) => 
            ['pending', 'accepted', 'preparing', 'ready'].includes(o.status)
          );
          setOrders(liveOrders);
        }
        if (ridersRes.ok) {
          setRiders(await ridersRes.json());
        }
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings({
            printer_enabled: settingsData.printer_enabled ?? false,
            print_copies: settingsData.print_copies ?? 1
          });
        }
      } catch {
        // Handle error quietly
      }
    };

    fetchData();

    // Supabase Realtime Subscription: ONE channel for both INSERT and UPDATE
    // if (typeof supabase !== 'undefined') {
    //   channel = supabase
    //     .channel('kds-orders')
    //     .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
    //       const newOrder = payload.new as KDSOrder;
    //       newOrder.is_new = true;
    //       setOrders((prev) => [...prev, newOrder]);
    //       playBeep();
    //       // Remove flash indicator after 5s
    //       setTimeout(() => {
    //         setOrders(current => current.map(o => o.id === newOrder.id ? { ...o, is_new: false } : o));
    //       }, 5000);
    //     })
    //     .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
    //       const updatedOrder = payload.new as KDSOrder;
    //       setOrders((prev) => {
    //         const isLive = ['pending', 'accepted', 'preparing', 'ready'].includes(updatedOrder.status);
    //         if (isLive) {
    //           const exists = prev.find(o => o.id === updatedOrder.id);
    //           if (exists) return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
    //           return [...prev, updatedOrder];
    //         }
    //         return prev.filter(o => o.id !== updatedOrder.id);
    //       });
    //     })
    //     .subscribe();
    // }

    return () => {
      // if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const handleAction = async (id: string, action: string, payload?: unknown) => {
    // Optimistic UI update could happen here, but we rely on Realtime UPDATE for absolute truth
    // to keep it simple and safe.
    try {
      const options: RequestInit = { method: 'POST' };
      if (payload) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(payload);
      }
      const res = await fetch(`/api/restaurant/orders/${id}/${action}`, options);
      if (res.ok && action === 'accept') {
        const orderToPrint = orders.find(o => o.id === id);
        if (orderToPrint) {
          const { printOrderDocuments } = await import('@/lib/print-order');
          printOrderDocuments(orderToPrint, settings);
        }
      }
    } catch {
      // Handle error
    }
  };

  const getSortedOrders = (statuses: string[]) => {
    return orders
      .filter(o => statuses.includes(o.status))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  const pendingOrders = getSortedOrders(['pending']);
  const preparingOrders = getSortedOrders(['accepted', 'preparing']);
  const readyOrders = getSortedOrders(['ready']);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)] overflow-hidden">
      {/* PENDING COLUMN */}
      <div className="flex flex-col bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-white border-b border-gray-200 p-4">
          <h2 className="font-bold text-gray-900 flex justify-between items-center">
            PENDING <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{pendingOrders.length}</span>
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {pendingOrders.length === 0 && <p className="text-gray-400 text-center py-10 font-medium">No pending orders</p>}
          {pendingOrders.map(order => (
            <KDSOrderCard 
              key={order.id} order={order} now={now}
              onAccept={() => handleAction(order.id, 'accept')}
              onReject={() => setRejectOrderId(order.id)}
            />
          ))}
        </div>
      </div>

      {/* PREPARING COLUMN */}
      <div className="flex flex-col bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-white border-b border-gray-200 p-4">
          <h2 className="font-bold text-gray-900 flex justify-between items-center">
            PREPARING <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{preparingOrders.length}</span>
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {preparingOrders.length === 0 && <p className="text-gray-400 text-center py-10 font-medium">No orders in prep</p>}
          {preparingOrders.map(order => (
            <KDSOrderCard 
              key={order.id} order={order} now={now}
              onReady={() => handleAction(order.id, 'ready')}
            />
          ))}
        </div>
      </div>

      {/* READY COLUMN */}
      <div className="flex flex-col bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-white border-b border-gray-200 p-4">
          <h2 className="font-bold text-gray-900 flex justify-between items-center">
            READY <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{readyOrders.length}</span>
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {readyOrders.length === 0 && <p className="text-gray-400 text-center py-10 font-medium">No orders ready</p>}
          {readyOrders.map(order => (
            <KDSOrderCard 
              key={order.id} order={order} now={now}
              onAssignRider={() => setAssignRiderOrderId(order.id)}
              onDispatch={() => handleAction(order.id, 'dispatch')}
            />
          ))}
        </div>
      </div>

      {rejectOrderId && (
        <KDSRejectDialog 
          onClose={() => setRejectOrderId(null)}
          onSubmit={(reason) => {
            handleAction(rejectOrderId, 'reject', { reason });
            setRejectOrderId(null);
          }}
        />
      )}

      {assignRiderOrderId && (
        <KDSRiderSelect 
          riders={riders}
          onClose={() => setAssignRiderOrderId(null)}
          onSubmit={(riderId) => {
            handleAction(assignRiderOrderId, 'assign-rider', { rider_id: riderId });
            setAssignRiderOrderId(null);
          }}
        />
      )}
    </div>
  );
}
