import React from 'react';

/**
 * COMPONENT: EmptyState
 * PURPOSE: Displays a consistent empty state UI when there is no data
 *          to show (empty cart, no orders, no search results, etc.).
 * WHY: Replaces ad-hoc "No items" messages everywhere.
 * EDGE CASES: Optional action button for navigation prompts.
 */
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-4 text-muncherz-red">{icon}</div>}
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-gray-500">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 rounded-lg bg-muncherz-red px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
