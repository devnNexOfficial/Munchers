'use client';

import { useState } from 'react';
import { z } from 'zod';

interface FeedbackReplyEditorProps {
  initialReply: string | null;
  onSave: (reply: string) => Promise<void>;
  onCancel: () => void;
}

const replySchema = z.string().min(1, 'Reply cannot be empty');

export default function FeedbackReplyEditor({ initialReply, onSave, onCancel }: FeedbackReplyEditorProps) {
  const [text, setText] = useState(initialReply || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      replySchema.parse(text.trim());
      setError(null);
      setIsSaving(true);
      await onSave(text.trim());
    } catch (e) {
      if (e instanceof z.ZodError) setError(e.errors[0].message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Write a Reply</label>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={isSaving}
        placeholder="Type your response to the customer here..."
        className="w-full h-24 border border-gray-300 rounded-lg p-3 text-sm focus:ring-[#D62828] focus:border-[#D62828] resize-none"
      />
      {error && <p className="text-xs text-[#EF4444] mt-1 font-medium">{error}</p>}
      <div className="flex justify-end gap-3 mt-3">
        <button 
          onClick={onCancel} 
          disabled={isSaving}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 text-sm font-medium text-white bg-[#D62828] rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Reply'}
        </button>
      </div>
    </div>
  );
}
