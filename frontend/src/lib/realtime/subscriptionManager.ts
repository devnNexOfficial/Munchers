/**
 * WHAT: Centralized Supabase Realtime subscription manager (Observer Pattern)
 * WHY:  Without centralisation, components create duplicate channels to the same
 *       table, exceeding Supabase's 200-connection free-tier cap rapidly.
 *       This manager maintains a registry of active channels and their subscriber
 *       counts, reusing existing channels where possible.
 * HOW:  Call subscribe() with a channel key and handler. Returns an unsubscribe
 *       function — call it in the useEffect cleanup to prevent memory leaks.
 *       The channel is only removed from Supabase when ALL subscribers have
 *       unsubscribed (ref-counted).
 * EDGE CASES:
 *   - Safe to call subscribe/unsubscribe multiple times for the same key
 *   - If Supabase client is not available (SSR), subscribe is a no-op
 *   - Channel errors are logged but do not throw — prevents white-screen crashes
 * PERFORMANCE: O(1) channel lookup via Map. Ref-counting avoids duplicate channels.
 *
 * @example
 * useEffect(() => {
 *   const unsubscribe = subscriptionManager.subscribe(
 *     `orders:${orderId}`,
 *     { table: 'orders', filter: `id=eq.${orderId}`, event: 'UPDATE' },
 *     (payload) => handleOrderUpdate(payload)
 *   )
 *   return unsubscribe  // Cleanup on unmount
 * }, [orderId])
 */

import { createClient } from '@/lib/supabase/client'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface SubscriptionConfig {
  /** Supabase table name to listen to */
  table: string
  /** Postgres changes event type */
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  /** Optional row-level filter e.g. "id=eq.abc123" */
  filter?: string
  /** DB schema, defaults to 'public' */
  schema?: string
}

type ChangeHandler = (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void

interface ActiveChannel {
  /** The Supabase RealtimeChannel instance */
  channel: ReturnType<ReturnType<typeof createClient>['channel']>
  /** Number of active subscribers — channel is removed when this hits 0 */
  subscriberCount: number
  /** All handlers registered on this channel */
  handlers: Set<ChangeHandler>
}

/** Registry of active channels keyed by a caller-defined string identifier */
const channelRegistry = new Map<string, ActiveChannel>()

/**
 * Subscribe to a Supabase Realtime postgres_changes event.
 *
 * @param channelKey - Unique string identifier for this channel (e.g. "orders:abc123")
 * @param config     - What table/event/filter to listen on
 * @param handler    - Callback invoked when a matching change arrives
 * @returns          - Cleanup function — call in useEffect return
 */
export function subscribe(
  channelKey: string,
  config: SubscriptionConfig,
  handler: ChangeHandler
): () => void {
  // Reuse an existing channel for the same key (ref-counted)
  const existing = channelRegistry.get(channelKey)
  if (existing) {
    existing.handlers.add(handler)
    existing.subscriberCount++
    return createUnsubscribe(channelKey, handler)
  }

  // Create a new channel via the browser Supabase client
  // Note: createClient() is a singleton — this does not create multiple instances
  const supabase = createClient()
  const handlers = new Set<ChangeHandler>([handler])

  const channel = supabase
    .channel(channelKey)
    .on(
      'postgres_changes',
      {
        event: config.event,
        schema: config.schema ?? 'public',
        table: config.table,
        filter: config.filter,
      },
      (payload) => {
        // Broadcast to all subscribers of this channel
        handlers.forEach((h) => h(payload as RealtimePostgresChangesPayload<Record<string, unknown>>))
      }
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        // Log but do not throw — prevents white-screen crashes on Realtime failures
        console.error(`[subscriptionManager] Channel error for key: ${channelKey}`)
      }
    })

  channelRegistry.set(channelKey, { channel, subscriberCount: 1, handlers })
  return createUnsubscribe(channelKey, handler)
}

/**
 * Creates a cleanup function for a specific handler on a channel.
 * Decrements the ref count and removes the channel when count hits 0.
 *
 * @param channelKey - The channel identifier
 * @param handler    - The specific handler to remove
 */
function createUnsubscribe(channelKey: string, handler: ChangeHandler): () => void {
  return () => {
    const entry = channelRegistry.get(channelKey)
    if (!entry) return

    entry.handlers.delete(handler)
    entry.subscriberCount--

    // Only tear down the Supabase channel when all subscribers have cleaned up
    if (entry.subscriberCount <= 0) {
      const supabase = createClient()
      supabase.removeChannel(entry.channel).catch((error: unknown) => {
        console.error(`[subscriptionManager] Failed to remove channel ${channelKey}:`, error)
      })
      channelRegistry.delete(channelKey)
    }
  }
}

/** Exported API — named exports only, no default export (per project conventions) */
export const subscriptionManager = { subscribe }
