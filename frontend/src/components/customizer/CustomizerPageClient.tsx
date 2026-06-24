'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useCustomizerSteps } from '@/hooks/useCustomizerSteps'
import { CUSTOMIZER_EXIT_DURATION_MS } from '@/lib/constants'
import type { CustomizerIngredient } from '@/lib/layerConfig'
import type { MenuItem } from '@/lib/queries/home'
import { useCartStore } from '@/store/useCartStore'
import { useCustomizerStore } from '@/store/useCustomizerStore'

import { CustomizerEntryAnimation } from './CustomizerEntryAnimation'
import { CustomizerLayout } from './CustomizerLayout'
import { CustomizerNotFound } from './CustomizerNotFound'

interface CustomizerPageClientProps {
  itemId: string
  editCartItemId?: string
}

export function CustomizerPageClient({ itemId, editCartItemId }: CustomizerPageClientProps) {
  const router = useRouter()
  const [ingredients, setIngredients] = useState<CustomizerIngredient[]>([])
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null)
  const [isAnimating, setIsAnimating] = useState(true)
  const [isExiting, setIsExiting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const steps = useCustomizerSteps(ingredients)

  useEffect(() => {
    async function fetchIngredients(): Promise<void> {
      try {
        const response = await fetch(`/api/customizer/ingredients?itemId=${itemId}`)
        if (!response.ok) {
          setIsLoading(false)
          return
        }

        const data = await response.json() as {
          ingredients?: CustomizerIngredient[]
          menuItem?: MenuItem
        }
        setIngredients(data.ingredients ?? [])
        setMenuItem(data.menuItem ?? null)

        if (editCartItemId) {
          const cartItem = useCartStore.getState().cartItems.find(
            (item) => item.cartItemId === editCartItemId
          )
          if (cartItem) {
            useCustomizerStore.getState().loadSelections(cartItem.selections)
          }
        }
      } catch (error) {
        console.error('[CustomizerPageClient] Failed to load ingredients:', error)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchIngredients()
  }, [itemId, editCartItemId])

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current)
      }
    }
  }, [])

  const handleExit = useCallback((path: string = '/'): void => {
    setIsExiting(true)
    exitTimerRef.current = setTimeout(() => {
      router.push(path)
    }, CUSTOMIZER_EXIT_DURATION_MS)
  }, [router])

  const handleSaveToCart = useCallback((): void => {
    const { selections } = useCustomizerStore.getState()
    const selectionsArray = Object.values(selections)
    const basePrice = menuItem?.base_price ?? 0
    const estimatedTotal = useCustomizerStore.getState().calculateSubtotal(basePrice, ingredients)

    if (editCartItemId) {
      const cartItem = useCartStore.getState().cartItems.find(
        (item) => item.cartItemId === editCartItemId
      )
      if (cartItem) {
        const mealTotal = cartItem.mealOptions.reduce(
          (total, option) => total + option.quantity * option.extraPrice,
          0
        )
        useCartStore.getState().updateItem(editCartItemId, {
          selections: selectionsArray,
          totalPrice: estimatedTotal + mealTotal,
        })
      }
    } else {
      useCartStore.getState().addItem({
        cartItemId: crypto.randomUUID(),
        menuItemId: itemId,
        name: menuItem?.name_en ?? 'Custom Item',
        imageUrl: menuItem?.image_url ?? '/placeholder.png',
        basePrice,
        selections: selectionsArray,
        mealOptions: [],
        totalPrice: estimatedTotal,
        quantity: 1,
        specialInstructions: '',
      })
    }

    handleExit('/cart')
  }, [editCartItemId, handleExit, ingredients, itemId, menuItem])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muncherz-black">
        <LoadingSpinner size="lg" label="Loading the freshest ingredients..." />
      </div>
    )
  }

  if (ingredients.length === 0 && !menuItem) {
    return <CustomizerNotFound onBackToMenu={() => router.push('/')} />
  }

  if (isAnimating) {
    return (
      <CustomizerEntryAnimation
        menuItemImageUrl={menuItem?.image_url ?? '/placeholder.png'}
        onAnimationComplete={() => setIsAnimating(false)}
      />
    )
  }

  return (
    <AnimatePresence>
      {!isExiting && (
        <CustomizerLayout
          ingredients={ingredients}
          currentIngredients={steps.currentIngredients}
          title={steps.currentTitle}
          currentStep={steps.currentStep}
          totalSteps={steps.totalSteps}
          onNext={steps.goNext}
          onBack={steps.goBack}
          canGoNext={steps.canGoNext}
          basePrice={menuItem?.base_price ?? 0}
          basePrepTime={menuItem?.base_prep_time ?? 0}
          onExit={() => handleExit('/')}
          onSaveToCart={handleSaveToCart}
          buttonText={editCartItemId ? 'Save Changes' : 'Add to Cart'}
        />
      )}
    </AnimatePresence>
  )
}

