import { z } from 'zod'

import { paymentMethodSchema } from '@/lib/validators/checkout'
import type { CartItem } from '@/store/useCartStore'

const PENDING_PAYMENT_KEY = 'muncherz.pendingPayment'
const PENDING_PAYMENT_TTL_MS = 30 * 60 * 1000

const ingredientSelectionSchema = z.object({
  ingredientId: z.string(),
  qty: z.number().int().positive(),
  isCore: z.boolean(),
  tier: z.enum(['low', 'medium', 'high']).optional(),
})

const selectedMealOptionSchema = z.object({
  optionId: z.string(),
  nameEn: z.string(),
  quantity: z.number().int().positive(),
  extraPrice: z.number(),
})

const cartItemSchema = z.object({
  cartItemId: z.string(),
  menuItemId: z.string(),
  name: z.string(),
  imageUrl: z.string(),
  basePrice: z.number(),
  selections: z.array(ingredientSelectionSchema),
  mealOptions: z.array(selectedMealOptionSchema),
  totalPrice: z.number(),
  quantity: z.number().int().positive(),
  specialInstructions: z.string(),
  savedCreationName: z.string().optional(),
}) satisfies z.ZodType<CartItem>

export const pendingPaymentSchema = z.object({
  orderId: z.string().min(1),
  cartSnapshot: z.array(cartItemSchema),
  totalAmount: z.number().nonnegative(),
  paymentMethod: paymentMethodSchema,
  timestamp: z.number().int().positive(),
})

export type PendingPaymentData = z.infer<typeof pendingPaymentSchema>

function hasSessionStorage() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'
}

function encodePayload(value: string) {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  // TODO: replace btoa with Web Crypto API - Section 32
  return btoa(binary)
}

function decodePayload(value: string) {
  const binary = atob(value)
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function savePendingPayment(data: PendingPaymentData): void {
  if (!hasSessionStorage()) return

  const parsed = pendingPaymentSchema.parse(data)
  const encoded = encodePayload(JSON.stringify(parsed))
  window.sessionStorage.setItem(PENDING_PAYMENT_KEY, encoded)
}

export function getPendingPayment(): PendingPaymentData | null {
  if (!hasSessionStorage()) return null

  const encoded = window.sessionStorage.getItem(PENDING_PAYMENT_KEY)
  if (!encoded) return null

  try {
    const payload: unknown = JSON.parse(decodePayload(encoded))
    const parsed = pendingPaymentSchema.safeParse(payload)
    if (!parsed.success) {
      clearPendingPayment()
      return null
    }

    if (Date.now() - parsed.data.timestamp > PENDING_PAYMENT_TTL_MS) {
      clearPendingPayment()
      return null
    }

    return parsed.data
  } catch {
    clearPendingPayment()
    return null
  }
}

export function clearPendingPayment(): void {
  if (!hasSessionStorage()) return
  window.sessionStorage.removeItem(PENDING_PAYMENT_KEY)
}
