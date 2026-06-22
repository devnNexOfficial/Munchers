'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CustomizerEntryAnimation } from './CustomizerEntryAnimation'
import { BurgerCanvas } from './BurgerCanvas'

export function CustomizerPageClient({ itemId }: { itemId: string }) {
  const router = useRouter()
  const [ingredients, setIngredients] = useState<any[]>([])
  const [menuItem, setMenuItem] = useState<any>(null)
  const [isAnimating, setIsAnimating] = useState(true)
  const [isExiting, setIsExiting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchIngredients() {
      try {
        const res = await fetch(`/api/customizer/ingredients?itemId=${itemId}`)
        if (!res.ok) {
          setLoading(false)
          return
        }
        const data = await res.json()
        setIngredients(data.ingredients || [])
        setMenuItem(data.menuItem || { image_url: '/placeholder.png' })
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchIngredients()
  }, [itemId])

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-muncherz-black text-white">Loading...</div>
  }

  // Fallback in case of 404
  if (!ingredients.length && !menuItem) {
    return <div className="flex h-screen items-center justify-center bg-muncherz-black text-white">Item not found.</div>
  }

  if (isAnimating) {
    return (
      <CustomizerEntryAnimation 
        menuItemImageUrl={menuItem?.image_url || '/placeholder.png'} 
        onAnimationComplete={() => setIsAnimating(false)} 
      />
    )
  }

  // A helper to trigger the exit animation before navigating away
  const handleExit = (path: string = '/') => {
    setIsExiting(true)
    setTimeout(() => {
      router.push(path)
    }, 300) // matches exit duration
  }

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div 
          key="customizer-layout"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex h-screen w-full flex-row overflow-hidden bg-[#0A0A0A]"
        >
          <div className="w-1/4 bg-white flex items-center justify-center border-r">
            <span className="text-gray-400 text-sm font-bold text-center px-4">Ingredient Panels — Section 8</span>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <BurgerCanvas ingredients={ingredients} />
            {/* Temporary exit button to demonstrate the exit animation */}
            <button 
              onClick={() => handleExit('/')}
              className="absolute top-4 right-4 z-50 rounded bg-white px-4 py-2 text-sm font-bold text-black"
            >
              Exit Customizer
            </button>
          </div>
          
          <div className="w-1/4 bg-white flex items-center justify-center border-l">
            <span className="text-gray-400 text-sm font-bold text-center px-4">Summary List — Section 8</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
