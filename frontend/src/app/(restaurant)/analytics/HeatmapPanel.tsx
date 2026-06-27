'use client';

import { useState, useEffect } from 'react';
import { HeatmapPoint } from './types';
import { DateRange } from './DateRangePicker';

export default function HeatmapPanel({ range }: { range: DateRange }) {
  const [points, setPoints] = useState<HeatmapPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHeatmap = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/analytics/heatmap?from=${range.from}&to=${range.to}`);
        if (res.ok) {
          const data = await res.json();
          // Assuming endpoint returns array of HeatmapPoint
          setPoints(data || []);
        }
      } catch {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    };
    fetchHeatmap();
  }, [range]);

  if (isLoading) return <div className="h-64 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-500">Loading Heatmap Data...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Order Density (Heatmap)</h3>
          <p className="text-sm text-gray-500">Geographic distribution of orders</p>
        </div>
        <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-1 rounded uppercase">
          Table Fallback Active
        </span>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 mb-4">
        <p className="font-bold mb-1">Visual Map Unavailable</p>
        <p>A visual map requires an external library (e.g., Google Maps, Leaflet) which is currently outside the project&apos;s stack lock. Falling back to a data table view as per Section 20 guidelines.</p>
        <p className="mt-2 text-xs opacity-80">Assumption: The endpoint returns <code>zone_name</code> or <code>location</code> (lat/lng) strings alongside <code>order_count</code>.</p>
      </div>

      {points.length === 0 ? (
        <p className="text-gray-500 text-sm py-4 text-center">No location data for this period.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-3 font-bold text-gray-700">Location / Zone</th>
                <th className="p-3 font-bold text-gray-700 text-right">Order Count</th>
                <th className="p-3 font-bold text-gray-700 w-1/2">Density</th>
              </tr>
            </thead>
            <tbody>
              {points.sort((a, b) => b.order_count - a.order_count).map((p, idx) => {
                const maxCount = Math.max(...points.map(x => x.order_count));
                const widthPct = maxCount === 0 ? 0 : (p.order_count / maxCount) * 100;
                
                return (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">{p.zone_name || p.location}</td>
                    <td className="p-3 text-right font-bold text-gray-900">{p.order_count}</td>
                    <td className="p-3">
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div className="bg-[#D62828] h-2.5 rounded-full transition-all" style={{ width: `${widthPct}%` }}></div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
