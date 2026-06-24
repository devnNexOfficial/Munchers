'use client'

/**
 * COMPONENT: CustomizerPageClient
 * PURPOSE:   Top-level client component for the /customize route. Orchestrates
 *            the full customizer flow: entry animation → canvas + panels → cart.
 * DEPENDENCIES:
 *   - useCustomizerStore (selections, loadSelections, resetCustomizer)
 *   - useCartStore (addItem, updateItem, cartItems)
 *   - useCustomizerSteps (step navigation)
 *   - BurgerCanvas, IngredientPanel, SummaryList, CustomizerEntryAnimation
 * SIDE EFFECTS:
 *   - Fetches ingredient data from /api/customizer/ingredients on mount
 *   - Clears customizer store on unmount via resetCustomizer
 *   - One setTimeout for exit animation (cleaned up on unmount)
 * PERFORMANCE:
 *   - handleExit and handleSaveToCart wrapped in useCallback (stable refs)
 *   - ingredients stored typed — no `any` usage
 *
 * OPEN/CLOSED (Canvas Registry): This component passes `ingredients` to BurgerCanvas.
 *   The canvas registry pattern lives in the parent page.tsx — this component
 *   always renders BurgerCanvas directly (customize/page.tsx handles routing).
 */

import { useCallback, useEffect, useRef, useState } from 'react'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

import type { CustomizerIngredient } from '@/lib/layerConfig'
import type { MenuItem } from '@/lib/queries/home'
import { useCustomizerStore } from '@/store/useCustomizerStore'
import { useCartStore } from '@/store/useCartStore'
import { useCustomizerSteps } from '@/hooks/useCustomizerSteps'
import { CUSTOMIZER_EXIT_DURATION_MS } from '@/lib/constants'

import { CustomizerEntryAnimation } from './CustomizerEntryAnimation'
import { BurgerCanvas } from './BurgerCanvas'
import { IngredientPanel } from './IngredientPanel'
import { SummaryList } from './SummaryList'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface CustomizerPageClientProps {
  /** The menu item UUID being customized */
  itemId: string
  /**
   * If set, the customizer is in edit mode — pre-loads selections from this cart item.
   * The "Add to Cart" button becomes "Save Changes".
   */
  editCartItemId?: string
}

export function CustomizerPageClient({ itemId, editCartItemId }: CustomizerPageClientProps) {
  const router = useRouter()
  const [ingredients, setIngredients] = useState<CustomizerIngredient[]>([])
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null)
  const [isAnimating, setIsAnimating] = useState(true)
  const [isExiting, setIsExiting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Ref to hold the exit timer so we can clean it up on unmount
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const steps = useCustomizerSteps(ingredients)

  // Fetch ingredient data for this menu item
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

        // Edit mode: restore previous selections from the cart item
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

  // Cleanup exit timer on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current)
      }
    }
  }, [])

  /**
   * Triggers the exit fade animation, then navigates to the target path.
   * useCallback: stable reference prevents unnecessary child re-renders.
   */
  const handleExit = useCallback((path: string = '/'): void => {
    setIsExiting(true)
    // Wait for the fade-out animation before navigating away
    exitTimerRef.current = setTimeout(() => {
      router.push(path)
    }, CUSTOMIZER_EXIT_DURATION_MS)
  }, [router])

  /**
   * Saves the current customization to the cart (or updates an existing cart item).
   * Client price is included as an estimate — the server re-validates on checkout.
   * useCallback: stable reference prevents SummaryList re-renders.
   */
  const handleSaveToCart = useCallback((): void => {
    const { selections } = useCustomizerStore.getState()
    const selectionsArray = Object.values(selections)
    const basePrice = menuItem?.base_price ?? 0
    const estimatedTotal = useCustomizerStore.getState().calculateSubtotal(basePrice, ingredients)

    if (editCartItemId) {
      // Edit mode: find the existing cart item to preserve its meal price
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
          // Preserve existing meal price by adding it to the new base total
          totalPrice: estimatedTotal + mealTotal,
        })
      }
    } else {
      // New item: add fresh to cart
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

  // 404 / not found state
  if (ingredients.length === 0 && !menuItem) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-muncherz-black text-white">
        <p className="text-lg font-black">Item not found 😕</p>
        <button
          onClick={() => router.push('/')}
          className="rounded-xl bg-muncherz-red px-6 py-3 text-sm font-black"
        >
          Back to Menu
        </button>
      </div>
    )
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
        <motion.div
          key="customizer-layout"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          // bg-[#0A0A0A] is correct here — this is the full customizer split-screen background
          className="flex h-screen w-full flex-row overflow-hidden bg-[#0A0A0A]"
        >
          {/* Left panel: ingredient navigation */}
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

          {/* Center: canvas + exit button */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <BurgerCanvas ingredients={ingredients} />
            <button
              onClick={() => handleExit('/')}
              className="absolute top-4 left-4 z-50 rounded bg-white px-4 py-2 text-sm font-bold text-black"
            >
              Exit Customizer
            </button>
          </div>

          {/* Right panel: summary + add to cart */}
          <div className="w-1/4 h-full border-l">
            <SummaryList
              ingredients={ingredients}
              basePrice={menuItem?.base_price ?? 0}
              basePrepTime={menuItem?.base_prep_time ?? 0}
              onAddToCart={handleSaveToCart}
              buttonText={editCartItemId ? 'Save Changes' : 'Add to Cart'}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
