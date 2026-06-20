'use client';

import { useState } from 'react';
import { RestockNotificationCount } from './types';

interface RestockNotificationBadgeProps {
  data?: RestockNotificationCount;
}

export default function RestockNotificationBadge({ data }: RestockNotificationBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  if (!data || data.count === 0) return null;

  return (
    <div className="relative inline-block ml-3">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 hover:bg-blue-200 transition-colors"
      >
        <span>{data.count} Waiting</span>
        <svg className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </button>

      {expanded && (
        <div className="absolute left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-10 overflow-hidden">
          <div className="bg-blue-50 px-3 py-2 border-b border-blue-100">
            <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider">Pending Notifications</h4>
          </div>
          <div className="max-h-48 overflow-y-auto p-2">
            {data.notifications.map((n, idx) => (
              <div key={idx} className="text-xs border-b border-gray-50 last:border-0 p-2 flex justify-between items-start">
                <div>
                  <span className="font-bold text-gray-900 block">{n.user_name || 'Anonymous User'}</span>
                  <span className="text-gray-500 font-mono mt-0.5 block truncate max-w-[150px]">Item: {n.menu_item_id}</span>
                </div>
                <span className="text-gray-400 whitespace-nowrap ml-2">
                  {new Date(n.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 px-3 py-2 border-t border-gray-100">
            <p className="text-[10px] text-gray-500 leading-tight">
              <span className="font-bold text-gray-700">Note:</span> Notifications sent automatically when ingredient is marked available.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
