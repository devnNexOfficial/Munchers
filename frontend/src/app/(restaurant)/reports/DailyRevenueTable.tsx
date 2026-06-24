'use client';

import { DailyRevenueRow, DateRange } from './types';

interface DailyRevenueTableProps {
  data: DailyRevenueRow[];
  range: DateRange;
}

export default function DailyRevenueTable({ data, range }: DailyRevenueTableProps) {
  const exportCSV = () => {
    // CSV columns: Date, Orders, Revenue (PKR), Avg Order Value
    const headers = ['Date', 'Orders', 'Revenue', 'Avg Order Value'];
    const rows = data.map(r => [
      r.date,
      r.orders.toString(),
      r.revenue.toString(), // Raw numbers, no "Rs." prefix
      r.avg_order_value.toString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', `muncherz-finance-${range.from}-to-${range.to}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatCurrency = (val: number) => `Rs. ${val.toLocaleString('en-PK')}`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-gray-900">Daily Revenue</h3>
        <button 
          onClick={exportCSV} 
          className="bg-[#D62828] text-white px-4 py-1.5 text-sm font-bold rounded hover:bg-red-700 transition-colors"
        >
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-white border-b border-gray-200">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Date</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Orders</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Revenue</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Avg Order Value</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4 text-sm font-medium text-gray-900">
                  {new Date(row.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </td>
                <td className="p-4 text-sm font-bold text-gray-700 text-right">{row.orders}</td>
                <td className="p-4 text-sm font-bold text-gray-900 text-right">{formatCurrency(row.revenue)}</td>
                <td className="p-4 text-sm font-medium text-gray-500 text-right">{formatCurrency(row.avg_order_value)}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500 text-sm">No data available for this range.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
