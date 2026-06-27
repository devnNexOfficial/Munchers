'use client';

import { useState, useEffect } from 'react';
import { DailySummary } from './types';
import { DateRange } from './DateRangePicker';

export default function DailySummaryPanel({ range }: { range: DateRange }) {
  const [data, setData] = useState<DailySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/analytics/daily?from=${range.from}&to=${range.to}`);
        if (res.ok) setData(await res.json());
      } catch {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, [range]);

  const formatCurrency = (val: number) => `Rs. ${val.toLocaleString('en-PK')}`;

  if (isLoading) return <div className="h-40 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-500">Loading Summary...</div>;
  if (!data) return <div className="h-40 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-500">No data available</div>;


  const cancellationRate = data.total_orders > 0 ? ((data.cancelled_orders / data.total_orders) * 100).toFixed(1) : '0.0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue (Paid)</p>
        <p className="text-3xl font-bold text-[#D62828]">{formatCurrency(data.total_revenue)}</p>
        <p className="text-xs text-gray-400 mt-2">Avg Order: <span className="font-bold text-gray-700">{formatCurrency(data.avg_order_value)}</span></p>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
        <p className="text-3xl font-bold text-gray-900">{data.total_orders}</p>
        <p className="text-xs text-[#EF4444] mt-2 font-medium">Cancelled: {data.cancelled_orders} ({cancellationRate}%)</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Order Types</p>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Delivery</span>
          <span className="font-bold">{data.orders_by_type.delivery} <span className="text-gray-400 text-xs">({data.total_orders ? Math.round(data.orders_by_type.delivery/data.total_orders*100) : 0}%)</span></span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Dine-in</span>
          <span className="font-bold">{data.orders_by_type.dine_in} <span className="text-gray-400 text-xs">({data.total_orders ? Math.round(data.orders_by_type.dine_in/data.total_orders*100) : 0}%)</span></span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Takeaway</span>
          <span className="font-bold">{data.orders_by_type.takeaway} <span className="text-gray-400 text-xs">({data.total_orders ? Math.round(data.orders_by_type.takeaway/data.total_orders*100) : 0}%)</span></span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Complexity</p>
        <div className="flex justify-between text-sm mb-1 items-center">
          <span className="flex items-center gap-1.5 text-gray-600"><span className="w-2 h-2 rounded-full bg-[#22C55E]"></span> Green</span>
          <span className="font-bold">{data.orders_by_complexity.green}</span>
        </div>
        <div className="flex justify-between text-sm mb-1 items-center">
          <span className="flex items-center gap-1.5 text-gray-600"><span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span> Yellow</span>
          <span className="font-bold">{data.orders_by_complexity.yellow}</span>
        </div>
        <div className="flex justify-between text-sm items-center">
          <span className="flex items-center gap-1.5 text-gray-600"><span className="w-2 h-2 rounded-full bg-[#EF4444]"></span> Red</span>
          <span className="font-bold">{data.orders_by_complexity.red}</span>
        </div>
      </div>
    </div>
  );
}
