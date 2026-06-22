'use client'

import { motion } from 'framer-motion'

interface LimitBarProps {
  current: number
  max: number
}

export default function LimitBar({ current, max }: LimitBarProps) {
  const safeMax = Math.max(1, max)
  const clampedCurrent = Math.max(0, Math.min(current, safeMax))
  const percent = (clampedCurrent / safeMax) * 100
  const isFull = clampedCurrent === safeMax

  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
      <motion.div
        className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200"
        animate={isFull ? { x: [0, 5, -5, 5, 0] } : { x: 0 }}
        transition={{ duration: 0.28, ease: 'easeInOut' }}
      >
        <motion.div
          className="h-full rounded-full bg-muncherz-red"
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        />
      </motion.div>
      <span className="w-10 text-right tabular-nums">
        {clampedCurrent}/{safeMax}
      </span>
    </div>
  )
}
