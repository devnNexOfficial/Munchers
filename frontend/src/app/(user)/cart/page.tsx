import type { Metadata } from 'next'

import { CartPage } from '@/components/cart/CartPage'

export function generateMetadata(): Metadata {
  return {
    title: 'Your Cart | Muncherz',
  }
}

export default function Page() {
  return <CartPage />
}
