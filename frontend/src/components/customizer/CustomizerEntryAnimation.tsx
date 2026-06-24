'use client'

/**
 * COMPONENT: CustomizerEntryAnimation
 * PURPOSE:   Plays the entry animation sequence when the user opens the customizer:
 *            menu photo implodes + fades → black screen → split layout reveal.
 *            Calls onAnimationComplete() when the reveal is done so the parent
 *            can switch to the full customizer layout.
 * DEPENDENCIES: next/image, Framer Motion
 * SIDE EFFECTS: Two setTimeout calls (cleaned up in useEffect returns).
 * PERFORMANCE: CSS transform + opacity only — no video, GIF, or particle effects
 *              per ai-instructions.md spec. Runs at 60fps on mid-range Android.
 *
 * ANIMATION SEQUENCE (4 steps):
 *   Step 1: Image visible at full scale/opacity
 *   Step 2: Image implodes (scale → 0, opacity → 0) — triggered after IMPLODE_DELAY_MS
 *   Step 3: Black screen (image gone) — triggered by Framer onAnimationComplete
 *   Step 4: Split-screen panels slide in — triggered after REVEAL_DELAY_MS
 */

import { useEffect, useState } from 'react'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

import {
  ANIMATION_IMPLODE_DELAY_MS,
  ANIMATION_REVEAL_DELAY_MS,
} from '@/lib/constants'

interface CustomizerEntryAnimationProps {
  /** URL of the menu item's photo — the starting point of the implode animation */
  menuItemImageUrl: string
  /** Called when the reveal animation finishes — parent switches to full customizer */
  onAnimationComplete: () => void
}

export function CustomizerEntryAnimation({
  menuItemImageUrl,
  onAnimationComplete,
}: CustomizerEntryAnimationProps) {
  /**
   * 4-step animation state machine:
   * 1 → image shown, 2 → image imploding, 3 → black screen, 4 → panels revealing
   */
  const [step, setStep] = useState(1)

  // Step 1 → 2: start implode after brief pause for user to register the image
  useEffect(() => {
    const timer = setTimeout(() => setStep(2), ANIMATION_IMPLODE_DELAY_MS)
    // Cleanup: prevent state update if component unmounts mid-animation
    return () => clearTimeout(timer)
  }, [])

  // Step 3 → 4: brief black screen pause before panels slide in
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => setStep(4), ANIMATION_REVEAL_DELAY_MS)
      return () => clearTimeout(timer)
    }
  }, [step])

  return (
    <div className="fixed inset-0 z-50 flex h-full w-full items-center justify-center bg-black overflow-hidden">
      {/* Phase 1 & 2: Menu item photo — implodes and fades out */}
      <AnimatePresence>
        {step < 3 && (
          <motion.div
            key="menu-item-image"
            initial={{ scale: 1, opacity: 1 }}
            animate={
              step === 2
                ? { scale: 0, opacity: 0 } // Implode: scale down to nothing
                : { scale: 1, opacity: 1 }  // Step 1: hold at full size
            }
            transition={{ duration: 0.5, ease: 'easeIn' }}
            onAnimationComplete={() => {
              // When the implode finishes, advance to the black screen step
              if (step === 2) setStep(3)
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="relative h-64 w-64 md:h-96 md:w-96">
              <Image
                src={menuItemImageUrl}
                alt="Preparing your customizer..."
                fill
                className="object-contain"
                // Priority: this is the first thing user sees — eager load
                priority
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 4: Split-screen panels slide in (left panel, canvas, right panel) */}
      {step === 4 && (
        <div className="flex h-full w-full flex-row">
          {/* Left panel slides in from left */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-1/4 bg-white"
          />
          {/* Canvas fades in (already bg-[#0A0A0A] from parent layout) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex-1 bg-[#0A0A0A]"
          />
          {/* Right panel slides in from right — fires onAnimationComplete when done */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            onAnimationComplete={() => onAnimationComplete()}
            className="w-1/4 bg-white"
          />
        </div>
      )}
    </div>
  )
}
