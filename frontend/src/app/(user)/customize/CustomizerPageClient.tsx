'use client'

import { useCallback, useEffect, useState } from 'react'

import { useSearchParams } from 'next/navigation'

import BurgerCanvas from '@/components/customizer/BurgerCanvas'
import CustomizerEntryAnimation from '@/components/customizer/CustomizerEntryAnimation'
import type { Ingredient } from '@/components/customizer/BurgerCanvas'

interface CustomizerIngredientsResponse {
  ingredients?: Ingredient[]
  menuItemImageUrl?: string
  imageUrl?: string
  menuItem?: {
    imageUrl?: string
  }
}

const placeholderImage =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 900%22%3E%3Crect width=%221200%22 height=%22900%22 fill=%22%230A0A0A%22/%3E%3Ccircle cx=%22600%22 cy=%22450%22 r=%22200%22 fill=%22%23F7B731%22/%3E%3C/svg%3E'

function parseCustomizerResponse(payload: unknown): CustomizerIngredientsResponse {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {}
  }

  return payload as CustomizerIngredientsResponse
}

export default function CustomizerPageClient() {
  const searchParams = useSearchParams()
  const menuItemId = searchParams.get('menuItemId') ?? ''
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [menuItemImageUrl, setMenuItemImageUrl] = useState(placeholderImage)
  const [isLoading, setIsLoading] = useState(true)
  const [showCustomizer, setShowCustomizer] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchIngredients() {
      setIsLoading(true)

      if (!menuItemId) {
        return
      }

      try {
        // TODO: wire to real API - backend Section 2 Task 3
        const response = await fetch(
          `/api/customizer/ingredients?itemId=${encodeURIComponent(menuItemId)}`,
          { signal: controller.signal }
        )

        if (response.status === 404 || !response.ok) {
          return
        }

        const parsed = parseCustomizerResponse(await response.json())
        setIngredients(parsed.ingredients ?? [])
        setMenuItemImageUrl(
          parsed.menuItemImageUrl ?? parsed.imageUrl ?? parsed.menuItem?.imageUrl ?? placeholderImage
        )
      } catch {
        if (!controller.signal.aborted) {
          setIngredients([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void fetchIngredients()

    return () => controller.abort()
  }, [menuItemId])

  const handleAnimationComplete = useCallback(() => {
    setShowCustomizer(true)
  }, [])

  if (!showCustomizer) {
    return (
      <main className="min-h-screen bg-white">
        <CustomizerEntryAnimation
          menuItemImageUrl={menuItemImageUrl}
          onAnimationComplete={handleAnimationComplete}
        />
        {isLoading ? (
          <div className="fixed inset-0 flex items-end justify-center p-6 text-sm text-white/70">
            Loading...
          </div>
        ) : null}
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-row bg-white">
      <aside className="flex w-1/4 items-center justify-center p-6 text-center text-sm font-medium text-neutral-700">
        Ingredient Panels - Section 8
      </aside>
      <section className="flex flex-1 items-center justify-center bg-[#0A0A0A] p-6">
        <BurgerCanvas ingredients={[]} />
      </section>
      <aside className="flex w-1/4 items-center justify-center p-6 text-center text-sm font-medium text-neutral-700">
        Summary List - Section 8
      </aside>
    </main>
  )
}
