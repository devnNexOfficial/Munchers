'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'

import { Package, Plus, SlidersHorizontal } from 'lucide-react'

import ProductFormDrawer from '../../../components/dashboard/ProductFormDrawer'
import { CategoryPillSkeleton, MenuCardSkeleton } from '../../../components/ui/Skeleton'
import { useToast } from '../../../components/ui/ToastNotification'
import useAuthStore from '../../../store/useAuthStore'
import { useMenuStore } from '../../../store/useMenuStore'
import type { Product } from '../../../types/menu'

export default function RestaurantMenuPage() {
  const user = useAuthStore((state) => state.user)
  const restaurantId = user?.id || 'muncherz-restaurant-id'
  const { success, error, warning } = useToast()

  const {
    categories,
    products,
    isLoadingMenu,
    activeCategory,
    setActiveCategory,
    fetchMenuData,
    createCategoryAction,
    toggleProductAvailabilityAction,
  } = useMenuStore()

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [newCatName, setNewCatName] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)

  // Fetch menu data on mount
  useEffect(() => {
    fetchMenuData(restaurantId)
  }, [fetchMenuData, restaurantId])

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return
    setAddingCategory(true)
    try {
      await createCategoryAction(newCatName.trim(), restaurantId)
      success(`Category "${newCatName.trim()}" created successfully.`)
      setNewCatName('')
    } catch (err) {
      console.error(err)
      error('Failed to create category. Please try again.')
    } finally {
      setAddingCategory(false)
    }
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsDrawerOpen(true)
  }

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setIsDrawerOpen(true)
  }

  const handleToggleAvailability = async (id: string, currentState: boolean) => {
    try {
      await toggleProductAvailabilityAction(id, !currentState)
      if (!currentState) {
        success('Product is now available on the menu.')
      } else {
        warning('Product marked as sold out.')
      }
    } catch (err) {
      console.error(err)
      error('Could not update product availability.')
    }
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
  }

  // Filter products by active category
  const filteredProducts = activeCategory
    ? products.filter((p) => p.category_id === activeCategory)
    : products

  return (
    <div className="space-y-8 text-white font-sans max-w-7xl mx-auto">
      {/* Dashboard Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-neutral-900 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-wide uppercase">Menu Management</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Build categories, manage product variants, and control real-time ordering availability.
          </p>
        </div>

        <button
          onClick={handleAddProduct}
          className="flex items-center justify-center space-x-2 bg-[#D62828] hover:bg-[#b52020] text-white px-5 py-3 rounded-lg text-sm font-bold shadow-[0_4px_12px_rgba(214,40,40,0.25)] transition-all cursor-pointer select-none"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Category Creation Control Line */}
      <div className="bg-[#121212] border border-neutral-800 rounded-xl p-5 space-y-4">
        <div>
          <h2 className="text-sm font-bold tracking-wide uppercase text-neutral-400">Category Controls</h2>
          <p className="text-[11px] text-neutral-500 mt-0.5">Quickly add a new category node to organize your menu items</p>
        </div>
        <form onSubmit={handleCreateCategory} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Category Name (e.g. Smash Burgers, Sides)"
            className="w-full sm:flex-1 bg-[#0A0A0A] border border-neutral-800 focus:border-[#F7B731] rounded-lg px-4 py-3 outline-none text-sm transition-all"
            disabled={addingCategory}
          />
          <button
            type="submit"
            disabled={addingCategory || !newCatName.trim()}
            className="w-full sm:w-auto bg-[#F7B731] hover:bg-[#e5a828] text-black font-extrabold text-xs tracking-wider uppercase px-6 py-3.5 rounded-lg shadow-[0_0_15px_rgba(247,183,49,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer"
          >
            {addingCategory ? 'Adding...' : 'Add Category'}
          </button>
        </form>
      </div>

      {/* Horizontal Category Navigation Tab Bar */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-neutral-400 text-xs font-bold uppercase tracking-wider px-1">
          <SlidersHorizontal className="w-4 h-4 text-[#F7B731]" />
          <span>Filter Categories</span>
        </div>
        
        {categories.length === 0 ? (
          <div className="text-sm text-neutral-500 px-1 italic">No categories created yet. Add one above.</div>
        ) : (
          <div className="flex items-center space-x-2 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer select-none ${
                activeCategory === null
                  ? 'bg-white text-black font-bold shadow-[0_4px_12px_rgba(255,255,255,0.15)]'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-extrabold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer select-none ${
                  activeCategory === cat.id
                    ? 'bg-[#F7B731] text-black shadow-[0_4px_12px_rgba(247,183,49,0.25)]'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loader — shimmer skeleton grid */}
      {isLoadingMenu && products.length === 0 ? (
        <div className="space-y-5">
          {/* Category pill skeletons */}
          <CategoryPillSkeleton />
          {/* Card skeletons grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <MenuCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        /* Empty State */
        <div className="bg-[#121212] border border-neutral-850 rounded-xl p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center mx-auto text-neutral-500">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No products found</h3>
            <p className="text-xs text-neutral-500 mt-1">
              There are no menu products assigned to this category node yet. Create a new one to get started.
            </p>
          </div>
          <button
            onClick={handleAddProduct}
            className="inline-flex items-center space-x-2 bg-[#D62828] hover:bg-[#b52020] text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all select-none cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Product</span>
          </button>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-[#121212] border border-neutral-800 rounded-xl overflow-hidden p-5 flex flex-col justify-between hover:border-neutral-700 transition-all group"
            >
              {/* Product Info Block */}
              <div className="space-y-4">
                {/* Image or brand placeholder */}
                <div className="relative h-44 w-full rounded-lg bg-[#0A0A0A] overflow-hidden flex items-center justify-center border border-neutral-900">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Package className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
                      <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider">No Photo</span>
                    </div>
                  )}

                  {/* Discount Badge */}
                  {product.show_discount && product.discount_price && (
                    <div className="absolute top-2 left-2 bg-[#D62828] text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shadow">
                      Promo Price
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-extrabold text-base tracking-wide text-white leading-tight">{product.name}</h3>
                    <div className="text-right">
                      {product.show_discount && product.discount_price ? (
                        <>
                          <div className="text-xs text-neutral-500 line-through">Rs. {product.base_price}</div>
                          <div className="text-[#F7B731] font-mono text-sm font-bold">Rs. {product.discount_price}</div>
                        </>
                      ) : (
                        <div className="text-[#F7B731] font-mono text-sm font-bold">Rs. {product.base_price}</div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-neutral-400 line-clamp-2 min-h-[2rem] leading-relaxed">
                    {product.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Action and status bottom line */}
              <div className="mt-5 pt-4 border-t border-neutral-900 flex items-center justify-between gap-4">
                {/* Active Availability interactive Switch */}
                <div className="flex items-center space-x-2.5">
                  <button
                    onClick={() => handleToggleAvailability(product.id, product.is_available)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      product.is_available ? 'bg-[#22C55E]' : 'bg-neutral-800'
                    }`}
                    aria-label={product.is_available ? 'Mark as sold out' : 'Mark as available'}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        product.is_available ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    product.is_available ? 'text-[#22C55E]' : 'text-neutral-500'
                  }`}>
                    {product.is_available ? 'Available' : 'Sold Out'}
                  </span>
                </div>

                {/* Edit Button CTA */}
                <button
                  onClick={() => handleEditProduct(product)}
                  className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 hover:text-white px-3 py-2 rounded-lg text-xs font-bold transition-all select-none cursor-pointer"
                >
                  Edit Item
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Drawer */}
      <ProductFormDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        product={selectedProduct}
      />
    </div>
  )
}
