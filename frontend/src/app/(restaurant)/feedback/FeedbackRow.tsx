'use client';

import { useState } from 'react';
import { FeedbackEntry, StaffRole } from './types';
import FeedbackReplyEditor from './FeedbackReplyEditor';

interface FeedbackRowProps {
  entry: FeedbackEntry;
  role: StaffRole;
  onToggleResolve: (id: string, current: boolean) => Promise<void>;
  onSaveReply: (id: string, text: string) => Promise<void>;
}

export default function FeedbackRow({ entry, role, onToggleResolve, onSaveReply }: FeedbackRowProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [expandedComment, setExpandedComment] = useState(false);

  const canEdit = role === 'owner' || role === 'manager';

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={`text-lg ${i < rating ? 'text-[#F7B731]' : 'text-gray-200'}`}>★</span>
    ));
  };

  const handleToggleResolve = async () => {
    if (!canEdit) return;
    await onToggleResolve(entry.id, entry.is_resolved);
  };

  const handleSaveReply = async (text: string) => {
    if (!canEdit) return;
    await onSaveReply(entry.id, text);
    setIsReplying(false);
  };

  const truncateComment = (text: string) => {
    if (expandedComment || text.length <= 150) return text;
    return text.slice(0, 150) + '...';
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-4 transition-shadow hover:shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
        
        {/* Left Col: Order Context & User */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-gray-900">Order #{entry.order_number}</span>
            <span className="bg-yellow-50 text-yellow-800 border border-yellow-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              {entry.order_type}
            </span>
          </div>
          <div className="text-xs text-gray-500 mb-2">
            Placed: {new Date(entry.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            <span className="mx-2">•</span>
            Total: Rs. {entry.order_total.toLocaleString('en-PK')}
          </div>
          <div className="text-sm font-medium text-gray-700">
            Customer: {entry.user_name || 'Anonymous User'}
          </div>
        </div>

        {/* Right Col: Overall Status & Toggle */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1">
            {renderStars(entry.rating)}
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${entry.is_resolved ? 'bg-green-100 text-[#22C55E]' : 'bg-orange-100 text-[#F59E0B]'}`}>
              {entry.is_resolved ? 'Resolved' : 'Pending'}
            </span>
            {canEdit && (
              <button 
                onClick={handleToggleResolve}
                className="text-xs font-medium text-gray-500 hover:text-gray-900 underline"
              >
                Mark {entry.is_resolved ? 'Pending' : 'Resolved'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 mb-4">
        {/* Secondary Ratings */}
        {(entry.food_rating !== null || entry.rider_rating !== null) && (
          <div className="flex gap-6 mb-3 text-xs text-gray-600">
            {entry.food_rating !== null && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Food:</span>
                <span className="text-[#F7B731]">★</span> {entry.food_rating}/5
              </div>
            )}
            {entry.rider_rating !== null && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Rider:</span>
                <span className="text-[#F7B731]">★</span> {entry.rider_rating}/5
              </div>
            )}
          </div>
        )}

        {/* Comment */}
        {entry.comment && (
          <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
            "{truncateComment(entry.comment)}"
            {entry.comment.length > 150 && (
              <button 
                onClick={() => setExpandedComment(!expandedComment)} 
                className="ml-2 text-[#D62828] text-xs font-bold hover:underline"
              >
                {expandedComment ? 'Show Less' : 'Read More'}
              </button>
            )}
          </div>
        )}

        {/* Photo Thumbnail */}
        {canEdit && entry.photo_signed_url && (
          <div className="mt-3">
            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Attached Photo</p>
            <a href={entry.photo_signed_url} target="_blank" rel="noreferrer" className="block w-24 h-24 border border-gray-200 rounded-lg overflow-hidden hover:opacity-80 transition-opacity">
              <img src={entry.photo_signed_url} alt="Feedback attached" className="w-full h-full object-cover" />
            </a>
          </div>
        )}
      </div>

      {/* Owner Reply Section */}
      {entry.owner_reply && !isReplying && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <p className="text-xs font-bold text-[#D62828] uppercase mb-1">Restaurant Replied:</p>
          <p className="text-sm text-red-900">{entry.owner_reply}</p>
          {canEdit && (
            <button onClick={() => setIsReplying(true)} className="mt-2 text-xs text-[#D62828] font-bold hover:underline">Edit Reply</button>
          )}
        </div>
      )}

      {/* Reply Action */}
      {!entry.owner_reply && !isReplying && canEdit && (
        <button 
          onClick={() => setIsReplying(true)}
          className="text-sm font-medium text-gray-700 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
        >
          Reply to Customer
        </button>
      )}

      {/* Editor */}
      {isReplying && canEdit && (
        <FeedbackReplyEditor 
          initialReply={entry.owner_reply} 
          onSave={handleSaveReply} 
          onCancel={() => setIsReplying(false)} 
        />
      )}
    </div>
  );
}
