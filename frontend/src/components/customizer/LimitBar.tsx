'use client'

/**
 * COMPONENT: LimitBar
 * PURPOSE:   Visual fill-bar showing how close an ingredient is to its max limit.
 *            Shakes when the limit is hit to signal "you've reached the cap."
 * DEPENDENCIES: Framer Motion (motion.div for shake animation)
 * SIDE EFFECTS: None — display only.
 * PERFORMANCE: React.memo — only re-renders when current or max changes.
 *              Animation runs via Framer Motion's layout engine (GPU-composited).
 */

import React from 'react'

import { motion } from 'framer-motion'

interface LimitBarProps {
  /** Current ingredient quantity */
  current: number
  /** Maximum quantity allowed (from menu_item_ingredients.max_qty) */
  max: number
}

export const LimitBar = React.memo(function LimitBar({ current, max }: LimitBarProps) {
  const isMaxed = current >= max
  // Guard against division by zero — max should always be > 0 from DB constraints
  const percentage = max > 0 ? Math.min(100, (current / max) * 100) : 0

  return (
    <div className="mt-2 w-full">
      <div className="mb-1 flex items-center justify-between text-[10px] font-bold text-gray-500">
        <span>LIMIT</span>
        {/* Turn red when maxed to visually reinforce the block */}
        <span className={isMaxed ? 'text-muncherz-red' : ''}>
          {current}/{max}
        </span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <motion.div
          animate={
            isMaxed
              ? // Shake animation when maxed — [0, 5, -5, 5, 0] = left-right micro-shake
                { x: [0, 5, -5, 5, 0], width: `${percentage}%` }
              : { width: `${percentage}%` }
          }
          transition={{
            width: { duration: 0.3, ease: 'easeOut' },
            x: { duration: 0.4, ease: 'easeInOut' },
          }}
          className="absolute h-full rounded-full bg-muncherz-red"
        />
      </div>
    </div>
  )
})
