import React from 'react';

/**
 * COMPONENT: ErrorMessage
 * PURPOSE: Displays a consistent error state with optional retry button.
 * WHY: Replaces ad-hoc error messages throughout the app.
 * EDGE CASES: Shows retry button only when onRetry callback is provided.
 */
interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-red-50 px-6 py-12 text-center">
      <div className="mb-3 text-3xl">⚠️</div>
      <p className="mb-4 text-sm font-medium text-red-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-muncherz-red px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
