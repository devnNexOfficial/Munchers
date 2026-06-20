'use client';

import { useState } from 'react';
import { FeedbackEntry, StaffRole } from './types';
import FeedbackRow from './FeedbackRow';
import FeedbackStatsRow from './FeedbackStatsRow';

interface FeedbackListProps {
  initialEntries: FeedbackEntry[];
  role: StaffRole;
}

export default function FeedbackList({ initialEntries, role }: FeedbackListProps) {
  const [entries, setEntries] = useState<FeedbackEntry[]>(initialEntries);
  const [filterResolved, setFilterResolved] = useState<'all' | 'pending' | 'resolved'>('all');
  const [filterRating, setFilterRating] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');
  const [filterType, setFilterType] = useState<'all' | 'delivery' | 'dine-in' | 'takeaway'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'rating_desc' | 'rating_asc'>('newest');

  const handleToggleResolve = async (id: string, current: boolean) => {
    // Optimistic UI update
    setEntries(prev => prev.map(e => e.id === id ? { ...e, is_resolved: !current } : e));
    
    try {
      // Mock API call to update database
      await fetch(`/api/restaurant/feedback/${id}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_resolved: !current }),
      });
    } catch (err) {
      // Revert on failure (omitted for brevity)
    }
  };

  const handleSaveReply = async (id: string, text: string) => {
    // Optimistic UI update
    setEntries(prev => prev.map(e => e.id === id ? { ...e, owner_reply: text } : e));
    
    try {
      // Mock API call to update database
      await fetch(`/api/restaurant/feedback/${id}/reply`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner_reply: text }),
      });
    } catch (err) {
      // Revert on failure (omitted for brevity)
    }
  };

  const filteredAndSorted = entries
    .filter(e => {
      if (filterResolved === 'pending' && e.is_resolved) return false;
      if (filterResolved === 'resolved' && !e.is_resolved) return false;
      if (filterRating !== 'all' && e.rating.toString() !== filterRating) return false;
      if (filterType !== 'all' && e.order_type.toLowerCase() !== filterType) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sort === 'rating_desc') return b.rating - a.rating;
      if (sort === 'rating_asc') return a.rating - b.rating;
      return 0;
    });

  return (
    <div>
      <FeedbackStatsRow entries={entries} />

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Status:</label>
            <select value={filterResolved} onChange={e => setFilterResolved(e.target.value as any)} className="border border-gray-300 rounded p-1.5 text-sm focus:ring-[#D62828]">
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Rating:</label>
            <select value={filterRating} onChange={e => setFilterRating(e.target.value as any)} className="border border-gray-300 rounded p-1.5 text-sm focus:ring-[#D62828]">
              <option value="all">All</option>
              <option value="1">1 Star</option>
              <option value="2">2 Stars</option>
              <option value="3">3 Stars</option>
              <option value="4">4 Stars</option>
              <option value="5">5 Stars</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Order Type:</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value as any)} className="border border-gray-300 rounded p-1.5 text-sm focus:ring-[#D62828]">
              <option value="all">All</option>
              <option value="delivery">Delivery</option>
              <option value="dine-in">Dine-in</option>
              <option value="takeaway">Takeaway</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-500 uppercase">Sort By:</label>
          <select value={sort} onChange={e => setSort(e.target.value as any)} className="border border-gray-300 rounded p-1.5 text-sm focus:ring-[#D62828]">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating_desc">Highest Rated</option>
            <option value="rating_asc">Lowest Rated</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredAndSorted.map(entry => (
          <FeedbackRow 
            key={entry.id} 
            entry={entry} 
            role={role} 
            onToggleResolve={handleToggleResolve} 
            onSaveReply={handleSaveReply} 
          />
        ))}
        {filteredAndSorted.length === 0 && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
            No feedback entries match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
