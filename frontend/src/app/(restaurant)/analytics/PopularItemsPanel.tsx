'use client';

import { useState, useEffect } from 'react';
import { PopularItem, PopularCustomization } from './types';
import { DateRange } from './DateRangePicker';

export default function PopularItemsPanel({ range }: { range: DateRange }) {
  const [items, setItems] = useState<PopularItem[]>([]);
  const [customizations, setCustomizations] = useState<PopularCustomization[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/analytics/popular?from=${range.from}&to=${range.to}`);
        if (res.ok) {
          const data = await res.json();
          setItems(data.items || []);
          
          // FLAG: If backend endpoint does not return customizations, we leave it null.
          // Do not manually parse orders.items JSONB here.
          setCustomizations(data.customizations || null);
        }
      } catch {
        // handle error
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [range]);

  const formatCurrency = (val: number) => `Rs. ${val.toLocaleString('en-PK')}`;

  if (isLoading) return <div className="h-64 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-500">Loading Popular Items...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Top 10 Menu Items</h3>
        {items.length === 0 ? (
          <p className="text-gray-500 text-sm">No item data for this period.</p>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 10).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400 w-4">{idx + 1}.</span>
                  <span className="font-medium text-gray-900">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-gray-900">{item.order_count} orders</span>
                  <span className="block text-xs text-gray-500">{formatCurrency(item.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-gray-900">Top Customizations</h3>
          {customizations === null && (
            <span className="bg-yellow-50 text-[#F59E0B] border border-yellow-200 text-[10px] font-bold px-2 py-1 rounded uppercase">
              Endpoint Gap
            </span>
          )}
        </div>
        
        {customizations === null ? (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-600">
            <p className="font-bold mb-1 text-gray-900">Note on Customizations:</p>
            <p>The <code className="bg-gray-200 px-1 rounded">/api/analytics/popular</code> endpoint currently only returns item-level data. Customization breakdowns are missing from the response.</p>
            <p className="mt-2 text-xs">As per guidelines, we are flagging this gap rather than manually parsing the `order_items.customizations` JSONB field on the client.</p>
          </div>
        ) : customizations.length === 0 ? (
          <p className="text-gray-500 text-sm">No customizations data for this period.</p>
        ) : (
          <div className="space-y-3">
            {customizations.slice(0, 10).map((c, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400 w-4">{idx + 1}.</span>
                  <span className="font-medium text-gray-900">{c.ingredient_name}</span>
                </div>
                <span className="font-bold text-gray-900">{c.count} added</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
