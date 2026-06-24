'use client'

import { useEffect } from 'react'
import { useProfileStore } from '@/store/useProfileStore'

export function RTLProvider({ children }: { children: React.ReactNode }) {
  const isRTL = useProfileStore((state) => state.isRTL)

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = isRTL ? 'ur' : 'en'
  }, [isRTL])

  return <>{children}</>
}
