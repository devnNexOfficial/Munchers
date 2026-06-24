/**
 * OBSERVER PATTERN: SubscriptionManager
 * WHAT: Centralizes all Supabase Realtime subscriptions.
 * WHY: Prevents duplicate subscriptions on re-render,
 *      ensures clean teardown on unmount, and provides
 *      a single audit point for all realtime channels.
 * HOW: Maintains a registry of active channels keyed by
 *      channel name. Returns an unsubscribe function.
 * PERFORMANCE: O(1) register/lookup via Map.
 */
import type { RealtimeChannel } from '@supabase/supabase-js';

type ChannelFactory = () => RealtimeChannel;

const activeChannels = new Map<string, RealtimeChannel>();

/**
 * Registers a realtime subscription channel.
 * If a channel with the same name already exists, it is
 * removed and replaced (prevents duplicates).
 * @param name - Unique channel identifier
 * @param factory - Function that creates and subscribes the channel
 * @returns Cleanup function — call on component unmount
 */
export function subscribeToChannel(
  name: string,
  factory: ChannelFactory
): () => void {
  // Cleanup existing channel with same name
  const existing = activeChannels.get(name);
  if (existing) {
    existing.unsubscribe();
    activeChannels.delete(name);
  }

  const channel = factory();
  activeChannels.set(name, channel);

  return () => {
    const ch = activeChannels.get(name);
    if (ch) {
      ch.unsubscribe();
      activeChannels.delete(name);
    }
  };
}

/**
 * Unsubscribes from all active channels.
 * Called during app-wide cleanup (e.g., logout).
 */
export function unsubscribeAll(): void {
  for (const [name, channel] of activeChannels.entries()) {
    channel.unsubscribe();
    activeChannels.delete(name);
  }
}

/**
 * Returns the count of active subscriptions.
 * Useful for debugging or monitoring.
 */
export function getActiveSubscriptionCount(): number {
  return activeChannels.size;
}
