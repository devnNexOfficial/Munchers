'use client'

/**
 * COMPONENT: EmptyState
 * PURPOSE:   Consistent, warm empty-state UI used across the app wherever
 *            a list or section has no content to show.
 * WHY:       Scattered inline "No items found" texts are cold and inconsistent.
 *            One shared component ensures every empty state feels human and
 *            on-brand, and can be improved in one place.
 * DEPENDENCIES: None — purely presentational, no store or API.
 * PERFORMANCE: Static component; React.memo is applied to prevent re-renders
 *              when parent re-renders with identical props.
 */

import React from 'react'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  /** Lucide icon component to display above the title */
  icon?: LucideIcon
  /** Primary text — the main empty state heading */
  title: string
  /** Secondary text — explains what to do or why it's empty */
  description: string
  /** Optional CTA button label */
  actionLabel?: string
  /** Optional CTA handler — rendered as a button if provided */
  onAction?: () => void
}

export const EmptyState = React.memo(function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <Icon className="h-8 w-8 text-gray-400" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-base font-black text-muncherz-black">{title}</h3>
      <p className="mt-2 max-w-xs text-sm font-medium text-gray-500">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-xl bg-muncherz-red px-6 py-3 text-sm font-black text-white transition hover:opacity-90 active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
})
