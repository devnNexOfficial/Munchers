'use client'

/**
 * COMPONENT: ErrorMessage
 * PURPOSE:   Consistent inline error display with optional retry button.
 *            Used whenever a data-fetch fails and we need to surface it to the user.
 * WHY:       "Error", "Failed", "Something went wrong" are cold and unhelpful.
 *            This component enforces human-friendly messages with a clear retry path.
 * DEPENDENCIES: None — purely presentational.
 * PERFORMANCE: React.memo applied — re-renders only when message or onRetry changes.
 */

import React from 'react'
import { AlertCircle } from 'lucide-react'

interface ErrorMessageProps {
  /** Human-friendly error message explaining what went wrong and what to do */
  message: string
  /** Optional retry handler — shows a "Try Again" button if provided */
  onRetry?: () => void
}

export const ErrorMessage = React.memo(function ErrorMessage({
  message,
  onRetry,
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-6 py-8 text-center"
    >
      <AlertCircle className="h-8 w-8 text-muncherz-red" aria-hidden="true" />
      <p className="text-sm font-bold text-gray-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-xl border border-muncherz-red px-5 py-2.5 text-sm font-black text-muncherz-red transition hover:bg-red-50 active:scale-95"
        >
          Try Again
        </button>
      )}
    </div>
  )
})
