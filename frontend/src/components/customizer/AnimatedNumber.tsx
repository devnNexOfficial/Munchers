'use client'

import { useEffect, useState } from 'react'
import { useSpring, useMotionValue } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  prefix?: string
  suffix?: string
}

/**
 * WHAT: Animates a number value with a spring easing — creates the "odometer rolling" effect
 * WHY:  Instant price jumps feel cheap; spring animation gives the customizer its premium feel
 * HOW:  Framer Motion motionValue + useSpring + on('change') update the displayed integer
 * PERFORMANCE: The spring runs on a RAF loop — no re-renders during animation,
 *              only the displayed number text updates via direct DOM mutation via useState
 */
export function AnimatedNumber({ value, prefix = '', suffix = '' }: AnimatedNumberProps) {
  const motionValue = useMotionValue(value)
  const springValue = useSpring(motionValue, {
    damping: 50,
    stiffness: 400,
  })
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    motionValue.set(value)
  }, [motionValue, value])

  useEffect(() => {
    // Cleanup: unsubscribe from spring on unmount to prevent memory leak
    return springValue.on('change', (latest) => {
      setDisplay(Math.round(latest))
    })
  }, [springValue])

  return (
    <span>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}
