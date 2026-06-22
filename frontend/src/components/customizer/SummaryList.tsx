'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from 'framer-motion'
import { useCustomizerStore } from '@/store/useCustomizerStore'
import type { CustomizerIngredient } from '@/lib/layerConfig'

// Helper component for animating numbers
function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number, prefix?: string, suffix?: string }) {
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
    return springValue.on('change', (latest) => {
      setDisplay(Math.round(latest))
    })
  }, [springValue])

  return <span>{prefix}{display}{suffix}</span>
}

interface SummaryListProps {
  ingredients: CustomizerIngredient[]
  basePrice: number
  basePrepTime: number
  onAddToCart: () => void
  buttonText?: string
}

export function SummaryList({ ingredients, basePrice, basePrepTime, onAddToCart, buttonText = 'Add to Cart' }: SummaryListProps) {
  const { selections, calculateSubtotal, calculatePrepTime } = useCustomizerStore()

  const subtotal = calculateSubtotal(basePrice, ingredients)
  const prepTime = calculatePrepTime(basePrepTime, ingredients)

  // Identify selected items
  const selectedItems = ingredients.filter(ing => selections[ing.id] && selections[ing.id].qty > 0)
  
  // Identify missing required items
  const missingRequired = ingredients.filter(ing => ing.isRequired && (!selections[ing.id] || selections[ing.id].qty === 0))

  return (
    <div className="flex h-full flex-col bg-white p-6 shadow-xl">
      <h2 className="mb-4 text-xl font-black text-muncherz-black">Summary</h2>
      
      <div className="flex-1 overflow-y-auto pr-2">
        <AnimatePresence mode="popLayout">
          {selectedItems.map((ing) => {
            const sel = selections[ing.id]
            const totalItemPrice = sel.qty * ing.pricePerUnit

            return (
              <motion.div
                key={ing.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="mb-3 flex items-center justify-between rounded-xl bg-gray-50 p-2 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-md bg-white p-1">
                    <Image
                      src={ing.pngImageUrl || '/placeholder.png'}
                      alt={ing.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{ing.name}</p>
                    <p className="text-xs font-medium text-gray-500">
                      x{sel.qty} {sel.tier ? `(${sel.tier})` : ''}
                    </p>
                  </div>
                </div>
                <div className="text-sm font-black text-muncherz-red">
                  PKR {totalItemPrice}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        
        {selectedItems.length === 0 && (
          <p className="mt-10 text-center text-sm text-gray-400">No items added yet</p>
        )}
      </div>

      <div className="mt-4 border-t pt-4">
        <div className="mb-2 flex items-center justify-between text-gray-600">
          <span className="text-sm font-bold">Prep Time</span>
          <span className="text-sm font-black">
            <AnimatedNumber value={prepTime} suffix=" mins" />
          </span>
        </div>
        <div className="mb-6 flex items-center justify-between">
          <span className="text-lg font-black text-muncherz-black">Subtotal</span>
          <span className="text-2xl font-black text-muncherz-red">
            <AnimatedNumber value={subtotal} prefix="PKR " />
          </span>
        </div>

        <button
          onClick={onAddToCart}
          disabled={missingRequired.length > 0}
          className="w-full rounded-xl bg-muncherz-red py-4 text-center text-lg font-black text-white shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
        >
          {missingRequired.length > 0 ? 'Missing Requirements' : buttonText}
        </button>

        {missingRequired.length > 0 && (
          <div className="mt-3 text-center text-xs font-bold text-muncherz-red">
            Please add: {missingRequired.map(i => i.name).join(', ')}
          </div>
        )}
      </div>
    </div>
  )
}
