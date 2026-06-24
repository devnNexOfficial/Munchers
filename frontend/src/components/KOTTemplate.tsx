'use client';

import React from 'react';
import { KDSOrder } from '../app/(restaurant)/kds/types';

interface KOTTemplateProps {
  order: KDSOrder;
}

export default function KOTTemplate({ order }: KOTTemplateProps) {
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
    <div className="kot-template text-black font-mono text-xs w-[80mm] p-4 bg-white select-none leading-tight">
      {/* Header */}
      <div className="text-center border-b border-dashed border-black pb-2 mb-2">
        <h1 className="text-base font-bold uppercase tracking-wider">Kitchen Order Ticket</h1>
        <p className="text-[10px] mt-0.5">{formattedDateTime}</p>
      </div>

      {/* Order Metadata */}
      <div className="border-b border-dashed border-black pb-2 mb-3">
        <div className="flex justify-between text-sm">
          <span>Order: <strong className="text-base">{order.order_number}</strong></span>
          <span className="uppercase font-bold border border-black px-1.5 py-0.5 rounded text-[11px]">
            {order.order_type.replace('_', ' ')}
          </span>
        </div>
        {order.order_type === 'dine_in' && order.table_number && (
          <div className="mt-1 text-sm font-bold text-center border border-black py-0.5 bg-gray-50">
            TABLE: {order.table_number}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="space-y-3 mb-3">
        {order.items.map((item, idx) => (
          <div key={idx} className="pb-2 border-b border-dotted border-gray-300 last:border-b-0">
            <div className="flex justify-between font-bold text-sm">
              <span>{item.quantity}x {item.menu_item_name}</span>
              {item.size_label && <span className="font-normal text-xs">({item.size_label})</span>}
            </div>
            
            {/* Cooking Preference */}
            {item.cooking_pref && (
              <p className="text-[10px] italic mt-0.5 ml-4 text-gray-700">
                Prep: {item.cooking_pref}
              </p>
            )}

            {/* Customizations */}
            {!!item.customizations && (item.customizations as any[]).length > 0 && (
              <ul className="list-disc list-inside ml-4 mt-0.5 text-[10px] text-gray-700">
                {(item.customizations as any[]).map((c, cIdx) => (
                  <li key={cIdx}>
                    {c.qty}x {c.name}
                  </li>
                ))}
              </ul>
            )}

            {/* Meal Additions (unclear shape from DB schema, rendering with a fallback safeguard) */}
            {!!item.meal_additions && (
              <div className="ml-4 mt-0.5 text-[10px] text-gray-700">
                {Array.isArray(item.meal_additions) ? (
                  <ul className="list-square list-inside">
                    {item.meal_additions.map((m: any, mIdx) => (
                      <li key={mIdx}>
                        + {m.name || m.item || 'Meal Side Item'}
                      </li>
                    ))}
                  </ul>
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

      {/* Special Note */}
      {order.special_note && (
        <div className="border-2 border-black p-2 rounded text-center mb-2 font-bold text-xs uppercase bg-gray-50">
          <div className="border-b border-black pb-0.5 mb-1 text-[10px] tracking-wider">Special Note</div>
          {order.special_note}
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-[9px] border-t border-dashed border-black pt-2 mt-2">
        <p>Muncherz Kitchen</p>
      </div>
    </div>
  );
}
