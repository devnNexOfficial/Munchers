'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { AnimatePresence,motion } from 'framer-motion'
import { Plus, Trash2,X } from 'lucide-react'

import { useMenuStore } from '../../store/useMenuStore'
import { type Product, type ProductFormData, productFormSchema, type ProductVariant } from '../../types/menu'
// @ts-expect-error: ZodResolver has package exports resolution issues in strict ESM modes
import { zodResolver } from '@hookform/resolvers/zod'

interface ProductFormDrawerProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null // Null means creating a new item
}

export default function ProductFormDrawer({ isOpen, onClose, product }: ProductFormDrawerProps) {
  const { categories, upsertProductAction } = useMenuStore()
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [newVarName, setNewVarName] = useState('')
  const [newVarPrice, setNewVarPrice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      base_price: 0,
      category_id: '',
      description: '',
      image_url: '',
      is_available: true,
    },
  })

  // Synchronize when product opens
  useEffect(() => {
    if (isOpen) {
      if (product) {
        reset({
          name: product.name,
          base_price: product.base_price,
          category_id: product.category_id,
          description: product.description || '',
          image_url: product.image_url || '',
          is_available: product.is_available,
        })
        setVariants(product.variants || [])
      } else {
        reset({
          name: '',
          base_price: 0,
          category_id: categories[0]?.id || '',
          description: '',
          image_url: '',
          is_available: true,
        })
        setVariants([])
      }
      setErrorMsg(null)
    }
  }, [isOpen, product, reset, categories])

  const addVariant = () => {
    if (!newVarName || !newVarPrice) return
    const price = Number(newVarPrice)
    if (isNaN(price) || price < 0) return

    const newVar: ProductVariant = {
      id: crypto.randomUUID(),
      name: newVarName,
      price_override: price,
    }

    setVariants([...variants, newVar])
    setNewVarName('')
    setNewVarPrice('')
  }

  const removeVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id))
  }

  const onSubmit = async (data: ProductFormData) => {
    setSubmitting(true)
    setErrorMsg(null)
    try {
      await upsertProductAction({
        ...data,
        id: product?.id,
        variants,
      })
      onClose()
    } catch (err) {
      console.error('Error saving product:', err)
      setErrorMsg((err as Error).message || 'Failed to save product. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
          />

          {/* Drawer Container Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-[#111111] border-l border-neutral-800 shadow-2xl z-[101] flex flex-col text-white font-sans"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-neutral-900 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-wide">
                  {product ? 'Edit Menu Product' : 'Add New Menu Product'}
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  {product ? 'Modify details and variations' : 'Setup core features and options'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
              {errorMsg && (
                <div className="p-4 bg-red-950/40 border border-red-900/60 text-red-300 text-sm rounded-lg">
                  {errorMsg}
                </div>
              )}

              {/* Title Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Product Title
                </label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="e.g. Double Stack Melt Burger"
                  className="w-full bg-[#0A0A0A] border border-neutral-800 focus:border-[#F7B731] rounded-lg px-4 py-3 outline-none text-sm text-white transition-all"
                />
                {errors.name && <p className="text-xs text-[#FF6B6B]">{errors.name.message}</p>}
              </div>

              {/* Base Valuation Price */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Base Price (Rs.)
                </label>
                <input
                  type="number"
                  {...register('base_price')}
                  placeholder="e.g. 750"
                  className="w-full bg-[#0A0A0A] border border-neutral-800 focus:border-[#F7B731] rounded-lg px-4 py-3 outline-none text-sm text-white transition-all"
                />
                {errors.base_price && <p className="text-xs text-[#FF6B6B]">{errors.base_price.message}</p>}
              </div>

              {/* Target Category Select */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Menu Category Node
                </label>
                <select
                  {...register('category_id')}
                  className="w-full bg-[#0A0A0A] border border-neutral-800 focus:border-[#F7B731] rounded-lg px-4 py-3 outline-none text-sm text-white transition-all"
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && <p className="text-xs text-[#FF6B6B]">{errors.category_id.message}</p>}
              </div>

              {/* Description box */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Describe ingredients, tastes, or allergens..."
                  className="w-full bg-[#0A0A0A] border border-neutral-800 focus:border-[#F7B731] rounded-lg px-4 py-3 outline-none text-sm text-white transition-all resize-none"
                />
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Product Image URL
                </label>
                <input
                  type="text"
                  {...register('image_url')}
                  placeholder="e.g. https://images.unsplash.com/... or /images/..."
                  className="w-full bg-[#0A0A0A] border border-neutral-800 focus:border-[#F7B731] rounded-lg px-4 py-3 outline-none text-sm text-white transition-all"
                />
                {errors.image_url && <p className="text-xs text-[#FF6B6B]">{errors.image_url.message}</p>}
              </div>

              {/* Size Variants / Options Section */}
              <div className="space-y-4 pt-4 border-t border-neutral-900">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Product Variations (Optional)</h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Define custom sizes (e.g. Single, Double) and override values</p>
                </div>

                {/* List of existing variants */}
                {variants.length > 0 && (
                  <div className="space-y-2 bg-[#0A0A0A] border border-neutral-900 p-3 rounded-lg">
                    {variants.map((v) => (
                      <div key={v.id} className="flex items-center justify-between text-sm py-1.5 border-b border-neutral-900/60 last:border-b-0">
                        <span className="font-semibold text-neutral-300">{v.name}</span>
                        <div className="flex items-center space-x-3">
                          <span className="text-[#F7B731] font-mono text-xs">Rs. {v.price_override}</span>
                          <button
                            type="button"
                            onClick={() => removeVariant(v.id)}
                            className="text-neutral-500 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Variant Formlet */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newVarName}
                    onChange={(e) => setNewVarName(e.target.value)}
                    placeholder="Variant Name (e.g. Double)"
                    className="flex-1 bg-[#0A0A0A] border border-neutral-850 focus:border-[#F7B731] rounded-lg px-3 py-2 outline-none text-xs text-white"
                  />
                  <input
                    type="number"
                    value={newVarPrice}
                    onChange={(e) => setNewVarPrice(e.target.value)}
                    placeholder="Price Override (Rs.)"
                    className="w-32 bg-[#0A0A0A] border border-neutral-850 focus:border-[#F7B731] rounded-lg px-3 py-2 outline-none text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={addVariant}
                    className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[#F7B731] p-2 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Availability checkbox */}
              <div className="flex items-center space-x-3 pt-4 border-t border-neutral-900">
                <input
                  type="checkbox"
                  id="is_available_chk"
                  {...register('is_available')}
                  className="w-4 h-4 rounded bg-[#0A0A0A] border border-neutral-800 checked:bg-[#D62828] text-[#D62828] focus:ring-0 outline-none cursor-pointer"
                />
                <label htmlFor="is_available_chk" className="text-sm font-semibold text-neutral-300 cursor-pointer select-none">
                  Mark product as available for purchase instantly
                </label>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-6 border-t border-neutral-900 flex items-center space-x-3 sticky bottom-0 bg-[#111111] pb-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white py-3 rounded-lg text-sm font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#D62828] hover:bg-[#b52020] text-white py-3 rounded-lg text-sm font-bold shadow-[0_4px_12px_rgba(214,40,40,0.25)] transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving Item...' : 'Save Product'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
