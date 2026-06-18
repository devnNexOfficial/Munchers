import type { CheckoutLineItem } from './cart'

export type OrderStatus =
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'dispatched'
  | 'completed'
  | 'cancelled'

export interface Order {
  id: string
  restaurant_id: string
  customer_phone: string
  items: CheckoutLineItem[]
  subtotal: number
  delivery_fee: number
  final_total: number
  status: OrderStatus
  special_instructions: string
  created_at: string
}
