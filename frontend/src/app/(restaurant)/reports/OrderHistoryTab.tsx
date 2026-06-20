'use client';

import { useState, useEffect } from 'react';
import { DateRange, OrderRow } from './types';
import ReportDateRangePicker from './ReportDateRangePicker';
import OrderRowItem from './OrderRowItem';

interface OrderHistoryTabProps {
  initialRange: DateRange;
  onRangeChange: (range: DateRange) => void;
}

export default function OrderHistoryTab({ initialRange, onRangeChange }: OrderHistoryTabProps) {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Server-side filters state
  const [status, setStatus] = useState<string>('all');
  const [orderType, setOrderType] = useState<string>('all');
  const [paymentMethod, setPaymentMethod] = useState<string>('all');
  const [paymentStatus, setPaymentStatus] = useState<string>('all');
  const [complexity, setComplexity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    // Assumption Flag: Simulating the server-side Supabase range query here.
    // In a real implementation, we would build the query params string and fetch:
    // `/api/restaurant/reports/orders?from=${initialRange.from}&to=${initialRange.to}&status=${status}&page=${page}&limit=25`
    
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // MOCK FETCH - Replace with actual API call ensuring server-side filtering and pagination
        const mockOrders: OrderRow[] = [
          {
            id: 'ord-123',
            order_number: 'ORD-12345',
            created_at: new Date().toISOString(),
            order_type: 'delivery',
            status: 'pending',
            payment_method: 'cod',
            payment_status: 'pending',
            complexity: 'yellow',
            total: 2500,
            subtotal: 2200,
            delivery_charge: 150,
            gst_amount: 150,
            discount_amount: 0,
            rejection_reason: null,
            special_note: 'Please call when outside',
            accepted_at: null,
            ready_at: null,
            delivered_at: null,
            items: [
              { name: 'Zinger Burger', qty: 2, item_total: 1600, customizations: 'Extra Mayo, No Pickles' },
              { name: 'Fries', qty: 1, item_total: 300 },
              { name: 'Coke', qty: 1, item_total: 300 }
            ],
            customer_name: 'Ali Khan',
            rider_name: null
          },
          {
            id: 'ord-124',
            order_number: 'ORD-12346',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            order_type: 'takeaway',
            status: 'ready',
            payment_method: 'card',
            payment_status: 'paid',
            complexity: 'green',
            total: 1500,
            subtotal: 1500,
            delivery_charge: 0,
            gst_amount: 0,
            discount_amount: 0,
            rejection_reason: null,
            special_note: null,
            accepted_at: new Date(Date.now() - 3500000).toISOString(),
            ready_at: new Date(Date.now() - 1000000).toISOString(),
            delivered_at: null,
            items: [
              { name: 'Chicken Wrap', qty: 1, item_total: 1500 }
            ],
            customer_name: 'Sara Ahmed',
            rider_name: null
          }
        ];
        
        setOrders(mockOrders);
        setTotalPages(1);
        setTotalCount(2);
      } catch (err) {
        // error handling
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [initialRange, status, orderType, paymentMethod, paymentStatus, complexity, searchQuery, page]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [initialRange, status, orderType, paymentMethod, paymentStatus, complexity, searchQuery]);

  return (
    <div>
      <ReportDateRangePicker range={initialRange} onChange={onRangeChange} />

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <input 
            type="text" 
            placeholder="Search order number..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-[#D62828]"
          />
        </div>
        
        <select value={status} onChange={e => setStatus(e.target.value)} className="border border-gray-300 rounded p-2 text-sm focus:ring-[#D62828]">
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="dispatched">Dispatched</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select value={orderType} onChange={e => setOrderType(e.target.value)} className="border border-gray-300 rounded p-2 text-sm focus:ring-[#D62828]">
          <option value="all">All Types</option>
          <option value="delivery">Delivery</option>
          <option value="dine_in">Dine-in</option>
          <option value="takeaway">Takeaway</option>
        </select>

        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="border border-gray-300 rounded p-2 text-sm focus:ring-[#D62828]">
          <option value="all">All Payment Methods</option>
          <option value="cod">COD</option>
          <option value="jazzcash">JazzCash</option>
          <option value="easypaisa">EasyPaisa</option>
          <option value="card">Card</option>
        </select>

        <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className="border border-gray-300 rounded p-2 text-sm focus:ring-[#D62828]">
          <option value="all">All Payment Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>

        <select value={complexity} onChange={e => setComplexity(e.target.value)} className="border border-gray-300 rounded p-2 text-sm focus:ring-[#D62828]">
          <option value="all">All Complexities</option>
          <option value="green">Green</option>
          <option value="yellow">Yellow</option>
          <option value="red">Red</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-sm font-bold text-gray-700">Order & Time</th>
              <th className="p-4 text-sm font-bold text-gray-700">Customer & Rider</th>
              <th className="p-4 text-sm font-bold text-gray-700">Status & Type</th>
              <th className="p-4 text-sm font-bold text-gray-700">Payment</th>
              <th className="p-4 text-sm font-bold text-gray-700 text-right">Total</th>
              <th className="p-4 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">Loading orders...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">No orders match the selected filters.</td>
              </tr>
            ) : (
              orders.map(order => <OrderRowItem key={order.id} order={order} />)
            )}
          </tbody>
        </table>
        
        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <div className="text-sm text-gray-500 font-medium">
              Showing page {page} of {totalPages} ({totalCount} total orders)
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
