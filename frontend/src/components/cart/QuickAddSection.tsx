'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

import { motion } from 'framer-motion'

import { createClient } from '@/lib/supabase/client'
import type { CartItem } from '@/store/useCartStore'
import { useCartStore } from '@/store/useCartStore'

interface QuickAddCard {
  id: string
  title: string
  subtitle: string
  imageUrl: string | null
  price: number
  actionLabel: string
  items: CartItem[]
}

interface SavedCreationRow {
  id: string
  name: string
  menu_item_id: string | null
  last_price: number | string | null
}

interface OrderRow {
  id: string
  order_number: string | null
  total: number | string | null
  items: unknown
}

const placeholder =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120"%3E%3Crect width="160" height="120" fill="%23FAFAFA"/%3E%3Ccircle cx="80" cy="60" r="34" fill="%23D62828"/%3E%3C/svg%3E'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toNumber(value: unknown) {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number(value)
  return 0
}

function makeCartItem(title: string, menuItemId: string, price: number): CartItem {
  return {
    cartItemId: crypto.randomUUID(),
    menuItemId,
    name: title,
    imageUrl: '',
    basePrice: price,
    selections: [],
    mealOptions: [],
    totalPrice: price,
    quantity: 1,
    specialInstructions: '',
  }
}

function readString(record: Record<string, unknown>, key: string, fallback: string) {
  return typeof record[key] === 'string' ? record[key] : fallback
}

function readCartItemsFromOrder(row: OrderRow) {
  if (!Array.isArray(row.items)) return [makeCartItem(row.order_number ?? 'Previous order', row.id, toNumber(row.total))]

  const items = row.items.reduce<CartItem[]>((cartItems, item, index) => {
    if (!isRecord(item)) return cartItems

    const title = readString(item, 'menu_item_name', readString(item, 'name', `Item ${index + 1}`))
    const menuItemId = readString(item, 'menu_item_id', `${row.id}-${index}`)
    const price = toNumber(item.item_total ?? item.totalPrice ?? item.total)
    const quantity = Math.max(1, toNumber(item.quantity) || 1)

    cartItems.push({ ...makeCartItem(title, menuItemId, price), quantity })
    return cartItems
  }, [])

  return items.length > 0 ? items : [makeCartItem(row.order_number ?? 'Previous order', row.id, toNumber(row.total))]
}

function readOrderSummary(items: unknown) {
  if (!Array.isArray(items) || items.length === 0) return 'Previous order'
  return items
    .slice(0, 2)
    .map((item) => (isRecord(item) && typeof item.name === 'string' ? item.name : 'Item'))
    .join(' + ')
}

function QuickRow({ title, cards }: { title: string; cards: QuickAddCard[] }) {
  const addItem = useCartStore((state) => state.addItem)
  if (cards.length === 0) return null

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-black text-muncherz-black">{title}</h2>
      <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-1">
        {cards.map((card) => (
          <motion.article
            key={card.id}
            layout
            className="w-52 shrink-0 rounded-xl bg-white p-3 shadow-sm"
          >
            <div className="relative h-24 overflow-hidden rounded-lg bg-muncherz-white">
              <Image
                src={card.imageUrl ?? placeholder}
                alt={card.title}
                fill
                sizes="208px"
                unoptimized={!card.imageUrl}
                className="object-cover"
              />
            </div>
            <h3 className="mt-3 truncate text-sm font-black text-muncherz-black">{card.title}</h3>
            <p className="mt-1 truncate text-xs font-bold text-gray-500">{card.subtitle}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-black text-muncherz-red">Rs. {Math.round(card.price)}</span>
              <button
                type="button"
                onClick={() => card.items.forEach((item) => addItem({ ...item, cartItemId: crypto.randomUUID() }))}
                className="rounded-full bg-muncherz-red px-4 py-2 text-xs font-black text-white"
              >
                {card.actionLabel}
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

export function QuickAddSection() {
  const [savedCreations, setSavedCreations] = useState<QuickAddCard[]>([])
  const [recentOrders, setRecentOrders] = useState<QuickAddCard[]>([])

  useEffect(() => {
    async function fetchQuickAdds() {
      const supabase = createClient()
      const { data: authData } = await supabase.auth.getUser()
      const userId = authData.user?.id
      if (!userId) return

      // TODO: wire to real data — backend Section 2
      const { data: creations } = await supabase
        .from('saved_creations')
        .select('id, name, menu_item_id, last_price')
        .eq('user_id', userId)
        .limit(8)

      const savedRows = (creations ?? []) as SavedCreationRow[]
      setSavedCreations(
        savedRows.map((row) => {
          const price = toNumber(row.last_price)
          return {
            id: row.id,
            title: row.name,
            subtitle: 'Saved creation',
            imageUrl: null,
            price,
            actionLabel: 'Add',
            items: [makeCartItem(row.name, row.menu_item_id ?? row.id, price)],
          }
        })
      )

      // TODO: wire to real data — backend Section 2
      const { data: orders } = await supabase
        .from('orders')
        .select('id, order_number, total, items')
        .eq('user_id', userId)
        .eq('status', 'delivered')
        .order('created_at', { ascending: false })
        .limit(3)

      const orderRows = (orders ?? []) as OrderRow[]
      setRecentOrders(
        orderRows.map((row) => {
          const price = toNumber(row.total)
          const title = row.order_number ?? 'Previous order'
          return {
            id: row.id,
            title,
            subtitle: readOrderSummary(row.items),
            imageUrl: null,
            price,
            actionLabel: 'Reorder',
            items: readCartItemsFromOrder(row),
          }
        })
      )
    }

    fetchQuickAdds()
  }, [])

  if (savedCreations.length === 0 && recentOrders.length === 0) return null

  return (
    <div className="space-y-5">
      <QuickRow title="Saved Creations" cards={savedCreations} />
      <QuickRow title="Order Again" cards={recentOrders} />
    </div>
  )
}
