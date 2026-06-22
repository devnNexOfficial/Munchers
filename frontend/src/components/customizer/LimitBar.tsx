'use client'

import { motion } from 'framer-motion'

interface LimitBarProps {
  current: number
  max: number
}

export function LimitBar({ current, max }: LimitBarProps) {
  const isMaxed = current >= max
  const percentage = max > 0 ? Math.min(100, (current / max) * 100) : 0

  return (
    <div className="mt-2 w-full">
      <div className="mb-1 flex items-center justify-between text-[10px] font-bold text-gray-500">
        <span>LIMIT</span>
        <span className={isMaxed ? 'text-muncherz-red' : ''}>
          {current}/{max}
        </span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <motion.div
          animate={
            isMaxed
              ? { x: [0, 5, -5, 5, 0], width: `${percentage}%` }
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
}
