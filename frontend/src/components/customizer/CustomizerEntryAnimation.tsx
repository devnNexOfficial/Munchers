'use client'

import Image from 'next/image'
import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import type { Variants } from 'framer-motion'

interface CustomizerEntryAnimationProps {
  menuItemImageUrl: string
  onAnimationComplete: () => void
}

type EntryPhase = 'implode' | 'panels'

const imageVariants: Variants = {
  visible: { scale: 1, opacity: 1 },
  implode: { scale: 0, opacity: 0 },
}

const panelVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const leftPanelVariants: Variants = {
  hidden: { x: -100, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
}

const centerPanelVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
}

const rightPanelVariants: Variants = {
  hidden: { x: 100, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
}

export default function CustomizerEntryAnimation({
  menuItemImageUrl,
  onAnimationComplete,
}: CustomizerEntryAnimationProps) {
  const [phase, setPhase] = useState<EntryPhase>('implode')

  return (
    <AnimatePresence mode="wait">
      {phase === 'implode' ? (
        <motion.div
          key="menu-item-image"
          className="fixed inset-0 z-50 bg-black"
          variants={imageVariants}
          initial="visible"
          animate="implode"
          transition={{ duration: 0.5, ease: 'easeIn' }}
          onAnimationComplete={() => setPhase('panels')}
        >
          <Image
            src={menuItemImageUrl}
            alt="Selected menu item"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      ) : (
        <motion.div
          key="panel-reveal"
          className="fixed inset-0 z-50 bg-black"
          initial="black"
          animate="visible"
          variants={{
            black: { opacity: 1 },
            visible: {
              opacity: 1,
              transition: {
                delay: 0.2,
                when: 'beforeChildren',
              },
            },
          }}
        >
          <motion.div
            className="flex h-full w-full"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            onAnimationComplete={onAnimationComplete}
          >
            <motion.div className="h-full w-1/4 bg-white" variants={leftPanelVariants} />
            <motion.div className="h-full flex-1 bg-[#0A0A0A]" variants={centerPanelVariants} />
            <motion.div className="h-full w-1/4 bg-white" variants={rightPanelVariants} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
