'use client'
import Link from 'next/link'
import { Home, ShoppingCart, User } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { GlobalOrderTimer } from '@/components/tracker/GlobalOrderTimer'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const itemCount = useCartStore((state) => state.getItemCount())

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20">
      <GlobalOrderTimer />
      {children}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex
        h-16 items-center justify-around border-t border-gray-100
        bg-white shadow-lg">
        <Link href="/" className="flex flex-col items-center
          gap-0.5 text-gray-500 hover:text-[#D62828]">
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link href="/cart" className="relative flex flex-col
          items-center gap-0.5 text-gray-500 hover:text-[#D62828]">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -right-2 -top-1 flex h-4 w-4
              items-center justify-center rounded-full bg-[#D62828]
              text-[9px] font-bold text-white">
              {itemCount > 9 ? '9+' : itemCount}
            </span>
          )}
          <span className="text-[10px] font-medium">Cart</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center
          gap-0.5 text-gray-500 hover:text-[#D62828]">
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </nav>
    </div>
  )
}
