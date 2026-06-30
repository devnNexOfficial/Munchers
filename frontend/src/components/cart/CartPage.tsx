'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { MealSelector } from '@/components/customizer/MealSelector'
import type { SelectedMealOption } from '@/hooks/useMealSelector'
import { useMealSelector } from '@/hooks/useMealSelector'
import { createClient } from '@/lib/supabase/client'
import type { CartItem } from '@/store/useCartStore'
import { useCartStore } from '@/store/useCartStore'

import { CartLineItem } from './CartLineItem'
import { QuickAddSection } from './QuickAddSection'

const logoPlaceholder =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220"%3E%3Crect width="220" height="220" rx="44" fill="%23D62828"/%3E%3Ccircle cx="110" cy="110" r="62" fill="%23F7B731"/%3E%3Cpath d="M70 124h80c-6 24-21 38-40 38s-34-14-40-38Zm12-26c9-26 18-40 28-40s20 14 28 40H82Z" fill="%230A0A0A"/%3E%3C/svg%3E'

function formatPrice(price: number) {
  return `Rs. ${Math.round(price)}`
}

export function CartPage() {
  const router = useRouter()
  const cartItems = useCartStore((state) => state.cartItems)
  const subtotal = useCartStore((state) => state.getSubtotal())
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const addMealToItem = useCartStore((state) => state.addMealToItem)
  const mealSelector = useMealSelector()
  const [minimumOrder, setMinimumOrder] = useState(0)
  const [activeMealCartItemId, setActiveMealCartItemId] = useState<string | null>(null)
  const remaining = Math.max(0, minimumOrder - subtotal)
  const canCheckout = cartItems.length > 0 && remaining === 0

  useEffect(() => {
    async function fetchMinimumOrder() {
      const supabase = createClient()
      const { data } = await supabase
        .from('restaurant_settings')
        .select('min_order_amount')
        .limit(1)
        .maybeSingle()

      const minOrder = data as { min_order_amount: number | string | null } | null
      setMinimumOrder(Number(minOrder?.min_order_amount ?? 0))
    }

    fetchMinimumOrder()
  }, [])

  function handleEditMeal(item: CartItem) {
    setActiveMealCartItemId(item.cartItemId)
    mealSelector.openMealSelector({ id: item.menuItemId, name: item.name })
  }

  function handleMealSelected(selectedOptions: SelectedMealOption[]) {
    if (activeMealCartItemId) addMealToItem(activeMealCartItemId, selectedOptions)
    mealSelector.setSelectedOptions(selectedOptions)
    setActiveMealCartItemId(null)
  }

  function handleMealSkipped() {
    mealSelector.setSelectedOptions([])
    setActiveMealCartItemId(null)
  }

  if (cartItems.length === 0) {
    return (
      <main className="relative grid min-h-screen place-items-center bg-wild-black p-6">
        {/* Noise texture overlay */}
        <div className="noise-overlay absolute inset-0" />

        <div className="relative z-10 max-w-sm text-center">
          <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-wild-card">
            <Image src={logoPlaceholder} alt="Muncherz logo" fill sizes="96px" unoptimized />
          </div>
          <h1 className="font-display mt-5 text-2xl font-black text-wild-paper">Your cart is empty</h1>
          <p className="font-body mt-2 text-sm font-bold text-wild-paper/60">Fresh builds are waiting on the menu.</p>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="btn-primary mt-6"
          >
            Browse Menu
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen bg-wild-black p-4 sm:p-6">
      {/* Noise texture overlay */}
      <div className="noise-overlay absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-3xl space-y-4">
        <h1 className="font-display text-3xl font-black text-wild-paper">Your Cart</h1>
        <QuickAddSection />
        {cartItems.map((item) => (
          <CartLineItem
            key={item.cartItemId}
            item={item}
            onRemove={removeItem}
            onQtyChange={updateQuantity}
            onEditMeal={handleEditMeal}
          />
        ))}
        <section className="relative rounded-wild-card bg-wild-brown border border-wild-rust p-4 shadow-wild-ember overflow-hidden">
          {/* Noise texture overlay */}
          <div className="noise-overlay absolute inset-0" />

          <div className="relative z-10">
            <div className="flex items-center justify-between text-lg font-black">
              <span className="font-display text-wild-paper">Subtotal</span>
              <span className="price-tag">{formatPrice(subtotal)}</span>
            </div>
            {remaining > 0 && (
              <p className="mt-2 text-sm font-bold text-wild-paper/60">
                Add {formatPrice(remaining)} more to place order
              </p>
            )}
            <button
              type="button"
              disabled={!canCheckout}
              onClick={() => router.push('/checkout')}
              className="btn-primary mt-4 w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed to Checkout
            </button>
          </div>
        </section>
      </div>
      <MealSelector
        isOpen={mealSelector.isOpen}
        onClose={mealSelector.closeMealSelector}
        mealOptions={mealSelector.mealOptions}
        baseItemName={mealSelector.activeItem?.name ?? 'Meal'}
        onAddMeal={handleMealSelected}
        onSkip={handleMealSkipped}
      />
    </main>
  )
}
