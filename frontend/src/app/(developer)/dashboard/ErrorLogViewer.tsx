'use client';

import { useState, useEffect } from 'react';
import { ErrorLogEntry, ErrorLogFilters } from './types';

export default function ErrorLogViewer() {
  const [logs, setLogs] = useState<ErrorLogEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ErrorLogFilters>({
    severity: 'all',
    route: '',
    from: '',
    to: ''
  });

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        // TODO: KNOWN GAP - THIS ENDPOINT DOES NOT EXIST
        // GET /api/developer/errors is not yet implemented.
        // Assumption Flag: There is no error_logs table in ARCHITECTURE.md.
        const queryParams = new URLSearchParams(filters as any).toString();
        const res = await fetch(`/api/developer/errors?${queryParams}`);
        if (!res.ok) {
          setLogs(null);
        } else {
          const data = await res.json();
          setLogs(data);
        }
      } catch (err) {
        setLogs(null);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [filters]);

  const getSeverityColor = (sev: string) => {
    switch(sev) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-red-600 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden col-span-1 lg:col-span-2">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-gray-900">Error Logs</h3>
        <span className="text-[10px] text-[#D62828] font-bold uppercase border border-red-200 bg-red-50 px-2 py-0.5 rounded">
          Stubbed API
        </span>
      </div>

      <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 bg-white">
        <select 
          value={filters.severity || 'all'} 
          onChange={e => setFilters(f => ({ ...f, severity: e.target.value }))}
          className="border border-gray-300 rounded p-1.5 text-sm focus:ring-[#D62828]"
        >
          <option value="all">All Severities</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
          <option value="critical">Critical</option>
        </select>
        <input 
          type="text" 
          placeholder="Filter by route..." 
          value={filters.route || ''}
          onChange={e => setFilters(f => ({ ...f, route: e.target.value }))}
          className="border border-gray-300 rounded p-1.5 text-sm focus:ring-[#D62828]"
        />
      </div>

      <div className="p-0 overflow-x-auto min-h-[200px]">
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-medium">Loading errors...</div>
        ) : !logs ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-gray-400">Error logging is not yet connected</span>
            <p className="text-sm text-gray-500 mt-2">The backend endpoint /api/developer/errors is missing.</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-medium">No errors found for these filters.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase">
              <tr>
                <th className="p-3 font-bold">Time</th>
                <th className="p-3 font-bold">Severity</th>
                <th className="p-3 font-bold">Route</th>
                <th className="p-3 font-bold">Message</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50 text-sm">
                  <td className="p-3 whitespace-nowrap text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${getSeverityColor(log.severity)}`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-gray-600">{log.route}</td>
                  <td className="p-3 text-gray-900">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
