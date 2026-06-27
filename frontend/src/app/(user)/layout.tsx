'use client'

import { GlobalOrderTimer } from '@/components/tracker/GlobalOrderTimer'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <GlobalOrderTimer />
      {children}
    </div>
  )
}
