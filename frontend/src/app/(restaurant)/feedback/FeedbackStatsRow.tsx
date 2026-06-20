import { FeedbackEntry } from './types';

interface FeedbackStatsRowProps {
  entries: FeedbackEntry[];
}

export default function FeedbackStatsRow({ entries }: FeedbackStatsRowProps) {
  const total = entries.length;
  const pending = entries.filter(e => !e.is_resolved).length;
  const resolved = total - pending;
  const resolvedPercent = total > 0 ? Math.round((resolved / total) * 100) : 0;
  
  const avgRating = total > 0 
    ? (entries.reduce((sum, e) => sum + e.rating, 0) / total).toFixed(1)
    : '0.0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
        <p className="text-sm font-medium text-gray-500 mb-1">Average Rating</p>
        <p className="text-3xl font-bold text-gray-900 flex items-center gap-1">
          {avgRating} <span className="text-[#F7B731] text-2xl">★</span>
        </p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
        <p className="text-sm font-medium text-gray-500 mb-1">Total Feedback</p>
        <p className="text-3xl font-bold text-gray-900">{total}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
        <p className="text-sm font-medium text-[#F59E0B] mb-1">Pending Review</p>
        <p className="text-3xl font-bold text-[#F59E0B]">{pending}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
        <p className="text-sm font-medium text-[#22C55E] mb-1">Resolved</p>
        <p className="text-3xl font-bold text-[#22C55E]">{resolvedPercent}%</p>
      </div>
    </div>
  );
}
