'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface CustomizerEntryAnimationProps {
  menuItemImageUrl: string
  onAnimationComplete: () => void
}

export function CustomizerEntryAnimation({ menuItemImageUrl, onAnimationComplete }: CustomizerEntryAnimationProps) {
  const [step, setStep] = useState(1)

  useEffect(() => {
    // Step 1 -> 2: Implode image
    const t1 = setTimeout(() => setStep(2), 500)
    return () => clearTimeout(t1)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex h-full w-full items-center justify-center bg-black overflow-hidden">
      <AnimatePresence>
        {step < 3 && (
          <motion.div
            key="image"
            initial={{ scale: 1, opacity: 1 }}
            animate={step === 2 ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeIn' }}
            onAnimationComplete={() => {
              if (step === 2) {
                setStep(3)
                // Step 3: Black screen for 200ms
                setTimeout(() => setStep(4), 200)
              }
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="relative h-64 w-64 md:h-96 md:w-96">
              <Image 
                src={menuItemImageUrl} 
                alt="Menu Item" 
                fill 
                className="object-contain" 
                priority 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {step === 4 && (
        <div className="flex h-full w-full flex-row">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-1/4 bg-white"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex-1 bg-[#0A0A0A]"
          />
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
