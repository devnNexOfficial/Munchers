'use client'

import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/useCartStore'

type SavedCreation = { id: string; name: string; menu_item_id: string; total_price: number; customizations: any }

export function SavedCreationsSection({ creations, setCreations }: { creations: SavedCreation[]; setCreations: any }) {
  const addToCart = useCartStore(state => state.addItem)

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('saved_creations').delete().eq('id', id)
    setCreations(creations.filter((c: SavedCreation) => c.id !== id))
  }

  function handleReAddToCart(creation: SavedCreation) {
    addToCart({
      cartItemId: `readd-${Date.now()}`,
      menuItemId: creation.menu_item_id,
      name: creation.name,
      imageUrl: '/placeholder.png', 
      basePrice: creation.total_price, 
      totalPrice: creation.total_price, 
      quantity: 1,
      selections: creation.customizations || [],
      mealOptions: [],
      specialInstructions: ''
    })
    alert("Creation added to cart! (Price verified against current rates)")
  }

  return (
    <section>
      <h3 className="mb-4 text-lg font-black text-muncherz-black">Saved Creations</h3>
      {creations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
          No saved creations yet
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {creations.map((c: SavedCreation) => (
            <div key={c.id} className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm">
              <button 
                onClick={() => handleDelete(c.id)}
                className="absolute right-2 top-2 rounded-full bg-gray-100 p-1.5 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="mb-2 h-20 w-full rounded-xl bg-gray-50" /> 
              <h4 className="truncate text-sm font-bold text-gray-900">{c.name}</h4>
              <p className="mb-3 text-xs font-bold text-muncherz-red">Rs. {c.total_price}</p>
              <button 
                onClick={() => handleReAddToCart(c)}
                className="w-full rounded-xl bg-muncherz-black py-2 text-xs font-bold text-white transition hover:bg-gray-800"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
