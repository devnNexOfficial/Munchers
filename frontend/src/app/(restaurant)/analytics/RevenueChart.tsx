'use client';

import { useState, useEffect } from 'react';
import { DateRange } from './DateRangePicker';

interface DailyRevenue {
  date: string;
  revenue: number;
}

export default function RevenueChart({ range }: { range: DateRange }) {
  const [data, setData] = useState<DailyRevenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      try {
        // Assume backend endpoint returns daily revenue arrays.
        // /api/analytics/revenue_chart?from=...
        // For mock, generating dummy data based on range length
        const days = Math.max(1, Math.ceil((new Date(range.to).getTime() - new Date(range.from).getTime()) / (1000 * 3600 * 24)));
        const mockData = Array.from({ length: days }).map((_, i) => ({
          date: new Date(new Date(range.from).getTime() + i * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: Math.floor(Math.random() * 50000) + 10000
        }));
        setData(mockData);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChartData();
  }, [range]);

  const formatCurrency = (val: number) => `Rs. ${val.toLocaleString('en-PK')}`;

  if (isLoading) return <div className="h-64 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-500">Loading Chart...</div>;
  if (!data.length) return <div className="h-64 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-500">No revenue data for this period</div>;

  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const chartHeight = 200;

  // Note: Deviation flagged. Recharts is not in package.json, so falling back to plain SVG + Tailwind.
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Daily Revenue</h3>
      <div className="flex items-end h-[200px] gap-2">
        {data.map((d, idx) => {
          const barHeight = maxRevenue === 0 ? 0 : (d.revenue / maxRevenue) * chartHeight;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center group relative">
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 absolute -top-10 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none transition-opacity">
                {d.date}: {formatCurrency(d.revenue)}
              </div>
              
              {/* Bar */}
              <div 
                className="w-full bg-[#D62828] hover:bg-red-700 rounded-t transition-all duration-300 min-w-[4px]"
                style={{ height: `${barHeight}px` }}
              />
              {/* Label - show only if few days or every nth day to avoid overlap */}
              {data.length <= 14 || idx % Math.ceil(data.length / 7) === 0 ? (
                <div className="text-[10px] text-gray-400 mt-2 rotate-45 origin-left truncate w-full text-left">
                  {d.date}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
