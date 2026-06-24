import { OrderRow } from './types';

export default function OrderDetailExpand({ order }: { order: OrderRow }) {
  const formatCurrency = (val: number) => `Rs. ${val.toLocaleString('en-PK')}`;
  
  const formatTime = (ts: string | null) => {
    if (!ts) return null;
    return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="bg-gray-50 border-x border-b border-gray-100 p-6 flex flex-col md:flex-row gap-8 text-sm">
      
      {/* Items List */}
      <div className="flex-1">
        <h4 className="font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">Order Items</h4>
        <div className="space-y-3">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900">
                  <span className="text-gray-500 mr-2">{item.qty}x</span>
                  {item.name}
                </p>
                {item.customizations && (
                  <p className="text-xs text-gray-500 mt-0.5 ml-6">{item.customizations}</p>
                )}
              </div>
              <p className="font-bold text-gray-700">{formatCurrency(item.item_total)}</p>
            </div>
          ))}
        </div>
        
        {/* Special Note */}
        {order.special_note && (
          <div className="mt-4 bg-yellow-100 border border-yellow-300 p-3 rounded-lg">
            <p className="text-xs font-bold text-yellow-800 uppercase mb-1">Customer Note:</p>
            <p className="text-sm text-yellow-900 font-medium">{order.special_note}</p>
          </div>
        )}
        
        {/* Rejection Reason */}
        {order.status === 'cancelled' && order.rejection_reason && (
          <div className="mt-4 bg-red-50 border border-red-200 p-3 rounded-lg">
            <p className="text-xs font-bold text-red-800 uppercase mb-1">Cancellation Reason:</p>
            <p className="text-sm text-red-900">{order.rejection_reason}</p>
          </div>
        )}
      </div>

      {/* Financials & Timestamps */}
      <div className="w-full md:w-72 space-y-6">
        <div>
          <h4 className="font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">Summary</h4>
          <div className="space-y-2 text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charge</span>
              <span>{formatCurrency(order.delivery_charge)}</span>
            </div>
            {order.gst_amount > 0 && (
              <div className="flex justify-between">
                <span>GST</span>
                <span>{formatCurrency(order.gst_amount)}</span>
              </div>
            )}
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-purple-600 font-medium">
                <span>Discount</span>
                <span>-{formatCurrency(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200 text-base">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">Timeline</h4>
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Placed:</span>
              <span className="font-medium text-gray-900">{formatTime(order.created_at)}</span>
            </div>
            {order.accepted_at && (
              <div className="flex justify-between">
                <span>Accepted:</span>
                <span className="font-medium text-gray-900">{formatTime(order.accepted_at)}</span>
              </div>
            )}
            {order.ready_at && (
              <div className="flex justify-between">
                <span>Ready:</span>
                <span className="font-medium text-gray-900">{formatTime(order.ready_at)}</span>
              </div>
            )}
            {order.delivered_at && (
              <div className="flex justify-between">
                <span>Delivered:</span>
                <span className="font-medium text-gray-900">{formatTime(order.delivered_at)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
