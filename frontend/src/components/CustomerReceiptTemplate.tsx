'use client';

import React from 'react';
import { KDSOrder } from '../app/(restaurant)/kds/types';

interface CustomerReceiptTemplateProps {
  order: KDSOrder;
}

export default function CustomerReceiptTemplate({ order }: CustomerReceiptTemplateProps) {
  // Format currency helper
  const formatCurrency = (val: number) => {
    return `Rs. ${Math.round(val).toLocaleString('en-PK')}`;
  };

  // Format date and time
  const formattedDateTime = React.useMemo(() => {
    try {
      const date = new Date(order.created_at);
      return date.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return order.created_at;
    }
  }, [order.created_at]);

  return (
    <div className="customer-receipt-template text-black font-mono text-xs w-[80mm] p-4 bg-white select-none leading-tight">
      {/* Brand Header */}
      <div className="text-center border-b border-dashed border-black pb-2 mb-2">
        <h1 className="text-lg font-bold uppercase tracking-widest">Muncherz</h1>
        <p className="text-[9px] text-gray-500 mt-0.5">Single Restaurant Premium Ordering</p>
        <p className="text-[10px] mt-1">{formattedDateTime}</p>
      </div>

      {/* Order Details */}
      <div className="border-b border-dashed border-black pb-2 mb-3 text-sm">
        <div className="flex justify-between">
          <span>Receipt: <strong>{order.order_number}</strong></span>
          <span className="uppercase font-bold">{order.order_type.replace('_', ' ')}</span>
        </div>
        {order.order_type === 'dine_in' && order.table_number && (
          <div className="mt-1 text-sm font-bold text-center border border-black py-0.5 bg-gray-50">
            TABLE: {order.table_number}
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="space-y-2 mb-3 border-b border-dashed border-black pb-2">
        {order.items.map((item, idx) => (
          <div key={idx} className="text-xs">
            <div className="flex justify-between">
              <span className="font-semibold">{item.quantity}x {item.menu_item_name} {item.size_label && `(${item.size_label})`}</span>
              <span>{formatCurrency(item.item_total)}</span>
            </div>
            
            {/* Customizations summary */}
            {!!item.customizations && (item.customizations as any[]).length > 0 && (
              <div className="text-[10px] text-gray-600 pl-4">
                {(item.customizations as any[]).map(c => `${c.qty}x ${c.name}`).join(', ')}
              </div>
            )}

            {/* Meal Additions (unclear shape from DB schema, rendering with a fallback safeguard) */}
            {!!item.meal_additions && (
              <div className="text-[10px] text-gray-600 pl-4">
                {Array.isArray(item.meal_additions) ? (
                  <span>+ {item.meal_additions.map((m: any) => m.name || m.item || 'Meal Side').join(', ')}</span>
                ) : typeof item.meal_additions === 'string' ? (
                  <span>+ {item.meal_additions as string}</span>
                ) : (
                  <span className="italic text-[9px] text-gray-400">Meal Additions (Custom Shape)</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pricing Breakdown */}
      <div className="space-y-1.5 text-xs mb-3 border-b border-dashed border-black pb-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotal || 0)}</span>
        </div>
        {order.delivery_charge > 0 && (
          <div className="flex justify-between">
            <span>Delivery Charge</span>
            <span>{formatCurrency(order.delivery_charge)}</span>
          </div>
        )}
        {order.gst_amount > 0 && (
          <div className="flex justify-between">
            <span>GST ({order.gst_percent}%)</span>
            <span>{formatCurrency(order.gst_amount)}</span>
          </div>
        )}
        {order.discount_amount > 0 && (
          <div className="flex justify-between text-green-700 font-medium">
            <span>Discount</span>
            <span>-{formatCurrency(order.discount_amount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-bold border-t border-dotted border-gray-300 pt-1.5">
          <span>TOTAL</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      {/* Payment Details */}
      <div className="text-center text-[10px] mb-3">
        <p className="font-semibold uppercase">
          Payment: {order.payment_method?.toUpperCase().replace('_', ' ') || 'UNKNOWN'}
        </p>
        <p className="text-gray-500 uppercase mt-0.5">
          Status: {order.payment_status?.toUpperCase() || 'PENDING'}
        </p>
      </div>

      {/* Note */}
      {order.special_note && (
        <div className="border border-dotted border-black p-2 rounded text-center mb-3">
          <div className="font-bold text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Special Instructions</div>
          <div className="text-xs">{order.special_note}</div>
        </div>
      )}

      {/* Footer message */}
      <div className="text-center text-[10px] border-t border-dashed border-black pt-2">
        <p className="font-bold">Thank You for Dining With Us!</p>
        <p className="text-[9px] text-gray-400 mt-0.5">Please scan again for feedback later.</p>
      </div>
    </div>
  );
}
