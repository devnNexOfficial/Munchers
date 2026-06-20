import { FinanceSummary } from './types';

export default function FinanceSummaryCards({ summary }: { summary: FinanceSummary | null }) {
  if (!summary) return null;

  const formatCurrency = (val: number) => `Rs. ${val.toLocaleString('en-PK')}`;

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900">{summary.total_orders}</p>
          <p className="text-xs text-gray-400 mt-1">Completed: <span className="font-bold text-gray-700">{summary.completed_orders}</span></p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue (Paid)</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(summary.total_revenue)}</p>
        </div>

        {/* Cancellations */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-sm font-medium text-[#EF4444] mb-1">Cancelled Orders</p>
          <p className="text-3xl font-bold text-[#EF4444]">{summary.cancellation_count}</p>
          <p className="text-xs text-[#EF4444] mt-1">Rate: <span className="font-bold">{summary.cancellation_rate}%</span></p>
        </div>

        {/* Discounts */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-sm font-medium text-purple-600 mb-1">Discounts Applied</p>
          <p className="text-3xl font-bold text-purple-600">{formatCurrency(summary.total_discounts)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Delivery Charges */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-sm font-medium text-gray-500 mb-1">Delivery Charges Collected</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.total_delivery)}</p>
        </div>

        {/* GST - hide if 0 entirely for the period as requested */}
        {summary.total_gst > 0 && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <p className="text-sm font-medium text-gray-500 mb-1">GST Collected</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.total_gst)}</p>
          </div>
        )}

        {/* Net Revenue */}
        <div className={`bg-green-50 p-4 rounded-xl shadow-sm border border-green-200 flex flex-col justify-center ${summary.total_gst === 0 ? 'md:col-span-2' : ''}`}>
          <p className="text-sm font-medium text-green-700 mb-1">Net Revenue</p>
          <p className="text-3xl font-bold text-green-800">{formatCurrency(summary.net_revenue)}</p>
          <p className="text-[10px] text-green-700 mt-2 font-mono">Revenue − Delivery − GST = Net</p>
        </div>
      </div>
    </div>
  );
}
