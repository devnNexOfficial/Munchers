'use client';

import { useState, useEffect } from 'react';
import { AppHealthStatus } from './types';

export default function AppHealthCard() {
  const [health, setHealth] = useState<AppHealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      setLoading(true);
      try {
        // TODO: KNOWN GAP - THIS ENDPOINT DOES NOT EXIST
        // GET /api/developer/health is not yet implemented.
        const res = await fetch('/api/developer/health');
        if (!res.ok) {
          // 404 or fetch failure means unavailable, not down
          setHealth(null);
        } else {
          const data = await res.json();
          setHealth(data);
        }
      } catch (err) {
        setHealth(null);
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-[#22C55E]';
      case 'degraded': return 'bg-[#F59E0B]';
      case 'down': return 'bg-[#EF4444]';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center min-h-[120px]">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">App Health</h3>
      </div>
      
      {loading ? (
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-200"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      ) : !health ? (
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-gray-300"></div>
          <div>
            <span className="text-lg font-bold text-gray-400">Unavailable</span>
            <p className="text-[10px] text-[#D62828] font-bold mt-1 uppercase">Backend not yet implemented</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${getStatusColor(health.status)}`}></div>
          <div>
            <span className="text-xl font-bold text-gray-900 capitalize">{health.status}</span>
            <p className="text-xs text-gray-400 mt-0.5">Last checked: {new Date(health.checked_at).toLocaleTimeString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
