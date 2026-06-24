'use client'

/**
 * COMPONENT: Skeleton
 * PURPOSE:   Placeholder loading animation that matches the shape of the content
 *            that will load. Replaces "Loading..." text with content-shaped skeletons.
 * WHY:       Skeleton loaders dramatically reduce perceived load time (they feel faster
 *            than a spinner because users can see the layout forming).
 * DEPENDENCIES: None — purely presentational.
 * PERFORMANCE: Pure CSS animation via Tailwind animate-pulse — zero JS overhead.
 *              React.memo'd since props are almost always stable.
 */

import React from 'react'

interface SkeletonProps {
  /** Additional Tailwind classes for sizing and shape (e.g. "h-4 w-32 rounded-full") */
  className?: string
}

/**
 * WHAT: A single skeleton block — a grey animated placeholder
 *
 * @param className - Tailwind classes for height, width, and border-radius
 */
export const Skeleton = React.memo(function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 ${className}`}
      aria-hidden="true"
    />
  )
})

/**
 * WHAT: Pre-built skeleton layout for an item card (image + text rows)
 * WHY:  Avoids repeating the same card skeleton structure across the app.
 */
export const ItemCardSkeleton = React.memo(function ItemCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm">
      <Skeleton className="aspect-video w-full rounded-xl" />
      <Skeleton className="mt-3 h-4 w-3/4" />
      <Skeleton className="mt-2 h-3 w-1/2" />
      <Skeleton className="mt-3 h-9 w-full rounded-xl" />
    </div>
  )
})

/**
 * WHAT: Pre-built skeleton for the home page item grid (2 columns, 6 cards)
 * WHY:  Centralises the grid skeleton to avoid duplication in ItemGrid
 */
export const ItemGridSkeleton = React.memo(function ItemGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 pt-5 md:grid-cols-3 md:gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        // Stable key using index is fine here — purely decorative, never reordered
        <ItemCardSkeleton key={index} />
      ))}
    </div>
  )
})
