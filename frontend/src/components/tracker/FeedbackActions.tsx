interface FeedbackActionsProps {
  canSubmit: boolean
  isSubmitting: boolean
  onSubmit: () => void
  onSkip: () => void
}

export function FeedbackActions({
  canSubmit,
  isSubmitting,
  onSubmit,
  onSkip,
}: FeedbackActionsProps) {
  return (
    <div className="pt-4 flex flex-col gap-3">
      <button
        onClick={onSubmit}
        disabled={!canSubmit || isSubmitting}
        className="w-full rounded-xl bg-muncherz-red py-3.5 font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
      </button>
      <button
        onClick={onSkip}
        className="w-full py-2 text-sm font-semibold text-gray-500 hover:text-gray-800"
      >
        Skip
      </button>
    </div>
  )
}

