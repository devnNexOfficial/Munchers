'use client';

import { useState, useEffect } from 'react';
import { ActiveUsersCount } from './types';

export default function ActiveUsersCard() {
  const [activeUsers, setActiveUsers] = useState<ActiveUsersCount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveUsers = async () => {
      setLoading(true);
      try {
        // TODO: KNOWN GAP - THIS ENDPOINT DOES NOT EXIST
        // GET /api/developer/active-users is not yet implemented.
        // NOTE: A Supabase Realtime Presence channel is one possible implementation path,
        // but no presence channel is documented in ARCHITECTURE.md. We do not build one speculatively.
        const res = await fetch('/api/developer/active-users');
        if (!res.ok) {
          setActiveUsers(null);
        } else {
          const data = await res.json();
          setActiveUsers(data);
        }
      } catch {
        setActiveUsers(null);
      } finally {
        setLoading(false);
      }
    };
    fetchActiveUsers();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center min-h-[120px]">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Live Active Users</h3>
      </div>
      
      {loading ? (
        <div className="animate-pulse h-8 bg-gray-200 rounded w-16"></div>
      ) : !activeUsers ? (
        <div>
          <span className="text-lg font-bold text-gray-400">Unavailable</span>
          <p className="text-[10px] text-[#D62828] font-bold mt-1 uppercase">Backend not yet implemented</p>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-4xl font-black text-gray-900">{activeUsers.count}</span>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-[#22C55E] rounded-full text-[10px] font-bold uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
            </span>
            Live
          </div>
        </div>
      )}
    </div>
  );
}
