'use client'

/**
 * STORE: useOrderStore
 * PURPOSE:   Tracks the single active order during the delivery flow.
 *            Used by OrderTrackerPage and GlobalOrderTimer to stay in sync.
 * DEPENDENCIES: OrderStatus enum (types/enums.ts)
 * SIDE EFFECTS: None — pure in-memory state, no persistence.
 * PERFORMANCE: Zustand selectors prevent unnecessary re-renders.
 *              Components should select only the fields they need.
 */

import { create } from 'zustand'

import { OrderStatus } from '@/types/enums'

// Re-export for backwards compatibility — components that imported OrderStatus
// from this file will continue to work without changes.
export { OrderStatus }

interface OrderState {
  /** The Supabase UUID of the currently tracked order, or null if none */
  activeOrderId: string | null
  /** The current lifecycle status of the active order */
  activeOrderStatus: OrderStatus | null
  /**
   * ISO 8601 timestamp of when the order is estimated to be ready.
   * Used by GlobalOrderTimer to compute the countdown.
   */
  estimatedReadyAt: string | null

  /**
   * Sets the active order and initialises the countdown timer.
   *
   * @param orderId         - Supabase UUID of the order
   * @param status          - Current order lifecycle status
   * @param estimatedReadyAt - ISO timestamp, or null if not yet estimated
   */
  setActiveOrder: (
    orderId: string,
    status: OrderStatus,
    estimatedReadyAt: string | null
  ) => void

  /**
   * Clears the active order — called after delivery or cancellation.
   * Hides the GlobalOrderTimer from the app shell.
   */
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
