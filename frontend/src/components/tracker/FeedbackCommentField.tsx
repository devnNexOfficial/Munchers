interface FeedbackCommentFieldProps {
  comment: string
  onCommentChange: (comment: string) => void
}

export function FeedbackCommentField({ comment, onCommentChange }: FeedbackCommentFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-gray-700">Comments (Optional)</label>
      <textarea
        maxLength={500}
        value={comment}
        onChange={(event) => onCommentChange(event.target.value)}
        placeholder="Tell us what you liked or how we can improve..."
        className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm focus:border-muncherz-red focus:outline-none focus:ring-1 focus:ring-muncherz-red"
        rows={3}
      />
    </div>
  )
}

