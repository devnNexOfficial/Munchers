'use client'

import { create } from 'zustand'

export type OrderStatus =
  | 'received'
  | 'preparing'
  | 'ready'
  | 'dispatched'
  | 'delivered'
  | 'cancelled'

interface OrderState {
  activeOrderId: string | null
  activeOrderStatus: OrderStatus | null
  estimatedReadyAt: string | null
  setActiveOrder: (
    orderId: string,
    status: OrderStatus,
    estimatedReadyAt: string | null
  ) => void
  clearActiveOrder: () => void
}

export const useOrderStore = create<OrderState>((set) => ({
  activeOrderId: null,
  activeOrderStatus: null,
  estimatedReadyAt: null,

  setActiveOrder: (orderId, status, estimatedReadyAt) => {
    set({
      activeOrderId: orderId,
      activeOrderStatus: status,
      estimatedReadyAt,
    })
  },

  clearActiveOrder: () => {
    set({
      activeOrderId: null,
      activeOrderStatus: null,
      estimatedReadyAt: null,
    })
  },
}))
