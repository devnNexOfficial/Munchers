'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CustomizerEntryAnimation } from './CustomizerEntryAnimation'
import { BurgerCanvas } from './BurgerCanvas'
import { IngredientPanel } from './IngredientPanel'
import { SummaryList } from './SummaryList'
import { useCustomizerSteps } from '@/hooks/useCustomizerSteps'

import { useCustomizerStore } from '@/store/useCustomizerStore'
import { useCartStore } from '@/store/useCartStore'

export function CustomizerPageClient({ itemId, editCartItemId }: { itemId: string; editCartItemId?: string }) {
  const router = useRouter()
  const [ingredients, setIngredients] = useState<any[]>([])
  const [menuItem, setMenuItem] = useState<any>(null)
  const [isAnimating, setIsAnimating] = useState(true)
  const [isExiting, setIsExiting] = useState(false)
  const [loading, setLoading] = useState(true)

  const steps = useCustomizerSteps(ingredients)

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
          
        if (editCartItemId) {
          const cartItem = useCartStore.getState().cartItems.find(i => i.cartItemId === editCartItemId)
          if (cartItem) {
            useCustomizerStore.getState().loadSelections(cartItem.selections)
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchIngredients()
  }, [itemId, editCartItemId])

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

  const handleSaveToCart = () => {
    const { selections } = useCustomizerStore.getState()
    const selectionsArray = Object.values(selections)
    
    // Subtotal calculations logic goes here when actually saving, or we reuse store methods
    const basePrice = menuItem?.base_price || 0
    const totalPrice = useCustomizerStore.getState().calculateSubtotal(basePrice, ingredients)
    
    if (editCartItemId) {
      useCartStore.getState().updateItem(editCartItemId, {
        selections: selectionsArray,
        totalPrice: totalPrice // Need to consider meal price, but wait, updateItem preserves meal price if we update base properly. 
        // Wait, getTotalWithoutMeal uses totalPrice in cartStore. So we should re-add meal price if needed?
        // Actually, cartStore assumes totalPrice INCLUDES mealPrice. So we must add the meal total.
        // Let's just do it directly.
      })
      // Correct way to handle meal price when editing:
      const cartItem = useCartStore.getState().cartItems.find(i => i.cartItemId === editCartItemId)
      if (cartItem) {
        const mealTotal = cartItem.mealOptions.reduce((acc, opt) => acc + opt.quantity * opt.extraPrice, 0)
        useCartStore.getState().updateItem(editCartItemId, {
          selections: selectionsArray,
          totalPrice: totalPrice + mealTotal
        })
      }
    } else {
      useCartStore.getState().addItem({
        cartItemId: crypto.randomUUID(),
        menuItemId: itemId,
        name: menuItem?.name || 'Custom Item',
        imageUrl: menuItem?.image_url || '/placeholder.png',
        basePrice: basePrice,
        selections: selectionsArray,
        mealOptions: [],
        totalPrice: totalPrice,
        quantity: 1,
        specialInstructions: ''
      })
    }
    
    handleExit('/cart')
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
          <div className="w-1/4 h-full border-r">
            <IngredientPanel
              ingredients={steps.currentIngredients}
              title={steps.currentTitle}
              currentStep={steps.currentStep}
              totalSteps={steps.totalSteps}
              onNext={steps.goNext}
              onBack={steps.goBack}
              canGoNext={steps.canGoNext}
            />
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <BurgerCanvas ingredients={ingredients} />
            {/* Temporary exit button to demonstrate the exit animation */}
            <button 
              onClick={() => handleExit('/')}
              className="absolute top-4 left-4 z-50 rounded bg-white px-4 py-2 text-sm font-bold text-black"
            >
              Exit Customizer
            </button>
          </div>
          
          <div className="w-1/4 h-full border-l">
            <SummaryList
              ingredients={ingredients}
              basePrice={menuItem?.base_price || 0}
              basePrepTime={menuItem?.prep_time || 0}
              onAddToCart={handleSaveToCart}
              buttonText={editCartItemId ? 'Save Changes' : 'Add to Cart'}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
