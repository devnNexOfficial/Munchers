'use client'
import Link from 'next/link'
import { Home, ShoppingCart, User, Receipt } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { GlobalOrderTimer } from '@/components/tracker/GlobalOrderTimer'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const itemCount = useCartStore((state) => state.getItemCount())

  return (
    <div className="min-h-screen bg-surface text-on-surface pb-safe pb-24">
      <div className="fixed inset-0 rustic-grain z-0 pointer-events-none" />
      <GlobalOrderTimer />
      <div className="relative z-10">
        {children}
      </div>
      {/* Bottom Navigation - Wild West Theme */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex
        h-20 items-center justify-around border-t border-outline-variant/30
        bg-surface-brown shadow-[0_-4px_20px_rgba(215,43,43,0.1)] px-2 max-w-screen-xl mx-auto">
        <Link href="/" className="flex flex-col items-center justify-center
          gap-0.5 text-on-surface-variant hover:text-primary transition-colors px-4 py-1.5 active:scale-90 rounded-xl">
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-label-sm font-medium">Home</span>
        </Link>
        <Link href="/track" className="flex flex-col items-center justify-center
          gap-0.5 text-on-surface-variant hover:text-primary transition-colors px-4 py-1.5 active:scale-90 rounded-xl">
          <Receipt className="h-5 w-5" />
          <span className="text-[10px] font-label-sm font-medium">Orders</span>
        </Link>
        <Link href="/cart" className="relative flex flex-col items-center justify-center
          gap-0.5 text-on-surface-variant hover:text-primary transition-colors px-4 py-1.5 active:scale-90 rounded-xl">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4
              items-center justify-center rounded-full bg-secondary
              text-on-secondary text-[9px] font-bold shadow-lg shadow-secondary/40">
              {itemCount > 9 ? '9+' : itemCount}
            </span>
          )}
          <span className="text-[10px] font-label-sm font-medium">Cart</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center justify-center
          gap-0.5 text-on-surface-variant hover:text-primary transition-colors px-4 py-1.5 active:scale-90 rounded-xl">
          <User className="h-5 w-5" />
          <span className="text-[10px] font-label-sm font-medium">Profile</span>
        </Link>
      </nav>
    </div>
  )
}
