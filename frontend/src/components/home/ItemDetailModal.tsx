'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

import { useCartStore } from '@/store/useCartStore'

import type { MenuItem, MenuItemSizeVariant } from '@/lib/queries/home'
import { ItemDetailPricing } from './ItemDetailPricing'

interface ItemDetailModalProps {
  item: MenuItem | null
  isOpen: boolean
  onClose: () => void
  isRestaurantClosed: boolean
}

const itemPlaceholder =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"%3E%3Crect width="640" height="360" fill="%23FAFAFA"/%3E%3Ccircle cx="320" cy="180" r="104" fill="%23fff" stroke="%23F1F1F1" stroke-width="10"/%3E%3Cpath d="M214 198h212c-5 48-42 80-106 80s-101-32-106-80Zm26-45c15-57 45-93 80-93s65 36 80 93H240Z" fill="%23D62828"/%3E%3C/svg%3E'

function formatPrice(price: number) {
  return `Rs. ${Math.round(price)}`
}

function getVariants(item: MenuItem | null): MenuItemSizeVariant[] {
  return item?.size_variants?.filter((variant) => variant.label && variant.price > 0) ?? []
}

function getCookingOptions(item: MenuItem | null): string[] {
  return item?.cooking_preference_options?.filter(Boolean) ?? []
}

export function ItemDetailModal({
  item,
  isOpen,
  onClose,
  isRestaurantClosed,
}: ItemDetailModalProps) {
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)
  const variants = useMemo(() => getVariants(item), [item])
  const cookingOptions = useMemo(() => getCookingOptions(item), [item])
  const [selectedSize, setSelectedSize] = useState<MenuItemSizeVariant | null>(null)
  const [selectedCookingPreference, setSelectedCookingPreference] = useState('')

  useEffect(() => {
    setSelectedSize(variants[0] ?? null)
    setSelectedCookingPreference(cookingOptions[0] ?? '')
  }, [item?.id, variants, cookingOptions])

  if (!item) return null

  const activeItem = item
  const hasVariants = variants.length > 0
  const hasCookingOptions = cookingOptions.length > 0
  const displayedPrice = selectedSize?.price ?? activeItem.base_price
  const hasDiscount =
    !hasVariants && activeItem.show_discount && activeItem.discount_price !== null
  const disabledClass = isRestaurantClosed
    ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
    : ''
  const redDisabledClass = isRestaurantClosed
    ? 'cursor-not-allowed border-gray-200 bg-gray-200 text-gray-400'
    : ''

  function handleAction(action: 'add-standard' | 'customize') {
    if (isRestaurantClosed) return

    if (action === 'customize') {
      onClose()
      router.push(`/customize?itemId=${activeItem.id}`)
      return
    }

    addItem({
      cartItemId: crypto.randomUUID(),
      menuItemId: activeItem.id,
      name: activeItem.name_en,
      imageUrl: activeItem.image_url ?? '',
      basePrice: selectedSize?.price ?? activeItem.base_price,
      selections: [],
      mealOptions: [],
      totalPrice: selectedSize?.price ?? activeItem.base_price,
      quantity: 1,
      specialInstructions: '',
    })
    onClose()
    router.push('/cart')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end bg-black/55 backdrop-blur-sm md:items-center md:justify-center md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="item-detail-title"
            className="max-h-[96svh] w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl md:max-h-[90vh] md:max-w-2xl md:rounded-3xl"
            initial={{ y: '100%', opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: '100%', opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.26, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="max-h-[96svh] overflow-y-auto md:max-h-[90vh]">
              <div className="relative aspect-video bg-gray-50">
                <Image
                  src={activeItem.image_url ?? itemPlaceholder}
                  alt={activeItem.name_en}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 672px"
                  unoptimized={!activeItem.image_url}
                  className="object-cover"
                />
                <button
                  type="button"
                  aria-label="Close item detail"
                  onClick={onClose}
                  className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-muncherz-black shadow-lg transition hover:bg-white active:scale-95"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                <div className="space-y-2">
                  <h2 id="item-detail-title" className="text-2xl font-black text-muncherz-black">
                    {activeItem.name_en}
                  </h2>
                  {activeItem.description_en && (
                    <p className="text-sm leading-6 text-gray-600">
                      {activeItem.description_en}
                    </p>
                  )}
                </div>

                <ItemDetailPricing
                  hasDiscount={hasDiscount}
                  basePrice={activeItem.base_price}
                  discountPrice={activeItem.discount_price}
                  displayedPrice={displayedPrice}
                  hasVariants={hasVariants}
                  variants={variants}
                  selectedSize={selectedSize}
                  onSelectSize={setSelectedSize}
                  hasCookingOptions={hasCookingOptions}
                  cookingOptions={cookingOptions}
                  selectedCookingPreference={selectedCookingPreference}
                  onSelectCookingPreference={setSelectedCookingPreference}
                />

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isRestaurantClosed}
                    onClick={() => handleAction('add-standard')}
                    className={`rounded-xl border border-muncherz-red bg-white px-4 py-3 text-sm font-black text-muncherz-red transition active:scale-95 ${disabledClass}`}
                  >
                    Add Standard
                  </button>
                  <button
                    type="button"
                    disabled={isRestaurantClosed}
                    onClick={() => handleAction('customize')}
                    className={`rounded-xl border border-muncherz-red bg-muncherz-red px-4 py-3 text-sm font-black text-white transition active:scale-95 ${redDisabledClass}`}
                  >
                    Customize
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
