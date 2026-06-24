'use client'

/**
 * COMPONENT: LoadingSpinner
 * PURPOSE:   Consistent animated spinner used for loading states across the app.
 *            Replaces bare "Loading..." text with a visually coherent indicator.
 * WHY:       "Loading...", "Please wait", "Fetching..." are dead text — a spinner
 *            feels alive and signals that work is happening.
 * DEPENDENCIES: None — purely presentational.
 * PERFORMANCE: React.memo applied. The animation runs via CSS (Tailwind animate-spin)
 *              — no JS timer or requestAnimationFrame overhead.
 */

import React from 'react'

interface LoadingSpinnerProps {
  /** Size of the spinner — defaults to 'md' */
  size?: 'sm' | 'md' | 'lg'
  /** Optional label shown below the spinner for screen readers and visual clarity */
  label?: string
}

const SIZE_CLASSES = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
} as const

export const LoadingSpinner = React.memo(function LoadingSpinner({
  size = 'md',
  label,
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8" role="status">
      <div
        className={`animate-spin rounded-full border-muncherz-red border-t-transparent ${SIZE_CLASSES[size]}`}
        aria-hidden="true"
      />
      {label && (
        <p className="text-sm font-bold text-gray-500">{label}</p>
      )}
      <span className="sr-only">{label ?? 'Loading...'}</span>
    </div>
  )
})
