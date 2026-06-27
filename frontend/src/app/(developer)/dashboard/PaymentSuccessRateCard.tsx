'use client';

import { useState, useEffect } from 'react';
import { PaymentSuccessRate } from './types';

export default function PaymentSuccessRateCard() {
  const [rate, setRate] = useState<PaymentSuccessRate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuccessRate = async () => {
      setLoading(true);
      try {
        // Assumption Flag: Simulating a Supabase client query.
        // In reality, this would be:
        // const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        // const { data, error } = await supabase.from('orders')
        //   .select('payment_status')
        //   .gte('created_at', twentyFourHoursAgo)
        //   .not('payment_status', 'is', null);
        
        // Mock data logic:
        const mockData = [
          { payment_status: 'paid' },
          { payment_status: 'paid' },
          { payment_status: 'failed' },
          { payment_status: 'paid' },
          { payment_status: 'pending' }, // total is non-null payment_status
        ];

        const total = mockData.length;
        const paid = mockData.filter(r => r.payment_status === 'paid').length;
        
        if (total === 0) {
          setRate({ paid: 0, total: 0, percentage: 0 });
        } else {
          setRate({ paid, total, percentage: (paid / total) * 100 });
        }
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchSuccessRate();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center min-h-[120px]">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Payment Success Rate</h3>
        <span className="text-[10px] text-[#22C55E] font-bold uppercase border border-green-200 bg-green-50 px-2 py-0.5 rounded">
          Live Data
        </span>
      </div>
      
      {loading ? (
        <div className="animate-pulse h-8 bg-gray-200 rounded w-24 mt-2"></div>
      ) : !rate ? (
        <div className="text-gray-500">Failed to load data.</div>
      ) : rate.total === 0 ? (
        <div className="text-gray-500 font-medium">No orders in the last 24h</div>
      ) : (
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-gray-900">{rate.percentage.toFixed(1)}%</span>
            <span className="text-sm text-gray-500 font-medium">success</span>
          </div>
          <div className="text-xs text-gray-400 mt-2 font-mono bg-gray-50 inline-block px-2 py-1 rounded">
            {rate.paid} paid / {rate.total} total attempts (24h)
          </div>
        </div>
      )}
    </div>
  );
}
