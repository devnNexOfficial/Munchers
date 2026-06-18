import React from 'react'

// ─── Base Skeleton Pulse ─────────────────────────────────────────────────────
interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden bg-neutral-800/60 rounded-lg before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.06] before:to-transparent ${className}`}
    />
  )
}

// ─── Menu Product Card Skeleton ──────────────────────────────────────────────
export function MenuCardSkeleton() {
  return (
    <div className="bg-[#121212] border border-neutral-800/60 rounded-xl overflow-hidden p-5 flex flex-col gap-4 animate-pulse">
      {/* Image placeholder */}
      <Skeleton className="h-44 w-full rounded-lg" />

      {/* Title + price row */}
      <div className="flex items-start justify-between gap-4">
        <Skeleton className="h-4 w-2/3 rounded" />
        <Skeleton className="h-4 w-16 rounded" />
      </div>

      {/* Description lines */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-4/5 rounded" />
      </div>

      {/* Divider + action row */}
      <div className="pt-3 border-t border-neutral-900 flex items-center justify-between">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  )
}

// ─── Order Card Skeleton ─────────────────────────────────────────────────────
export function OrderCardSkeleton() {
  return (
    <div className="bg-[#121212] border border-neutral-800/60 rounded-xl p-6 flex flex-col gap-4 animate-pulse">
      {/* Header row */}
      <div className="flex items-start justify-between border-b border-neutral-900 pb-3">
        <div className="space-y-1.5">
          <Skeleton className="h-2.5 w-20 rounded" />
          <Skeleton className="h-4 w-28 rounded" />
        </div>
        <div className="space-y-1.5 items-end flex flex-col">
          <Skeleton className="h-2.5 w-16 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
      </div>

      {/* Customer line */}
      <div className="space-y-1">
        <Skeleton className="h-2.5 w-24 rounded" />
        <Skeleton className="h-3.5 w-36 rounded" />
      </div>

      {/* Items block */}
      <div className="bg-[#0A0A0A]/50 border border-neutral-900 rounded-lg p-3 space-y-2.5">
        <Skeleton className="h-3 w-3/4 rounded" />
        <Skeleton className="h-3 w-2/3 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>

      {/* Action button */}
      <div className="pt-3 border-t border-neutral-900">
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
    </div>
  )
}

// ─── Category Pill Skeleton ──────────────────────────────────────────────────
export function CategoryPillSkeleton() {
  return (
    <div className="flex items-center gap-2">
      {[80, 96, 72, 88].map((w, i) => (
        <Skeleton
          key={i}
          className="h-9 rounded-full animate-pulse"
          style={{ width: `${w}px` }}
        />
      ))}
    </div>
  )
}

// ─── Stats Card Skeleton ─────────────────────────────────────────────────────
export function StatsCardSkeleton() {
  return (
    <div className="bg-[#121212] border border-neutral-800/60 rounded-xl p-4 flex flex-col gap-2 animate-pulse">
      <Skeleton className="h-2.5 w-24 rounded" />
      <Skeleton className="h-7 w-12 rounded mt-1" />
    </div>
  )
}

// ─── Table Row Skeleton ──────────────────────────────────────────────────────
export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-b border-neutral-900">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-3.5 rounded" style={{ width: i === 0 ? '60%' : '80%' }} />
        </td>
      ))}
    </tr>
  )
}
