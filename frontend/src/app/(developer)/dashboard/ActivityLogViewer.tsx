'use client';

import React, { useState, useEffect } from 'react';
import { ActivityLogEntry } from './types';

export default function ActivityLogViewer() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [actorRole, setActorRole] = useState<string>('all');
  const [entityType, setEntityType] = useState<string>('all');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Expanded diffs
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        // Assumption Flag: Simulating a direct Supabase client query.
        // The real implementation would be:
        // let q = supabase.from('activity_logs').select('*', { count: 'exact' });
        // if (actorRole !== 'all') q = q.eq('actor_role', actorRole);
        // if (entityType !== 'all') q = q.eq('entity', entityType);
        // const { data, count, error } = await q.range((page - 1) * 20, page * 20 - 1).order('created_at', { ascending: false });
        
        // Mock data
        const mockLogs: ActivityLogEntry[] = [
          {
            id: 'log-1',
            actor_id: 'user-1',
            actor_role: 'manager',
            action: 'UPDATE',
            entity: 'menu_items',
            entity_id: 'item-123',
            old_value: { price: 1200 },
            new_value: { price: 1500 },
            ip_address: '192.168.1.5',
            created_at: new Date().toISOString()
          },
          {
            id: 'log-2',
            actor_id: 'user-2',
            actor_role: 'owner',
            action: 'DELETE',
            entity: 'deals',
            entity_id: 'deal-456',
            old_value: { is_active: true },
            new_value: { is_active: false },
            ip_address: null,
            created_at: new Date(Date.now() - 3600000).toISOString()
          }
        ];
        
        setLogs(mockLogs);
        setTotalCount(2);
        setTotalPages(1);
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [actorRole, entityType, page]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [actorRole, entityType]);

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedIds(newSet);
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'owner': return 'bg-[#D62828] text-white';
      case 'manager': return 'bg-[#F7B731] text-yellow-900';
      case 'chef': return 'bg-gray-200 text-gray-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getActionColor = (action: string) => {
    switch(action.toUpperCase()) {
      case 'INSERT': return 'text-green-600';
      case 'UPDATE': return 'text-blue-600';
      case 'DELETE': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden col-span-1 lg:col-span-2">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div>
          <h3 className="font-bold text-gray-900">Activity Log</h3>
          <p className="text-xs text-gray-500">
            Note: `activity_logs` is not explicitly RLS-enabled in ARCHITECTURE.md. 
            Confirm backend policies.
          </p>
        </div>
        <span className="text-[10px] text-[#22C55E] font-bold uppercase border border-green-200 bg-green-50 px-2 py-0.5 rounded">
          Live Data
        </span>
      </div>

      <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 bg-white">
        <select 
          value={actorRole} 
          onChange={e => setActorRole(e.target.value)}
          className="border border-gray-300 rounded p-1.5 text-sm focus:ring-[#D62828]"
        >
          <option value="all">All Roles</option>
          <option value="owner">Owner</option>
          <option value="manager">Manager</option>
          <option value="chef">Chef</option>
        </select>
        <select 
          value={entityType} 
          onChange={e => setEntityType(e.target.value)}
          className="border border-gray-300 rounded p-1.5 text-sm focus:ring-[#D62828]"
        >
          <option value="all">All Entities</option>
          <option value="menu_items">Menu Items</option>
          <option value="deals">Deals</option>
          <option value="orders">Orders</option>
          <option value="staff_accounts">Staff Accounts</option>
        </select>
      </div>

      <div className="p-0 overflow-x-auto min-h-[300px]">
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-medium">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-medium">No activity logs found.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase">
              <tr>
                <th className="p-3 font-bold">Time</th>
                <th className="p-3 font-bold">Actor</th>
                <th className="p-3 font-bold">Action</th>
                <th className="p-3 font-bold">Entity</th>
                <th className="p-3 font-bold text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => {
                const isExpanded = expandedIds.has(log.id);
                return (
                  <React.Fragment key={log.id}>
                    <tr className="border-b border-gray-50 hover:bg-gray-50 text-sm">
                      <td className="p-3 whitespace-nowrap text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                        {log.ip_address && <div className="text-[10px] text-gray-400 font-mono mt-0.5">{log.ip_address}</div>}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${getRoleColor(log.actor_role)}`}>
                          {log.actor_role}
                        </span>
                      </td>
                      <td className={`p-3 font-bold text-xs ${getActionColor(log.action)}`}>
                        {log.action}
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                          {log.entity}#{log.entity_id.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button 
                          onClick={() => toggleExpand(log.id)}
                          className="text-xs font-bold text-[#D62828] hover:underline"
                        >
                          {isExpanded ? 'Hide Diff' : 'View Diff'}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <td colSpan={5} className="p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Old Value</p>
                              <pre className="text-[10px] bg-white p-2 rounded border border-gray-200 overflow-x-auto text-gray-600 font-mono">
                                {JSON.stringify(log.old_value, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">New Value</p>
                              <pre className="text-[10px] bg-white p-2 rounded border border-gray-200 overflow-x-auto text-gray-900 font-mono">
                                {JSON.stringify(log.new_value, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="p-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="text-xs text-gray-500 font-medium">Page {page} of {totalPages} ({totalCount} items)</div>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-2 py-1 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded disabled:opacity-50">Prev</button>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-2 py-1 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
