'use client'

import { create } from 'zustand'

import { supabase } from '../lib/supabase'
import type { Order, OrderStatus } from '../types/orders'

export interface OrderState {
  orders: Order[]
  isOperationsLoading: boolean
  activeFilterStatus: OrderStatus | 'all'
  setActiveFilterStatus: (status: OrderStatus | 'all') => void
  loadRestaurantOrders: (restaurantId: string) => Promise<void>
  updateOrderStatusAction: (orderId: string, nextStatus: OrderStatus) => Promise<void>
  listenToLiveOrdersPipeline: (restaurantId: string) => () => void
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  isOperationsLoading: false,
  activeFilterStatus: 'all',

  setActiveFilterStatus: (status) => {
    set({ activeFilterStatus: status })
  },

  loadRestaurantOrders: async (restaurantId: string) => {
    set({ isOperationsLoading: true })
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      set({ orders: (data as Order[]) || [] })
    } catch (err) {
      console.error('Failed to load restaurant orders:', err)
    } finally {
      set({ isOperationsLoading: false })
    }
  },

  updateOrderStatusAction: async (orderId: string, nextStatus: OrderStatus) => {
    const previousOrders = get().orders

    // Optimistic UI Update
    set({
      orders: previousOrders.map((order) =>
        order.id === orderId ? { ...order, status: nextStatus } : order
      ),
    })

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: nextStatus })
        .eq('id', orderId)

      if (error) {
        throw error
      }
    } catch (err) {
      console.error(`Failed to update order status to ${nextStatus}:`, err)
      // Rollback on error
      set({ orders: previousOrders })
    }
  },

  listenToLiveOrdersPipeline: (restaurantId: string) => {
    const channel = supabase
      .channel(`live_restaurant_orders_${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload

          if (eventType === 'INSERT') {
            const insertedOrder = newRecord as Order
            set((state) => {
              // Prevent duplicates
              if (state.orders.some((o) => o.id === insertedOrder.id)) {
                return state
              }
              return { orders: [insertedOrder, ...state.orders] }
            })
          } else if (eventType === 'UPDATE') {
            const updatedOrder = newRecord as Order
            set((state) => ({
              orders: state.orders.map((o) =>
                o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o
              ),
            }))
          } else if (eventType === 'DELETE') {
            const deletedId = oldRecord.id
            set((state) => ({
              orders: state.orders.filter((o) => o.id !== deletedId),
            }))
          }
        }
      )
      .subscribe()

    // Return unsubscribe cleanup handler
    return () => {
      supabase.removeChannel(channel)
    }
  },
}))
