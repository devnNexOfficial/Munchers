'use client';

import { useState } from 'react';
import { DateRange } from './types';
import OrderHistoryTab from './OrderHistoryTab';
import FinanceReportTab from './FinanceReportTab';

export default function ReportsClientWrapper() {
  const [currentTab, setCurrentTab] = useState<'orders' | 'finance'>('orders');
  
  // Shared date range state lifted to the shell
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = new Date().toISOString().split('T')[0];
    return { from: today, to: today };
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Orders & Finance</h1>
          <p className="text-sm text-gray-500">View order history and financial reports</p>
        </div>

        {/* Custom Tabs Navigation */}
        <div className="flex gap-4 border-b border-gray-200 mb-6 pb-2">
          <button 
            onClick={() => setCurrentTab('orders')}
            className={`font-medium pb-2 border-b-2 transition-colors ${currentTab === 'orders' ? 'border-[#D62828] text-[#D62828]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            Order History
          </button>
          <button 
            onClick={() => setCurrentTab('finance')}
            className={`font-medium pb-2 border-b-2 transition-colors ${currentTab === 'finance' ? 'border-[#D62828] text-[#D62828]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            Finance Report
          </button>
        </div>

        <div>
          {currentTab === 'orders' && (
            <OrderHistoryTab initialRange={dateRange} onRangeChange={setDateRange} />
          )}
          {currentTab === 'finance' && (
            <FinanceReportTab initialRange={dateRange} onRangeChange={setDateRange} />
          )}
        </div>
      </div>
    </div>
  );
}
